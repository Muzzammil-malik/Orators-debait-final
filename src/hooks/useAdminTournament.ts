import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Match,
  MatchStatus,
  ScoreBreakdown,
  Team,
  TeamMember,
  VotingStatus,
  ZoneNumber,
} from "@/content/tournament";
import {
  archiveTeam,
  assignMatchTeam as saveMatchAssignment,
  deleteMatch,
  createMatch,
  fetchAdminTeams,
  fetchTournamentSnapshot,
  saveMatchScores,
  saveTeam,
  setVotingStatus,
  toggleSwitchRound,
  updateMatchStatus,
  updateMatchZone,
  type MutationResult,
} from "@/lib/tournament-data";
import { adminTeamsQueryKey, tournamentQueryKey } from "@/lib/tournament-queries";

export function useAdminTournament() {
  const queryClient = useQueryClient();
  const [activeMatchId, setActiveMatchId] = useState("");
  const tournamentQuery = useQuery({
    queryKey: tournamentQueryKey,
    queryFn: fetchTournamentSnapshot,
    staleTime: 5_000,
    refetchInterval: 30_000,
    retry: 2,
  });
  const teamsQuery = useQuery({
    queryKey: adminTeamsQueryKey,
    queryFn: fetchAdminTeams,
    staleTime: 5_000,
    retry: 1,
  });

  const allMatches = useMemo<Match[]>(() => {
    const tree = tournamentQuery.data?.tree;
    return tree
      ? [...tree.preliminaries, ...tree.semiFinals, ...(tree.final ? [tree.final] : [])]
      : [];
  }, [tournamentQuery.data]);
  const activeMatch = useMemo(
    () =>
      allMatches.find((match) => match.id === activeMatchId) ??
      allMatches.find((match) => match.status === "live") ??
      allMatches[0],
    [allMatches, activeMatchId],
  );

  const refresh = useCallback(
    async (includeTeams = false) => {
      await queryClient.invalidateQueries({ queryKey: tournamentQueryKey });
      if (includeTeams) await queryClient.invalidateQueries({ queryKey: adminTeamsQueryKey });
    },
    [queryClient],
  );

  const mutateAndRefresh = useCallback(
    async (
      mutation: () => Promise<MutationResult>,
      includeTeams = false,
    ): Promise<MutationResult> => {
      try {
        const result = await mutation();
        if (result.success) await refresh(includeTeams);
        return result;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "The request failed.",
        };
      }
    },
    [refresh],
  );

  const updateScores = useCallback(
    async (matchId: string, scoreA: ScoreBreakdown, scoreB: ScoreBreakdown) => {
      const match = allMatches.find((entry) => entry.id === matchId);
      if (!match) return { success: false, error: "Match was not found." };
      return mutateAndRefresh(() => saveMatchScores(match, scoreA, scoreB));
    },
    [allMatches, mutateAndRefresh],
  );

  const updateStatus = useCallback(
    (matchId: string, status: MatchStatus, winnerTeamId?: string) =>
      mutateAndRefresh(() => updateMatchStatus(matchId, status, winnerTeamId)),
    [mutateAndRefresh],
  );

  const setZone = useCallback(
    (matchId: string, zone: ZoneNumber) => mutateAndRefresh(() => updateMatchZone(matchId, zone)),
    [mutateAndRefresh],
  );

  const toggleSwitch = useCallback(
    (matchId: string) => {
      const match = allMatches.find((entry) => entry.id === matchId);
      if (!match) return Promise.resolve({ success: false, error: "Match was not found." });
      return mutateAndRefresh(() =>
        toggleSwitchRound(matchId, Boolean(match.switchRoundTriggered)),
      );
    },
    [allMatches, mutateAndRefresh],
  );

  const setVoting = useCallback(
    (matchId: string, status: VotingStatus) =>
      mutateAndRefresh(() => setVotingStatus(matchId, status)),
    [mutateAndRefresh],
  );

  const updateTeam = useCallback(
    (teamId: string, data: Partial<Team>) => {
      const current = (teamsQuery.data ?? []).find((team) => team.id === teamId);
      if (!current) return Promise.resolve({ success: false, error: "Team was not found." });
      const members = data.members ?? current.members;
      if (members.length < 3 || members.length > 5) {
        return Promise.resolve({ success: false, error: "Teams must have 3 to 5 members." });
      }
      return mutateAndRefresh(
        () =>
          saveTeam({
            id: teamId,
            name: data.name ?? current.name,
            stream: data.stream ?? current.stream,
            status: data.status ?? current.status,
            members,
          }),
        true,
      );
    },
    [mutateAndRefresh, teamsQuery.data],
  );

  const createTeam = useCallback(
    (data: { name: string; members: TeamMember[]; stream?: string }) =>
      mutateAndRefresh(() => saveTeam(data), true),
    [mutateAndRefresh],
  );

  const createMatchRecord = useCallback(
    (data: {
      round: MatchRound;
      roundLabel: string;
      stageName: string;
      teamAId: string;
      teamBId: string;
      court?: string;
      motion?: string;
      status?: MatchStatus;
    }) => {
      if (!data.teamAId || !data.teamBId) {
        return Promise.resolve({
          success: false,
          error: "Select both teams before creating a match.",
        });
      }
      if (data.teamAId === data.teamBId) {
        return Promise.resolve({
          success: false,
          error: "A match cannot include the same team twice.",
        });
      }
      return mutateAndRefresh(() => createMatch(data), true);
    },
    [mutateAndRefresh],
  );

  const deleteTeam = useCallback(
    (teamId: string) => mutateAndRefresh(() => archiveTeam(teamId), true),
    [mutateAndRefresh],
  );

  const deleteMatchRecord = useCallback(
    (matchId: string) => mutateAndRefresh(() => deleteMatch(matchId), true),
    [mutateAndRefresh],
  );

  const assignMatchTeam = useCallback(
    (matchId: string, side: "teamA" | "teamB", teamId: string | null) =>
      mutateAndRefresh(() => saveMatchAssignment(matchId, side, teamId)),
    [mutateAndRefresh],
  );

  return {
    tree: tournamentQuery.data?.tree,
    allMatches,
    allTeams: teamsQuery.data ?? [],
    activeMatch,
    activeMatchId: activeMatch?.id ?? "",
    setActiveMatchId,
    updateScores,
    updateStatus,
    setZone,
    toggleSwitch,
    setVoting,
    updateTeam,
    createTeam,
    createMatch: createMatchRecord,
    deleteMatch: deleteMatchRecord,
    deleteTeam,
    assignMatchTeam,
    isLoading: tournamentQuery.isLoading || teamsQuery.isLoading,
    error: tournamentQuery.error ?? teamsQuery.error,
    refresh: () => refresh(true),
  };
}
