import { describe, expect, it } from "vitest";
import type { Match, MatchRound, Team } from "@/content/tournament";
import { buildTournamentTree } from "@/lib/tournament-bracket";

const team = (id: string): Team => ({
  id,
  number: Number(id.replace(/\D/g, "")) || 1,
  name: id,
  status: "registered",
  members: [],
});

const makeMatch = (
  round: MatchRound,
  matchNumber: number,
  status: Match["status"] = "upcoming",
  winnerTeamId?: string,
): Match => ({
  id: `${round}-${matchNumber}`,
  matchNumber,
  round,
  roundLabel: "Incorrect repeated label",
  stageName: "Incorrect repeated stage",
  motion: "",
  zone: 1,
  status,
  teamA: team(`${round}-${matchNumber}-A`),
  teamB: team(`${round}-${matchNumber}-B`),
  winnerTeamId,
  votes: { teamA: 50, teamB: 50, totalVotes: 0 },
  votingStatus: "upcoming",
});

describe("tournament bracket progression", () => {
  it("assigns unique round labels and seeds semifinal slots from preliminary winners", () => {
    const preliminaries = Array.from({ length: 8 }, (_, index) => {
      const matchNumber = index + 1;
      const match = makeMatch("preliminary", matchNumber, "completed");
      return { ...match, winnerTeamId: match.teamA!.id };
    });
    const semiFinals = Array.from({ length: 4 }, (_, index) =>
      makeMatch("semifinal", index + 9),
    );
    const final = makeMatch("final", 13);
    const tree = buildTournamentTree([...preliminaries, ...semiFinals, final].reverse());

    expect(tree.preliminaries.map((match) => match.roundLabel)).toEqual(
      Array.from({ length: 8 }, (_, index) => `PRELIM ${String(index + 1).padStart(2, "0")}`),
    );
    expect(tree.semiFinals.map((match) => match.roundLabel)).toEqual(
      Array.from({ length: 4 }, (_, index) => `SEMIFINAL ${String(index + 1).padStart(2, "0")}`),
    );
    expect(tree.final?.roundLabel).toBe("GRAND FINAL 01");
    expect(tree.semiFinals.map((match) => [match.teamA?.id, match.teamB?.id])).toEqual([
      ["preliminary-1-A", "preliminary-2-A"],
      ["preliminary-3-A", "preliminary-4-A"],
      ["preliminary-5-A", "preliminary-6-A"],
      ["preliminary-7-A", "preliminary-8-A"],
    ]);
    expect(tree.semiFinals.map((match) => match.stageName)).toEqual([
      "Semifinal · Match 01",
      "Semifinal · Match 02",
      "Semifinal · Match 03",
      "Semifinal · Match 04",
    ]);
  });

  it("shows waiting semifinal slots until preliminary results are decided", () => {
    const preliminaries = Array.from({ length: 8 }, (_, index) =>
      makeMatch("preliminary", index + 1),
    );
    const semiFinals = Array.from({ length: 4 }, (_, index) =>
      makeMatch("semifinal", index + 9),
    );
    const tree = buildTournamentTree([...preliminaries, ...semiFinals]);

    expect(tree.semiFinals.every((match) => !match.teamA && !match.teamB)).toBe(true);
  });

  it("updates the downstream semifinal participant when a preliminary winner changes", () => {
    const preliminaries = Array.from({ length: 8 }, (_, index) => {
      const match = makeMatch("preliminary", index + 1, "completed");
      return { ...match, winnerTeamId: match.teamA!.id };
    });
    const semiFinals = Array.from({ length: 4 }, (_, index) =>
      makeMatch("semifinal", index + 9),
    );
    const changedWinner = preliminaries[0]!.teamB!.id;
    preliminaries[0] = { ...preliminaries[0]!, winnerTeamId: changedWinner };

    const tree = buildTournamentTree([...preliminaries, ...semiFinals]);

    expect(tree.semiFinals[0]?.teamA?.id).toBe(changedWinner);
  });

  it("preserves the admin-assigned Grand Final teams", () => {
    const semifinal = makeMatch("semifinal", 9, "completed");
    const final = {
      ...makeMatch("final", 13),
      teamA: team("admin-finalist-a"),
      teamB: team("admin-finalist-b"),
    };
    const tree = buildTournamentTree([
      { ...semifinal, winnerTeamId: semifinal.teamA!.id },
      final,
    ]);

    expect(tree.final?.teamA?.id).toBe("admin-finalist-a");
    expect(tree.final?.teamB?.id).toBe("admin-finalist-b");
  });

  it("rejects duplicate preliminary qualifiers instead of assigning a team twice", () => {
    const firstMatch = makeMatch("preliminary", 1, "completed");
    const secondMatch = makeMatch("preliminary", 2, "completed");
    const duplicateWinnerId = firstMatch.teamA!.id;
    const preliminaries = [
      { ...firstMatch, winnerTeamId: duplicateWinnerId },
      { ...secondMatch, teamB: team(duplicateWinnerId), winnerTeamId: duplicateWinnerId },
    ];

    expect(() => buildTournamentTree(preliminaries)).toThrow(/won more than one preliminary/i);
  });
});
