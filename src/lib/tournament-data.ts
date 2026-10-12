import type {
  Match,
  MatchRound,
  MatchStatus,
  ScoreBreakdown,
  Team,
  TeamMember,
  TeamStatus,
  TournamentTree,
  VotingStatus,
  ZoneNumber,
} from "@/content/tournament";
import type { Database } from "@/lib/database.types";
import { requireSupabase } from "@/lib/supabase";
import { buildTournamentTree } from "@/lib/tournament-bracket";

type TeamRow = Database["public"]["Tables"]["teams"]["Row"];
type MatchRow = Database["public"]["Tables"]["matches"]["Row"];
type ScoreRow = Database["public"]["Tables"]["match_scores"]["Row"];
type VoteTotalRow = Database["public"]["Tables"]["match_vote_totals"]["Row"];
type MemberRow = Database["public"]["Tables"]["team_members"]["Row"];

export interface TournamentSnapshot {
  tree: TournamentTree;
  teams: Team[];
  activeTeams: Team[];
}

export interface MutationResult {
  success: boolean;
  error?: string;
}

const throwIfError = (error: { message: string } | null): void => {
  if (error) throw new Error(error.message);
};

const toTeam = (row: TeamRow, members: TeamMember[] = []): Team => ({
  id: row.id,
  number: row.registration_number,
  name: row.name,
  stream: row.stream ?? undefined,
  status: row.status as Team["status"],
  members,
  updatedAt: row.updated_at,
});

const toScore = (row: ScoreRow | undefined): ScoreBreakdown | undefined =>
  row
    ? {
        content: row.content_score,
        strategy: row.strategy_score,
        style: row.style_score,
        total: row.total_score ?? row.content_score + row.strategy_score + row.style_score,
      }
    : undefined;

const toMatch = (
  row: MatchRow,
  teams: Map<string, Team>,
  scores: Map<string, ScoreRow>,
  voteTotals: Map<string, VoteTotalRow>,
): Match => {
  const scoreA = scores.get(`${row.id}:team_a`);
  const scoreB = scores.get(`${row.id}:team_b`);
  const votes = voteTotals.get(row.id);
  const totalVotes = votes?.total_votes ?? 0;
  const voteA = votes?.team_a_votes ?? 0;
  const voteB = votes?.team_b_votes ?? 0;
  const percentageA = totalVotes ? Math.round((voteA / totalVotes) * 100) : 50;

  return {
    id: row.id,
    matchNumber: row.match_number,
    round: row.round as MatchRound,
    roundLabel: row.round_label,
    stageName: row.stage_name,
    motion: row.motion ?? "",
    zone: row.zone as ZoneNumber,
    switchRoundTriggered: row.switch_round_triggered,
    status: row.status as MatchStatus,
    teamA: row.team_a_id ? teams.get(row.team_a_id) : undefined,
    teamB: row.team_b_id ? teams.get(row.team_b_id) : undefined,
    scoreA: toScore(scoreA),
    scoreB: toScore(scoreB),
    winnerTeamId: row.winner_team_id ?? undefined,
    scheduledTime: row.scheduled_at ? new Date(row.scheduled_at).toLocaleString() : undefined,
    completedTime: row.completed_at ? new Date(row.completed_at).toLocaleTimeString() : undefined,
    court: row.court ?? undefined,
    votes: {
      teamA: percentageA,
      teamB: totalVotes ? 100 - percentageA : 50,
      totalVotes,
    },
    votingStatus: row.voting_status as VotingStatus,
    updatedAt: row.updated_at,
    scoreUpdatedAt: [scoreA?.updated_at, scoreB?.updated_at].filter(Boolean).sort().at(-1),
  };
};

const buildTree = (
  matchRows: MatchRow[],
  teamRows: TeamRow[],
  scoreRows: ScoreRow[],
  voteRows: VoteTotalRow[],
): TournamentTree => {
  const teams = new Map(teamRows.map((row) => [row.id, toTeam(row)]));
  const scores = new Map(scoreRows.map((row) => [`${row.match_id}:${row.side}`, row]));
  const voteTotals = new Map(voteRows.map((row) => [row.match_id, row]));
  const matches = matchRows.map((row) => toMatch(row, teams, scores, voteTotals));
  return buildTournamentTree(matches);
};

export async function fetchTournamentSnapshot(): Promise<TournamentSnapshot> {
  const client = requireSupabase();
  const [teamResult, matchResult, scoreResult, voteResult] = await Promise.all([
    client
      .from("teams")
      .select("id, registration_number, name, stream, status, is_active, created_at, updated_at")
      .order("registration_number"),
    client.from("matches").select("*").order("match_number"),
    client.from("match_scores").select("*"),
    client.from("match_vote_totals").select("*"),
  ]);
  throwIfError(teamResult.error);
  throwIfError(matchResult.error);
  throwIfError(scoreResult.error);
  throwIfError(voteResult.error);

  const tree = buildTree(matchResult.data, teamResult.data, scoreResult.data, voteResult.data);
  return {
    tree,
    teams: teamResult.data.map((row) => toTeam(row)),
    activeTeams: teamResult.data.filter((row) => row.is_active).map((row) => toTeam(row)),
  };
}

export async function fetchAdminTeams(): Promise<Team[]> {
  const client = requireSupabase();
  const { data: teamRows, error: teamError } = await client
    .from("teams")
    .select("id, registration_number, name, stream, status, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("registration_number");
  throwIfError(teamError);
  if (!teamRows.length) return [];

  const { data: memberRows, error: memberError } = await client
    .from("team_members")
    .select("id, team_id, name, created_at, updated_at")
    .in(
      "team_id",
      teamRows.map((team) => team.id),
    );
  throwIfError(memberError);
  const membersByTeam = new Map<string, TeamMember[]>();
  (memberRows as MemberRow[]).forEach((member) => {
    const members = membersByTeam.get(member.team_id) ?? [];
    members.push({ id: member.id, name: member.name });
    membersByTeam.set(member.team_id, members);
  });

  return teamRows.map((team) => toTeam(team, membersByTeam.get(team.id) ?? []));
}

export async function saveTeam(input: {
  id?: string;
  updatedAt?: string;
  name: string;
  stream?: string;
  status?: TeamStatus;
  members: TeamMember[];
}): Promise<MutationResult> {
  const client = requireSupabase();
  const { error } = await client.rpc("save_team", {
    p_team_id: input.id ?? null,
    p_name: input.name.trim(),
    p_stream: input.stream?.trim() ?? "",
    p_status: input.status ?? "registered",
    p_expected_updated_at: input.updatedAt ?? null,
    p_members: input.members.map((member) => ({ id: member.id, name: member.name.trim() })),
  });
  return error ? { success: false, error: error.message } : { success: true };
}

export async function archiveTeam(teamId: string): Promise<MutationResult> {
  const { error } = await requireSupabase().rpc("archive_team", { p_team_id: teamId });
  return error ? { success: false, error: error.message } : { success: true };
}

export async function createMatch(input: {
  round: MatchRound;
  roundLabel: string;
  stageName: string;
  teamAId: string;
  teamBId: string;
  court?: string;
  motion?: string;
  status?: MatchStatus;
}): Promise<MutationResult> {
  const client = requireSupabase();
  const { error } = await client.from("matches").insert({
    round: input.round,
    round_label: input.roundLabel,
    stage_name: input.stageName,
    team_a_id: input.teamAId,
    team_b_id: input.teamBId,
    motion: input.motion?.trim() || null,
    court: input.court?.trim() || null,
    status: input.status ?? "upcoming",
    voting_status: "upcoming",
    zone: 1,
    switch_round_triggered: false,
    is_public: true,
    winner_team_id: null,
    scheduled_at: new Date().toISOString(),
  });
  return error ? { success: false, error: error.message } : { success: true };
}

export async function deleteMatch(matchId: string): Promise<MutationResult> {
  const { data, error } = await requireSupabase()
    .from("matches")
    .delete()
    .eq("id", matchId)
    .select("id")
    .maybeSingle();
  if (error) return { success: false, error: error.message };
  return data
    ? { success: true }
    : { success: false, error: "Match was not found or cannot be removed." };
}

export async function assignMatchTeam(
  matchId: string,
  side: "teamA" | "teamB",
  teamId: string | null,
  expectedUpdatedAt?: string,
): Promise<MutationResult> {
  const client = requireSupabase();
  const column = side === "teamA" ? "team_a_id" : "team_b_id";
  let query = client
    .from("matches")
    .update({ [column]: teamId, updated_at: new Date().toISOString() })
    .eq("id", matchId);

  if (expectedUpdatedAt) {
    query = query.eq("updated_at", expectedUpdatedAt);
  }

  const { data, error } = await query.select("id").maybeSingle();
  if (error) return { success: false, error: error.message };
  return data
    ? { success: true }
    : { success: false, error: "Match changed elsewhere. Refresh and try again." };
}

async function updateMatch(
  matchId: string,
  fields: Database["public"]["Tables"]["matches"]["Update"],
  expectedUpdatedAt?: string,
): Promise<MutationResult> {
  const client = requireSupabase();
  let query = client
    .from("matches")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", matchId);

  if (expectedUpdatedAt) {
    query = query.eq("updated_at", expectedUpdatedAt);
  }

  const { data, error } = await query.select("id").maybeSingle();
  if (error) return { success: false, error: error.message };
  return data
    ? { success: true }
    : { success: false, error: "Match changed elsewhere. Refresh and try again." };
}

export async function updateMatchStatus(
  matchId: string,
  status: MatchStatus,
  winnerTeamId?: string,
  expectedUpdatedAt?: string,
): Promise<MutationResult> {
  return updateMatch(
    matchId,
    {
      status,
      winner_team_id: winnerTeamId ?? null,
      voting_status:
        status === "completed" ? "closed" : status === "upcoming" ? "upcoming" : undefined,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    },
    expectedUpdatedAt,
  );
}

export async function updateMatchZone(
  matchId: string,
  zone: ZoneNumber,
  expectedUpdatedAt?: string,
): Promise<MutationResult> {
  return updateMatch(matchId, { zone }, expectedUpdatedAt);
}

export async function toggleSwitchRound(
  matchId: string,
  currentValue: boolean,
  expectedUpdatedAt?: string,
): Promise<MutationResult> {
  return updateMatch(matchId, { switch_round_triggered: !currentValue }, expectedUpdatedAt);
}

export async function setVotingStatus(
  matchId: string,
  status: VotingStatus,
  expectedUpdatedAt?: string,
): Promise<MutationResult> {
  return updateMatch(matchId, { voting_status: status }, expectedUpdatedAt);
}

export async function saveMatchScores(
  match: Match,
  scoreA: ScoreBreakdown,
  scoreB: ScoreBreakdown,
): Promise<MutationResult> {
  const values = [scoreA, scoreB];
  const limits = { content: 40, strategy: 30, style: 30 };
  if (!match.teamA || !match.teamB)
    return { success: false, error: "Assign both teams before entering scores." };
  for (const score of values) {
    if (
      Object.entries(limits).some(([key, limit]) => {
        const value = score[key as keyof typeof limits];
        return !Number.isInteger(value) || value < 0 || value > limit;
      })
    ) {
      return {
        success: false,
        error: "Scores must use whole numbers within the official 40/30/30 rubric.",
      };
    }
  }

  const { error } = await requireSupabase().rpc("save_match_scores", {
    p_match_id: match.id,
    p_expected_updated_at: match.scoreUpdatedAt ?? null,
    p_score_a: { content: scoreA.content, strategy: scoreA.strategy, style: scoreA.style },
    p_score_b: { content: scoreB.content, strategy: scoreB.strategy, style: scoreB.style },
  });
  return error ? { success: false, error: error.message } : { success: true };
}

export async function castAudienceVote(matchId: string, teamId: string): Promise<MutationResult> {
  const client = requireSupabase();
  let {
    data: { session },
  } = await client.auth.getSession();
  if (
    session &&
    session.user.app_metadata.provider !== "anonymous" &&
    session.user.is_anonymous !== true
  ) {
    return { success: false, error: "Audience voting requires an anonymous voter session." };
  }
  if (!session) {
    const { data, error } = await client.auth.signInAnonymously();
    if (error) return { success: false, error: error.message };
    session = data.session;
  }
  if (!session) return { success: false, error: "Could not start an audience voting session." };

  const { error } = await client.from("audience_votes").insert({
    match_id: matchId,
    team_id: teamId,
    voter_id: session.user.id,
  });
  if (error) {
    return {
      success: false,
      error:
        error.code === "23505"
          ? "A ballot has already been recorded for this match."
          : error.message,
    };
  }
  return { success: true };
}

export function getAllMatches(tree: TournamentTree): Match[] {
  return [...tree.preliminaries, ...tree.semiFinals, ...(tree.final ? [tree.final] : [])];
}
