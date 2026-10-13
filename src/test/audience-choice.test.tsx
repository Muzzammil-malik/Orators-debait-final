import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { Match, Team } from "@/content/tournament";
import { PeopleChoice } from "@/components/debait/scoreboard/PeopleChoice";
import { getAudienceChoice } from "@/lib/audience-choice";

const makeTeam = (id: string, number: number, name: string): Team => ({
  id,
  number,
  name,
  status: "registered",
  members: [],
});

const teamA = makeTeam("team-a", 1, "Team A");
const teamB = makeTeam("team-b", 2, "Team B");
const teamC = makeTeam("team-c", 3, "Team C");

const makeMatch = (
  matchNumber: number,
  round: Match["round"],
  teamAValue: Team,
  teamBValue: Team,
  votesA: number,
  votesB: number,
): Match => ({
  id: `match-${matchNumber}`,
  matchNumber,
  round,
  roundLabel: `Match ${matchNumber}`,
  stageName: `Stage ${matchNumber}`,
  motion: "",
  zone: 1,
  status: "completed",
  teamA: teamAValue,
  teamB: teamBValue,
  votes: {
    teamA: 50,
    teamB: 50,
    totalVotes: votesA + votesB,
    teamAVotes: votesA,
    teamBVotes: votesB,
  },
  votingStatus: "closed",
});

describe("People's Choice", () => {
  afterEach(cleanup);

  it("aggregates exact team vote counts across all tournament rounds", () => {
    const matches = [
      makeMatch(1, "preliminary", teamA, teamB, 4, 2),
      makeMatch(2, "quarterfinal", teamC, teamA, 1, 5),
      makeMatch(3, "final", teamB, teamC, 2, 4),
    ];

    expect(getAudienceChoice(matches)).toEqual({
      status: "leader",
      team: teamA,
      votes: 9,
    });
  });

  it("returns an empty state when there are no audience votes", () => {
    expect(getAudienceChoice([makeMatch(1, "preliminary", teamA, teamB, 0, 0)])).toEqual({
      status: "empty",
    });
  });

  it("returns every team tied for the highest vote count", () => {
    expect(
      getAudienceChoice([
        makeMatch(1, "quarterfinal", teamA, teamB, 7, 7),
        makeMatch(2, "semifinal", teamC, teamA, 4, 0),
      ]),
    ).toEqual({ status: "tie", teams: [teamA, teamB], votes: 7 });
  });

  it("shows a neutral empty-vote message and does not invent a winner", () => {
    const match = makeMatch(1, "preliminary", teamA, teamB, 0, 0);
    render(<PeopleChoice matches={[match]} isLoading={false} hasError={false} />);

    expect(screen.getByText("The audience is ready to decide.")).toBeInTheDocument();
    expect(screen.queryByText("Team A")).not.toBeInTheDocument();
  });

  it("displays all tied leaders without arbitrarily selecting one", () => {
    const match = makeMatch(1, "preliminary", teamA, teamB, 5, 5);
    render(<PeopleChoice matches={[match]} isLoading={false} hasError={false} />);

    expect(screen.getByText("It’s a tie!")).toBeInTheDocument();
    expect(screen.getByText("Team A · Team B")).toBeInTheDocument();
  });

  it("updates the displayed choice when refreshed match totals change the leader", () => {
    const { rerender } = render(
      <PeopleChoice
        matches={[makeMatch(1, "preliminary", teamA, teamB, 6, 3)]}
        isLoading={false}
        hasError={false}
      />,
    );
    expect(screen.getByText("Team A")).toBeInTheDocument();

    rerender(
      <PeopleChoice
        matches={[makeMatch(1, "preliminary", teamA, teamB, 3, 7)]}
        isLoading={false}
        hasError={false}
      />,
    );

    expect(screen.getByText("Team B")).toBeInTheDocument();
    expect(screen.queryByText("Team A")).not.toBeInTheDocument();
  });
});
