import type { Team } from "@/content/tournament";

interface ChampionNodeProps {
  champion?: Team;
  finalCompleted?: boolean;
}

export function ChampionNode({ champion, finalCompleted }: ChampionNodeProps) {
  return (
    <div className="relative mx-auto flex flex-col items-center justify-center p-2 text-center">
      {/* Editorial Decorative Crown Stamp */}
      <div className="relative z-10 w-full max-w-[260px] border-4 border-ink bg-sun p-5 shadow-[6px_6px_0_var(--ink)]">
        {/* Top small banner */}
        <div className="mb-2 flex items-center justify-center gap-1.5 font-type text-[11px] font-bold uppercase tracking-widest text-ink">
          <span>★</span>
          <span>TOURNAMENT CROWN</span>
          <span>★</span>
        </div>

        {/* Big Champion Header */}
        <div className="display text-4xl leading-none text-ink md:text-5xl">CHAMPION</div>

        {/* Icon & Team Name */}
        <div className="mt-3 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-[2px_2px_0_var(--ink)]">
            <span className="text-2xl" role="img" aria-label="trophy">
              🏆
            </span>
          </div>

          {champion && finalCompleted ? (
            <div className="mt-3 w-full">
              <span className="display block text-3xl text-hot md:text-4xl">{champion.name}</span>
              {champion.stream && (
                <span className="font-type mt-1 inline-block border border-ink bg-paper px-2 py-0.5 text-xs uppercase tracking-wider text-ink">
                  {champion.stream}
                </span>
              )}
              <div className="mt-2 text-xs font-serif italic text-ink/80">
                Official DE&rsquo;BAIT Titleholder
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className="border border-ink/40 bg-ivory/80 px-3 py-1 font-type text-xs font-bold uppercase tracking-widest !text-white">
                AWAITING FINAL
              </div>
              <p className="mt-1 text-[11px] font-type text-muted-foreground">
                Decided on Stage · Day 02
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Pedestal base */}
      <div className="h-2 w-28 border-x-2 border-b-2 border-ink bg-ink" />
      <div className="h-1.5 w-36 border-x-2 border-b-2 border-ink bg-sun" />
    </div>
  );
}
