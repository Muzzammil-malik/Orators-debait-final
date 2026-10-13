import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { Match, Team } from "@/content/tournament";
import { AdminAuthService } from "@/lib/admin-api";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { MatchManagement } from "@/components/admin/MatchManagement";
import { ScoreEntry } from "@/components/admin/ScoreEntry";
import { TeamManagement } from "@/components/admin/TeamManagement";
import { AudienceVoting } from "@/components/debait/scoreboard/AudienceVoting";
import { TournamentBracket } from "@/components/debait/scoreboard/TournamentBracket";
import * as useAdminTournamentModule from "@/hooks/useAdminTournament";

const makeTeam = (number: number): Team => ({
  id: `test-team-${number}`,
  number,
  name: `Team ${number}`,
  status: "registered",
  members: Array.from({ length: 3 }, (_, index) => ({
    id: `test-team-${number}-member-${index + 1}`,
    name: `Member ${index + 1}`,
  })),
});

const makeMatch = (): Match => ({
  id: "test-match-1",
  matchNumber: 1,
  round: "preliminary",
  roundLabel: "Prelim 01",
  stageName: "Preliminaries · Match 01",
  motion: "",
  zone: 1,
  status: "upcoming",
  teamA: makeTeam(1),
  teamB: makeTeam(2),
  votes: { teamA: 50, teamB: 50, totalVotes: 0 },
  votingStatus: "upcoming",
});

describe("DE'BAIT Supabase-backed operational UI", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("requires email and password and does not create a browser-local admin session", async () => {
    const result = await AdminAuthService.login("", "");
    expect(result.success).toBe(false);
    expect(result.error).toContain("email and password");
    expect(sessionStorage.length).toBe(0);
  });

  it("submits the administrator email and password through the Auth service", async () => {
    const login = vi.spyOn(AdminAuthService, "login").mockResolvedValue({ success: true });
    const onSuccess = vi.fn();
    render(<AdminLogin onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/Administrator Email/i), {
      target: { value: "operator@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Administrator Password/i), {
      target: { value: "correct horse battery staple" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Enter Operational Desk/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(login).toHaveBeenCalledWith("operator@example.com", "correct horse battery staple");
    expect(sessionStorage.length).toBe(0);
  });

  it("validates the official score rubric before sending a score mutation", async () => {
    const saveScores = vi.fn().mockResolvedValue({ success: true });
    render(<ScoreEntry activeMatch={makeMatch()} onSaveScores={saveScores} />);

    const contentInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(contentInputs[0]!, { target: { value: "41" } });
    expect(screen.getByRole("button", { name: /Record Official Scores/i })).toBeDisabled();
    expect(saveScores).not.toHaveBeenCalled();
  });

  it("submits both score sides and reports a successful server response", async () => {
    const saveScores = vi.fn().mockResolvedValue({ success: true });
    render(<ScoreEntry activeMatch={makeMatch()} onSaveScores={saveScores} />);

    fireEvent.click(screen.getByRole("button", { name: /Record Official Scores/i }));
    await waitFor(() => expect(saveScores).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(screen.getByText(/successfully recorded and synced/i)).toBeInTheDocument(),
    );
  });

  it("switches the admin dashboard into score entry when a recent result is selected", async () => {
    const completedMatch: Match = {
      ...makeMatch(),
      id: "completed-match-1",
      roundLabel: "Prelim 01",
      stageName: "Preliminaries · Match 01",
      status: "completed",
      winnerTeamId: "test-team-1",
      teamA: makeTeam(1),
      teamB: makeTeam(2),
      scoreA: { content: 31, strategy: 26, style: 24, total: 81 },
      scoreB: { content: 28, strategy: 22, style: 20, total: 70 },
    };

    vi.spyOn(useAdminTournamentModule, "useAdminTournament").mockReturnValue({
      tree: {
        preliminaries: [completedMatch],
        quarterFinals: [],
        semiFinals: [],
      },
      allMatches: [completedMatch],
      allTeams: [makeTeam(1), makeTeam(2)],
      activeMatch: completedMatch,
      activeMatchId: completedMatch.id,
      setActiveMatchId: vi.fn(),
      updateScores: vi.fn().mockResolvedValue({ success: true }),
      updateStatus: vi.fn().mockResolvedValue({ success: true }),
      setZone: vi.fn().mockResolvedValue({ success: true }),
      toggleSwitch: vi.fn().mockResolvedValue({ success: true }),
      setVoting: vi.fn().mockResolvedValue({ success: true }),
      updateTeam: vi.fn().mockResolvedValue({ success: true }),
      createTeam: vi.fn().mockResolvedValue({ success: true }),
      createMatch: vi.fn().mockResolvedValue({ success: true }),
      deleteMatch: vi.fn().mockResolvedValue({ success: true }),
      deleteTeam: vi.fn().mockResolvedValue({ success: true }),
      assignMatchTeam: vi.fn().mockResolvedValue({ success: true }),
      isLoading: false,
      error: null,
      refresh: vi.fn().mockResolvedValue(undefined),
    });

    render(<AdminDashboard operatorName="Desk Lead" onLogout={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /Recent Results/i }));
    fireEvent.click(screen.getByRole("button", { name: /Edit \/ Review in Score Entry/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Record Official Scores/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/Prelim 01 Score Entry/i)).toBeInTheDocument();
  });

  it("renders canonical team rows and preserves their individual members in admin only", () => {
    const teams = Array.from({ length: 16 }, (_, index) => makeTeam(index + 1));
    render(
      <TeamManagement
        teams={teams}
        onCreateTeam={vi.fn().mockResolvedValue({ success: true })}
        onUpdateTeam={vi.fn().mockResolvedValue({ success: true })}
        onDeleteTeam={vi.fn().mockResolvedValue({ success: true })}
      />,
    );

    expect(screen.getByText(/TEAM ROSTER/i)).toBeInTheDocument();
    expect(screen.getAllByText(/3 members/i)).toHaveLength(16);
    expect(screen.getAllByText("Member 1")).toHaveLength(16);
  });

  it("saves a new roster with status and stream through the async service", async () => {
    const createTeam = vi.fn().mockResolvedValue({ success: true });
    render(
      <TeamManagement
        teams={[]}
        onCreateTeam={createTeam}
        onUpdateTeam={vi.fn().mockResolvedValue({ success: true })}
        onDeleteTeam={vi.fn().mockResolvedValue({ success: true })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Team/i }));
    fireEvent.change(screen.getByLabelText(/Team name/i), { target: { value: "Bright Minds" } });
    fireEvent.change(screen.getByLabelText(/Stream/i), { target: { value: "Engineering" } });
    fireEvent.change(screen.getByLabelText("Member 1 name"), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText("Member 2 name"), { target: { value: "B" } });
    fireEvent.change(screen.getByLabelText("Member 3 name"), { target: { value: "C" } });
    fireEvent.click(screen.getByRole("button", { name: /Save Team/i }));

    await waitFor(() =>
      expect(createTeam).toHaveBeenCalledWith({
        name: "Bright Minds",
        stream: "Engineering",
        status: "registered",
        members: [
          { id: "", name: "A" },
          { id: "", name: "B" },
          { id: "", name: "C" },
        ],
      }),
    );
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Bright Minds added"));
  });

  it("renders the add-match workflow so an admin can create a valid match from the canonical team list", async () => {
    const onCreateMatch = vi.fn().mockResolvedValue({ success: true });
    render(
      <MatchManagement
        allMatches={[]}
        teams={[makeTeam(1), makeTeam(2)]}
        activeMatchId=""
        onSelectMatch={vi.fn()}
        onUpdateStatus={vi.fn().mockResolvedValue({ success: true })}
        onAssignTeam={vi.fn().mockResolvedValue({ success: true })}
        onCreateMatch={onCreateMatch}
        onDeleteMatch={vi.fn().mockResolvedValue({ success: true })}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("No matches yet");
    expect(screen.queryByText(/8 Preliminaries · 2 Semifinals · 1 Grand Final/)).toBeNull();
    expect(screen.queryByRole("button", { name: /Prelims \(0\)/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Add Match/i }));
    fireEvent.change(screen.getByLabelText(/Match round/i), { target: { value: "preliminary" } });
    fireEvent.change(screen.getByLabelText(/Team A/i), { target: { value: "test-team-1" } });
    fireEvent.change(screen.getByLabelText(/Team B/i), { target: { value: "test-team-2" } });
    fireEvent.change(screen.getByLabelText(/Stage name/i), {
      target: { value: "Preliminaries · Match 01" },
    });
    fireEvent.change(screen.getByLabelText(/Court/i), { target: { value: "Court 1" } });
    fireEvent.click(screen.getByRole("button", { name: /Save Match/i }));

    await waitFor(() =>
      expect(onCreateMatch).toHaveBeenCalledWith({
        round: "preliminary",
        roundLabel: "Prelim 01",
        stageName: "Preliminaries · Match 01",
        teamAId: "test-team-1",
        teamBId: "test-team-2",
        court: "Court 1",
        status: "upcoming",
      }),
    );
  });

  it("limits quarter-final assignment to completed preliminary winners", () => {
    const preliminary = {
      ...makeMatch(),
      status: "completed" as const,
      winnerTeamId: "test-team-1",
    };
    render(
      <MatchManagement
        allMatches={[preliminary]}
        teams={[makeTeam(1), makeTeam(2), makeTeam(3)]}
        activeMatchId=""
        onSelectMatch={vi.fn()}
        onUpdateStatus={vi.fn().mockResolvedValue({ success: true })}
        onAssignTeam={vi.fn().mockResolvedValue({ success: true })}
        onCreateMatch={vi.fn().mockResolvedValue({ success: true })}
        onDeleteMatch={vi.fn().mockResolvedValue({ success: true })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Match/i }));
    fireEvent.change(screen.getByLabelText("Match round"), {
      target: { value: "quarterfinal" },
    });
    const teamASelect = screen.getByRole("combobox", { name: "Team A" });
    expect(within(teamASelect).getByRole("option", { name: "Team 1" })).toBeInTheDocument();
    expect(within(teamASelect).queryByRole("option", { name: "Team 2" })).toBeNull();
    expect(within(teamASelect).queryByRole("option", { name: "Team 3" })).toBeNull();
  });

  it.each([
    { targetRound: "semifinal" as const, sourceRound: "quarterfinal" as const },
    { targetRound: "final" as const, sourceRound: "semifinal" as const },
  ])(
    "limits $targetRound assignment to completed $sourceRound winners",
    ({ targetRound, sourceRound }) => {
      const previousMatch = {
        ...makeMatch(),
        round: sourceRound,
        status: "completed" as const,
        winnerTeamId: "test-team-1",
      };
      render(
        <MatchManagement
          allMatches={[previousMatch]}
          teams={[makeTeam(1), makeTeam(2), makeTeam(3)]}
          activeMatchId=""
          onSelectMatch={vi.fn()}
          onUpdateStatus={vi.fn().mockResolvedValue({ success: true })}
          onAssignTeam={vi.fn().mockResolvedValue({ success: true })}
          onCreateMatch={vi.fn().mockResolvedValue({ success: true })}
          onDeleteMatch={vi.fn().mockResolvedValue({ success: true })}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /Add Match/i }));
      fireEvent.change(screen.getByLabelText("Match round"), { target: { value: targetRound } });
      const teamASelect = screen.getByRole("combobox", { name: "Team A" });
      expect(within(teamASelect).getByRole("option", { name: "Team 1" })).toBeInTheDocument();
      expect(within(teamASelect).queryByRole("option", { name: "Team 2" })).toBeNull();
      expect(within(teamASelect).queryByRole("option", { name: "Team 3" })).toBeNull();
    },
  );

  it("shows a confirmed remove action for completed matches too", async () => {
    const match = { ...makeMatch(), status: "completed" as const };
    const onDeleteMatch = vi.fn().mockResolvedValue({ success: true });
    render(
      <MatchManagement
        allMatches={[match]}
        teams={[makeTeam(1), makeTeam(2)]}
        activeMatchId={match.id}
        onSelectMatch={vi.fn()}
        onUpdateStatus={vi.fn().mockResolvedValue({ success: true })}
        onAssignTeam={vi.fn().mockResolvedValue({ success: true })}
        onCreateMatch={vi.fn().mockResolvedValue({ success: true })}
        onDeleteMatch={onDeleteMatch}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Remove Match/i }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(onDeleteMatch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Confirm Remove/i }));
    await waitFor(() => expect(onDeleteMatch).toHaveBeenCalledWith(match.id));
  });

  it("renders the public bracket when the final match has been deleted", () => {
    render(
      <TournamentBracket
        tree={{ preliminaries: [], quarterFinals: [], semiFinals: [] }}
        onSelectMatch={vi.fn()}
        onOpenMatchModal={vi.fn()}
      />,
    );

    expect(screen.getByRole("region", { name: "Tournament Bracket" })).toBeInTheDocument();
    expect(screen.queryByText("CHAMPION")).not.toBeInTheDocument();
  });

  it("renders four quarter-finals and two semi-finals with their teams and scores", () => {
    const preliminaries = Array.from({ length: 8 }, (_, index) => ({
      ...makeMatch(),
      id: `preliminary-${index + 1}`,
      roundLabel: `Prelim ${index + 1}`,
    }));
    const quarterFinals = Array.from({ length: 4 }, (_, index) => ({
      ...makeMatch(),
      id: `quarterfinal-${index + 1}`,
      matchNumber: index + 9,
      round: "quarterfinal" as const,
      roundLabel: `Quarter-final ${index + 1}`,
      stageName: `Quarter-final Match ${index + 1}`,
      teamA: makeTeam(20 + index * 2 + 1),
      teamB: makeTeam(20 + index * 2 + 2),
      scoreA: { content: 30, strategy: 20, style: 20, total: 70 + index },
      scoreB: { content: 25, strategy: 20, style: 20, total: 65 + index },
      court: `Court ${index + 1}`,
    }));
    const semiFinals = Array.from({ length: 2 }, (_, index) => ({
      ...makeMatch(),
      id: `semifinal-${index + 1}`,
      matchNumber: index + 14,
      round: "semifinal" as const,
      roundLabel: `Semi-final ${index + 1}`,
      stageName: `Semi-final Match ${index + 1}`,
      teamA: makeTeam(30 + index * 2 + 1),
      teamB: makeTeam(30 + index * 2 + 2),
      scoreA: { content: 30, strategy: 20, style: 20, total: 80 + index },
      scoreB: { content: 25, strategy: 20, style: 20, total: 70 + index },
      court: `Semi-final Court ${index + 1}`,
    }));
    const final = {
      ...makeMatch(),
      id: "championship-final",
      round: "final" as const,
      roundLabel: "Championship Final",
    };
    const { container } = render(
      <TournamentBracket
        tree={{ preliminaries, quarterFinals: [...quarterFinals].reverse(), semiFinals, final }}
        onSelectMatch={vi.fn()}
        onOpenMatchModal={vi.fn()}
      />,
    );
    const stageTabs = within(screen.getByRole("tablist")).getAllByRole("tab");
    expect(stageTabs.map((tab) => tab.textContent)).toEqual([
      "Prelims (8)",
      "Quarter-finals (4)",
      "Semi-finals (2)",
      "Final (1)",
    ]);
    const desktopBracket = Array.from(container.querySelectorAll("div")).find(
      (element) => element.classList.contains("hidden") && element.classList.contains("lg:block"),
    );

    if (!(desktopBracket instanceof HTMLElement))
      throw new Error("Desktop tournament bracket was not rendered.");
    const desktop = within(desktopBracket);
    const bracketGrid = desktopBracket.children[0]?.children[1];
    if (!(bracketGrid instanceof HTMLElement))
      throw new Error("Tournament bracket grid was not rendered.");

    for (const match of preliminaries) {
      expect(desktop.getByText(match.roundLabel)).toBeInTheDocument();
    }
    for (const match of [...quarterFinals, ...semiFinals]) {
      const card = desktop.getByText(match.roundLabel).closest(".group");
      if (!(card instanceof HTMLElement))
        throw new Error(`${match.roundLabel} was not rendered as a match card.`);
      const matchCard = within(card);
      expect(matchCard.getByText(match.teamA!.name)).toBeInTheDocument();
      expect(matchCard.getByText(match.teamB!.name)).toBeInTheDocument();
      expect(matchCard.getByText(String(match.scoreA!.total))).toBeInTheDocument();
      expect(matchCard.getByText(String(match.scoreB!.total))).toBeInTheDocument();
      expect(matchCard.getByText(match.court!)).toBeInTheDocument();
    }
    expect(desktop.getByText("QUARTER-FINALS · A")).toBeInTheDocument();
    expect(desktop.getByText("SEMI-FINALS · A")).toBeInTheDocument();
    expect(
      within(bracketGrid.children[2] as HTMLElement).getByText("Quarter-final 1"),
    ).toBeInTheDocument();
    expect(
      within(bracketGrid.children[2] as HTMLElement).getByText("Quarter-final 2"),
    ).toBeInTheDocument();
    expect(
      within(bracketGrid.children[6] as HTMLElement).getByText("Quarter-final 3"),
    ).toBeInTheDocument();
    expect(
      within(bracketGrid.children[6] as HTMLElement).getByText("Quarter-final 4"),
    ).toBeInTheDocument();
    expect(desktop.getByText(final.roundLabel)).toBeInTheDocument();
  });

  it("keeps all match-card text white when the match is selected or hovered", () => {
    const match = {
      ...makeMatch(),
      status: "completed" as const,
      winnerTeamId: "test-team-1",
      scoreA: { content: 30, strategy: 20, style: 20, total: 70 },
      scoreB: { content: 25, strategy: 20, style: 20, total: 65 },
      court: "Court 1",
    };
    const { container } = render(
      <TournamentBracket
        tree={{ preliminaries: [], quarterFinals: [], semiFinals: [match] }}
        selectedMatchId={match.id}
        onSelectMatch={vi.fn()}
        onOpenMatchModal={vi.fn()}
      />,
    );
    const desktopBracket = container.querySelector(".hidden.lg\\:block");

    if (!(desktopBracket instanceof HTMLElement))
      throw new Error("Desktop tournament bracket was not rendered.");
    const desktop = within(desktopBracket);
    const roundName = desktop.getByText(match.roundLabel);
    const matchCard = roundName.closest(".group");

    if (!(matchCard instanceof HTMLElement))
      throw new Error("Selected match card was not rendered.");
    expect(roundName.parentElement).toHaveClass("bg-ink", "text-white");
    expect(desktop.getByText(match.teamA!.name)).toHaveClass("text-white");
    expect(desktop.getByText(match.teamB!.name)).toHaveClass("text-white");
    expect(desktop.getByText(match.teamA!.name).parentElement?.parentElement).toHaveClass(
      "bg-sun/40",
    );
    expect(desktop.getByText(match.teamA!.name).parentElement?.querySelector("span")).toHaveClass(
      "bg-ink",
      "text-sun",
    );
    expect(desktop.getByText("Court 1").parentElement).toHaveClass("bg-ink", "text-white");

    const unselectedMatch = { ...match, id: "unselected-match" };
    const { container: unselectedContainer } = render(
      <TournamentBracket
        tree={{ preliminaries: [], quarterFinals: [], semiFinals: [unselectedMatch] }}
        onSelectMatch={vi.fn()}
        onOpenMatchModal={vi.fn()}
      />,
    );
    const unselectedDesktop = unselectedContainer.querySelector(".hidden.lg\\:block");

    if (!(unselectedDesktop instanceof HTMLElement))
      throw new Error("Desktop tournament bracket was not rendered.");
    const unselected = within(unselectedDesktop);
    expect(unselected.getByText(unselectedMatch.roundLabel).parentElement).toHaveClass(
      "group-hover:text-white",
    );
    expect(
      unselected.getByText(unselectedMatch.teamA!.name).parentElement?.parentElement,
    ).toHaveClass("bg-sun/40", "group-hover:bg-sun/40");
    expect(
      unselected.getByText(unselectedMatch.teamA!.name).parentElement?.querySelector("span"),
    ).toHaveClass("bg-ink", "text-sun");
    expect(unselected.getByText(unselectedMatch.teamB!.name)).toHaveClass("group-hover:text-white");
    expect(unselected.getByText("Court 1").parentElement).toHaveClass("group-hover:text-white");
  });

  it("reports safe-archive errors and leaves the confirmation open for resolution", async () => {
    const removeTeam = vi.fn().mockResolvedValue({
      success: false,
      error: "Resolve this team's upcoming match assignment first.",
    });
    render(
      <TeamManagement
        teams={[makeTeam(1)]}
        onCreateTeam={vi.fn().mockResolvedValue({ success: true })}
        onUpdateTeam={vi.fn().mockResolvedValue({ success: true })}
        onDeleteTeam={removeTeam}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Remove Team 1/i }));
    fireEvent.click(screen.getByRole("button", { name: /Remove Team$/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/upcoming match assignment/i),
    );
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("reports audience voting failures without claiming a ballot was recorded", async () => {
    const castVote = vi
      .fn()
      .mockResolvedValue({ success: false, error: "A ballot has already been recorded." });
    const match = { ...makeMatch(), status: "live" as const, votingStatus: "open" as const };
    render(<AudienceVoting match={match} onCastVote={castVote} />);

    fireEvent.click(screen.getByRole("button", { name: /VOTE TEAM 1/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/already been recorded/i),
    );
    expect(castVote).toHaveBeenCalledWith(match.id, match.teamA!.id);
  });

  it("keeps audience pulse, note, and voting-closed labels white", () => {
    const closedMatch = {
      ...makeMatch(),
      status: "completed" as const,
      votingStatus: "closed" as const,
    };
    render(<AudienceVoting match={closedMatch} onCastVote={vi.fn()} />);

    expect(screen.getByText("AUDIENCE PULSE")).toHaveClass("!text-white");
    expect(screen.getByText(/NOTE:/).parentElement).toHaveClass("!text-white");
    expect(screen.getByText("AUDIENCE VOTING CLOSED FOR THIS MATCH")).toHaveClass("!text-white");
  });
});
