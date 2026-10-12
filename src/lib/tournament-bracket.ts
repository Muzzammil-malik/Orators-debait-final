import type { Match, MatchRound, TournamentTree } from "@/content/tournament";

export const PRELIMINARY_SEEDING = [
  { preliminary: 1, semifinal: 1, side: "teamA" },
  { preliminary: 2, semifinal: 1, side: "teamB" },
  { preliminary: 3, semifinal: 2, side: "teamA" },
  { preliminary: 4, semifinal: 2, side: "teamB" },
  { preliminary: 5, semifinal: 3, side: "teamA" },
  { preliminary: 6, semifinal: 3, side: "teamB" },
  { preliminary: 7, semifinal: 4, side: "teamA" },
  { preliminary: 8, semifinal: 4, side: "teamB" },
] as const;

export const formatMatchLabel = (round: MatchRound, number: number): string => {
  const ordinal = String(number).padStart(2, "0");
  if (round === "preliminary") return `PRELIM ${ordinal}`;
  if (round === "semifinal") return `SEMIFINAL ${ordinal}`;
  return `GRAND FINAL ${ordinal}`;
};

export const formatMatchStageName = (round: MatchRound, number: number): string => {
  const ordinal = String(number).padStart(2, "0");
  if (round === "preliminary") return `Preliminaries · Match ${ordinal}`;
  if (round === "semifinal") return `Semifinal · Match ${ordinal}`;
  return `Grand Final · Match ${ordinal}`;
};

const numberMatchesByRound = (matches: Match[], round: MatchRound): Match[] =>
  matches
    .filter((match) => match.round === round)
    .sort((first, second) => first.matchNumber - second.matchNumber)
    .map((match, index) => ({
      ...match,
      roundLabel: formatMatchLabel(round, index + 1),
      stageName: formatMatchStageName(round, index + 1),
    }));

const getWinner = (match: Match | undefined) => {
  if (match?.status !== "completed" || !match.winnerTeamId) return undefined;
  const winner = [match.teamA, match.teamB].find((team) => team?.id === match.winnerTeamId);
  if (!winner) {
    throw new Error(`Completed match ${match.roundLabel} has no assigned winning team.`);
  }
  return winner;
};

export function buildTournamentTree(matches: Match[]): TournamentTree {
  const preliminaries = numberMatchesByRound(matches, "preliminary");
  const semiFinals = numberMatchesByRound(matches, "semifinal");
  const finals = numberMatchesByRound(matches, "final");

  if (finals.length > 1) {
    throw new Error("The tournament bracket can only contain one Grand Final match.");
  }

  const preliminaryWinners = new Set<string>();
  const semifinalParticipants: Match[] = semiFinals.map((match) => ({
    ...match,
    teamA: undefined,
    teamB: undefined,
  }));

  for (const seed of PRELIMINARY_SEEDING) {
    const winner = getWinner(preliminaries[seed.preliminary - 1]);
    if (!winner) continue;
    if (preliminaryWinners.has(winner.id)) {
      throw new Error(`Team ${winner.name} won more than one preliminary match.`);
    }
    preliminaryWinners.add(winner.id);

    const target = semifinalParticipants[seed.semifinal - 1];
    if (target) target[seed.side] = winner;
  }

  const final = finals[0];
  const champion = final?.winnerTeamId
    ? [final.teamA, final.teamB].find((team) => team?.id === final.winnerTeamId)
    : undefined;

  return {
    preliminaries,
    semiFinals: semifinalParticipants,
    ...(final ? { final } : {}),
    ...(champion ? { champion } : {}),
  };
}
