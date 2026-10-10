import type { Match } from "@/content/tournament";

interface RecentResultsProps {
  matches: Match[];
  onOpenMatchModal: (matchId: string) => void;
}

export function RecentResults({ matches, onOpenMatchModal }: RecentResultsProps) {
  const completedMatches = matches.filter((m) => m.status === "completed");

  return (
    <section id="results" className="py-12" aria-label="Recent Match Results">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-3">
        <div>
          <div className="flex items-center gap-2 font-type text-xs uppercase tracking-widest text-ink">
            <span className="bg-ink px-2 py-0.5 text-sun">STAGE 03</span>
            <span>·</span>
            <span>Tabulation Desk</span>
          </div>
          <h2 className="display text-4xl text-ink md:text-5xl">
            Recent <span className="text-hot">Results.</span>
          </h2>
        </div>

        <span className="font-type text-xs text-muted-foreground">
          {completedMatches.length} official decision{completedMatches.length !== 1 ? "s" : ""} on
          record
        </span>
      </div>

      {completedMatches.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {completedMatches.map((m) => {
            const isWinnerA = m.winnerTeamId === m.teamA?.id;
            const isWinnerB = m.winnerTeamId === m.teamB?.id;

            return (
              <div
                key={m.id}
                onClick={() => onOpenMatchModal(m.id)}
                className="group cursor-pointer border-3 border-ink bg-paper p-5 transition-all shadow-[4px_4px_0_var(--ink)] hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--ink)]"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-ink/20 pb-2 font-type text-xs">
                  <span className="font-bold uppercase tracking-wider text-hot">
                    {m.roundLabel}
                  </span>
                  <span className="rounded-full border border-emerald-500/60 bg-emerald-500/15 px-2 py-0.5 font-type text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                    {m.completedTime || "COMPLETED"}
                  </span>
                </div>

                {/* Motion note */}
                <p className="mt-2 line-clamp-2 font-serif text-xs italic text-muted-foreground">
                  &ldquo;{m.motion}&rdquo;
                </p>

                {/* Scores */}
                <div className="mt-4 space-y-2">
                  <div
                    className={`flex items-center justify-between border-2 px-3 py-2 ${
                      isWinnerA
                        ? "border-ink bg-sun font-bold shadow-[2px_2px_0_var(--ink)]"
                        : "border-transparent bg-ivory/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="display text-sm">
                        {m.teamA?.number ? String(m.teamA.number).padStart(2, "0") : "--"}
                      </span>
                      <span className="font-type text-xs uppercase text-ink">{m.teamA?.name}</span>
                      {isWinnerA && (
                        <span className="bg-ink px-1.5 py-0.2 font-type text-[9px] text-sun uppercase">
                          WINNER
                        </span>
                      )}
                    </div>
                    <span className="display text-xl text-ink">{m.scoreA?.total ?? "--"}</span>
                  </div>

                  <div
                    className={`flex items-center justify-between border-2 px-3 py-2 ${
                      isWinnerB
                        ? "border-ink bg-sun font-bold shadow-[2px_2px_0_var(--ink)]"
                        : "border-transparent bg-ivory/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="display text-sm">
                        {m.teamB?.number ? String(m.teamB.number).padStart(2, "0") : "--"}
                      </span>
                      <span className="font-type text-xs uppercase text-ink">{m.teamB?.name}</span>
                      {isWinnerB && (
                       <span className="bg-ink px-1.5 py-0.2 font-type text-[9px] text-white uppercase">
                          WINNER
                      </span>
                      )}
                    </div>
                    <span className="display text-xl text-ink">{m.scoreB?.total ?? "--"}</span>
                  </div>
                </div>

                {/* Footer click indicator */}
                <div className="mt-4 flex items-center justify-between border-t border-ink/20 pt-2 font-type text-[11px] text-stone group-hover:text-ink">
                  <span>Judge Scorecard</span>
                  <span className="font-bold text-hot group-hover:translate-x-1 transition-transform">
                    View Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border-2 border-dashed border-ink/40 bg-ivory p-8 text-center font-type text-sm text-muted-foreground">
          No matches completed yet. Decisions will be recorded here by the tab desk immediately
          following judge certification.
        </div>
      )}
    </section>
  );
}
