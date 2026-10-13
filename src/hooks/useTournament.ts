import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserVote } from "@/content/tournament";
import { fetchTournamentSnapshot, castAudienceVote } from "@/lib/tournament-data";
import { audienceVoteQueryKey, tournamentQueryKey } from "@/lib/tournament-queries";
import { requireSupabase, supabase } from "@/lib/supabase";

export function useTournament() {
  const queryClient = useQueryClient();
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [modalMatchId, setModalMatchId] = useState<string | null>(null);
  const tournamentQuery = useQuery({
    queryKey: tournamentQueryKey,
    queryFn: fetchTournamentSnapshot,
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: 2,
  });

  const allMatches = useMemo(() => {
    const tree = tournamentQuery.data?.tree;
    return tree
      ? [
          ...tree.preliminaries,
          ...tree.quarterFinals,
          ...tree.semiFinals,
          ...(tree.final ? [tree.final] : []),
        ]
      : [];
  }, [tournamentQuery.data]);
  const liveMatches = useMemo(
    () => allMatches.filter((match) => match.status === "live"),
    [allMatches],
  );
  const activeMatch = useMemo(
    () =>
      allMatches.find((match) => match.id === selectedMatchId) ?? liveMatches[0] ?? allMatches[0],
    [allMatches, liveMatches, selectedMatchId],
  );
  const modalMatch = modalMatchId
    ? allMatches.find((match) => match.id === modalMatchId)
    : undefined;

  const voteQuery = useQuery({
    queryKey: audienceVoteQueryKey(activeMatch?.id ?? "", "current-user"),
    enabled: Boolean(activeMatch && supabase),
    queryFn: async (): Promise<UserVote | null> => {
      const client = requireSupabase();
      const { data: session } = await client.auth.getSession();
      if (!session.session) return null;
      const { data, error } = await client
        .from("audience_votes")
        .select("match_id, team_id, created_at")
        .eq("match_id", activeMatch!.id)
        .eq("voter_id", session.session.user.id)
        .maybeSingle();
      if (error) throw error;
      return data
        ? { matchId: data.match_id, teamId: data.team_id, timestamp: Date.parse(data.created_at) }
        : null;
    },
  });

  const castVote = useCallback(
    async (matchId: string, teamId: string) => {
      const result = await castAudienceVote(matchId, teamId);
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: tournamentQueryKey });
        await queryClient.invalidateQueries({ queryKey: ["tournament", "audience-vote", matchId] });
      }
      return result;
    },
    [queryClient],
  );

  return {
    tree: tournamentQuery.data?.tree,
    allMatches,
    liveMatches,
    activeMatch,
    selectedMatchId: activeMatch?.id ?? "",
    setSelectedMatchId,
    modalMatch,
    modalMatchId,
    setModalMatchId,
    userVote: voteQuery.data ?? undefined,
    castVote,
    isLoading: tournamentQuery.isLoading,
    error: tournamentQuery.error ?? voteQuery.error,
    refetch: tournamentQuery.refetch,
  };
}
