import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { adminTeamsQueryKey, tournamentQueryKey } from "@/lib/tournament-queries";
import { supabase } from "@/lib/supabase";

export function TournamentRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase) return;

    const refreshTournament = () => {
      void queryClient.invalidateQueries({ queryKey: tournamentQueryKey });
      void queryClient.invalidateQueries({ queryKey: adminTeamsQueryKey });
    };

    const channel = supabase
      .channel("tournament-publication")
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, refreshTournament)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, refreshTournament)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_scores" },
        refreshTournament,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_vote_totals" },
        refreshTournament,
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          refreshTournament();
        }
      });

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshTournament();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("online", refreshTournament);

    return () => {
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("online", refreshTournament);
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
}
