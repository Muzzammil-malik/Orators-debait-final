import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TournamentRealtimeSync } from "@/components/TournamentRealtimeSync";
import { adminTeamsQueryKey, tournamentQueryKey } from "@/lib/tournament-queries";

const realtime = vi.hoisted(() => {
  type MockChannel = {
    on: (
      event: string,
      filter: { schema: string; table: string },
      callback: () => void,
    ) => MockChannel;
    subscribe: () => MockChannel;
  };
  const registrations: { table: string; callback: () => void }[] = [];
  const channel: MockChannel = {
    on: (_event, filter, callback) => {
      registrations.push({ table: filter.table, callback });
      return channel;
    },
    subscribe: () => channel,
  };

  return {
    registrations,
    supabase: {
      channel: vi.fn(() => channel),
      removeChannel: vi.fn(),
    },
  };
});

vi.mock("@/lib/supabase", () => ({ supabase: realtime.supabase }));

describe("tournament realtime synchronization", () => {
  afterEach(() => {
    cleanup();
    realtime.registrations.length = 0;
    vi.clearAllMocks();
  });

  it("refreshes the shared tournament snapshot when audience totals change", async () => {
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <TournamentRealtimeSync />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(realtime.registrations.some(({ table }) => table === "match_vote_totals")).toBe(true),
    );
    const voteTotalsChange = realtime.registrations.find(
      ({ table }) => table === "match_vote_totals",
    );
    expect(voteTotalsChange).toBeDefined();
    voteTotalsChange!.callback();

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: tournamentQueryKey });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: adminTeamsQueryKey });

    unmount();
    expect(realtime.supabase.removeChannel).toHaveBeenCalledOnce();
    queryClient.clear();
  });
});
