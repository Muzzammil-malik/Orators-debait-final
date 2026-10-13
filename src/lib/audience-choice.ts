import type { Match, Team } from "@/content/tournament";

export type AudienceChoice =
  | { status: "empty" }
  | { status: "leader"; team: Team; votes: number }
  | { status: "tie"; teams: Team[]; votes: number };

export function getAudienceChoice(matches: Match[]): AudienceChoice {
  const totals = new Map<string, { team: Team; votes: number }>();

  for (const match of matches) {
    for (const [team, votes] of [
      [match.teamA, match.votes.teamAVotes],
      [match.teamB, match.votes.teamBVotes],
    ] as const) {
      if (!team || !Number.isSafeInteger(votes) || votes < 0) continue;
      const current = totals.get(team.id);
      totals.set(team.id, { team, votes: (current?.votes ?? 0) + votes });
    }
  }

  const highestVotes = Math.max(0, ...Array.from(totals.values(), ({ votes }) => votes));
  if (highestVotes === 0) return { status: "empty" };

  const leaders = Array.from(totals.values())
    .filter(({ votes }) => votes === highestVotes)
    .map(({ team }) => team)
    .sort((teamA, teamB) => teamA.number - teamB.number || teamA.name.localeCompare(teamB.name));

  return leaders.length === 1
    ? { status: "leader", team: leaders[0]!, votes: highestVotes }
    : { status: "tie", teams: leaders, votes: highestVotes };
}
