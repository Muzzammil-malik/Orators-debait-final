import type { Match } from "@/content/tournament";
import { ZONES_METADATA, type ZoneNumber } from "@/content/tournament";

interface LiveScorecardProps {
  match?: Match;
  onZoneChange?: (zone: ZoneNumber) => void;
  onToggleSwitchRound?: () => void;
}

export function LiveScorecard({ match, onZoneChange, onToggleSwitchRound }: LiveScorecardProps) {
  if (!match) {
    return (
      <div className="border-2 border-ink bg-paper p-8 text-center shadow-[4px_4px_0_var(--ink)]">
        <p className="display text-3xl text-ink">NO MATCH SELECTED</p>
        <p className="mt-2 font-serif text-sm text-muted-foreground">
          Select any active or completed match from the tournament tree to view its live breakdown.
        </p>
      </div>
    );
  }

  const { teamA, teamB, scoreA, scoreB, zone, switchRoundTriggered, status } = match;
  const isLive = status === "live";

  return (
    <div className="w-full min-w-0 max-w-full border-4 border-ink bg-paper shadow-[8px_8px_0_var(--ink)]">
      {/* Header bar */}
      <div className="flex flex-col items-start gap-3 border-b-4 border-ink bg-ink px-3 py-3 text-paper sm:px-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-4">
        <div className="w-full min-w-0 md:flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2 font-type text-xs uppercase tracking-widest text-sun">
            <span className="[overflow-wrap:anywhere]">{match.stageName}</span>
            <span>·</span>
            <span className="[overflow-wrap:anywhere]">{match.court || "Main Stage"}</span>
          </div>
          <h3 className="display break-words text-2xl text-paper sm:text-3xl md:text-4xl">{match.roundLabel}</h3>
        </div>

        <div className="flex max-w-full items-center gap-3">
          {isLive ? (
            <div className="flex items-center gap-2 border-2 border-sun bg-hot px-3 py-1 font-type text-xs font-bold uppercase tracking-wider text-paper shadow-[2px_2px_0_var(--sun)]">
              <span className="pulse-dot h-2 w-2 rounded-full bg-paper" />● MATCH IN PROGRESS
            </div>
          ) : (
            <div className="border border-paper/40 bg-ink px-3 py-1 font-type text-xs uppercase tracking-wider text-stone">
              STATUS: {match.status.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Motion Banner */}
      <div className="min-w-0 border-b-2 border-ink bg-ivory/80 px-3 py-3 sm:px-4 md:px-6 md:py-4">
        <div className="font-type text-xs uppercase tracking-widest text-hot font-bold">
          DEBATE MOTION
        </div>
        <p className="mt-1 break-words font-serif text-lg italic text-ink [overflow-wrap:anywhere] md:text-xl">
          &ldquo;{match.motion}&rdquo;
        </p>
      </div>

      {/* Official Scoreboard Head-to-Head */}
      <div className="grid min-w-0 grid-cols-2 items-center gap-x-3 gap-y-2 bg-paper p-3 sm:p-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4 md:p-8">
        {/* Proposition (Team A) */}
        <div className="order-1 min-w-0 text-left md:order-none">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="bg-ink px-2 py-0.5 font-type text-xs font-bold text-sun">
              PROPOSITION
            </span>
            {teamA?.stream && (
              <span className="min-w-0 break-words font-type text-xs text-muted-foreground [overflow-wrap:anywhere]">{teamA.stream}</span>
            )}
          </div>
          <h4 className="display mt-2 break-words text-2xl text-ink [overflow-wrap:anywhere] sm:text-3xl md:text-5xl">
            {teamA ? teamA.name : "Team A"}
          </h4>
          <div className="mt-3 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="display text-5xl text-hot sm:text-6xl md:text-8xl">
              {scoreA ? scoreA.total : "--"}
            </span>
            <span className="font-type text-xs uppercase text-stone sm:text-sm">/ 100 PTS</span>
          </div>
        </div>

        {/* Center VS */}
        <div className="order-3 col-span-2 flex min-w-0 flex-row items-center justify-center gap-3 px-0 md:order-none md:col-span-1 md:flex-col md:px-2">
          <span className="display shrink-0 text-3xl italic text-hot md:text-5xl">VS</span>
          <div className="h-0.5 w-8 shrink-0 bg-ink/20 md:my-2 md:h-16 md:w-0.5" />
          <span className="text-center font-type text-[10px] uppercase tracking-widest text-stone">
            OFFICIAL JUDGES
          </span>
        </div>

        {/* Opposition (Team B) */}
        <div className="order-2 min-w-0 text-right md:order-none">
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            {teamB?.stream && (
              <span className="min-w-0 break-words font-type text-xs text-muted-foreground [overflow-wrap:anywhere]">{teamB.stream}</span>
            )}
            <span className="bg-ink px-2 py-0.5 font-type text-xs font-bold text-sun">
              OPPOSITION
            </span>
          </div>
          <h4 className="display mt-2 break-words text-2xl text-ink [overflow-wrap:anywhere] sm:text-3xl md:text-5xl">
            {teamB ? teamB.name : "Team B"}
          </h4>
          <div className="mt-3 flex min-w-0 flex-wrap items-baseline justify-end gap-x-2 gap-y-1">
            <span className="display text-5xl text-hot sm:text-6xl md:text-8xl">
              {scoreB ? scoreB.total : "--"}
            </span>
            <span className="font-type text-xs uppercase text-stone sm:text-sm">/ 100 PTS</span>
          </div>
        </div>
      </div>

      {/* Official Judge Scoring Breakdown (Exact 40 / 30 / 30 = 100) */}
      <div className="min-w-0 border-t-2 border-ink bg-ivory/40 p-3 sm:p-4 md:p-8">
        <div className="mb-4 flex items-center justify-between border-b border-ink/20 pb-2">
          <span className="min-w-0 font-type text-[10px] font-bold uppercase tracking-widest text-ink sm:text-xs">
            JUDGING CRITERIA BREAKDOWN
          </span>
          <span className="text-right font-type text-[10px] uppercase text-muted-foreground sm:text-[11px]">
            Official 100-Point Rubric
          </span>
        </div>

        <div className="space-y-6">
          {/* 1. CONTENT (Max 40) */}
          <div>
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-center font-type text-[10px] uppercase leading-tight sm:text-xs">
              <span className="min-w-0 font-bold text-ink">{scoreA ? scoreA.content : "--"}</span>
              <span className="min-w-0 font-bold text-ink [overflow-wrap:anywhere]">CONTENT · STRENGTH OF REASONING (MAX 40)</span>
              <span className="min-w-0 font-bold text-ink">{scoreB ? scoreB.content : "--"}</span>
            </div>
            <div className="relative mt-2 flex h-4 w-full min-w-0 overflow-hidden border-2 border-ink bg-paper">
              <div
                className="bg-sun transition-all duration-500"
                style={{
                  width: `${scoreA ? (scoreA.content / 40) * 50 : 25}%`,
                }}
              />
              <div aria-hidden="true" className="absolute inset-y-0 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-ink" />
              <div
                className="bg-hot transition-all duration-500 ml-auto"
                style={{
                  width: `${scoreB ? (scoreB.content / 40) * 50 : 25}%`,
                }}
              />
            </div>
          </div>

          {/* 2. STRATEGY (Max 30) */}
          <div>
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-center font-type text-[10px] uppercase leading-tight sm:text-xs">
              <span className="min-w-0 font-bold text-ink">{scoreA ? scoreA.strategy : "--"}</span>
              <span className="min-w-0 font-bold text-ink [overflow-wrap:anywhere]">
                STRATEGY · REBUTTAL &amp; ADAPTABILITY (MAX 30)
              </span>
              <span className="min-w-0 font-bold text-ink">{scoreB ? scoreB.strategy : "--"}</span>
            </div>
            <div className="relative mt-2 flex h-4 w-full min-w-0 overflow-hidden border-2 border-ink bg-paper">
              <div
                className="bg-sun transition-all duration-500"
                style={{
                  width: `${scoreA ? (scoreA.strategy / 30) * 50 : 25}%`,
                }}
              />
              <div aria-hidden="true" className="absolute inset-y-0 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-ink" />
              <div
                className="bg-hot transition-all duration-500 ml-auto"
                style={{
                  width: `${scoreB ? (scoreB.strategy / 30) * 50 : 25}%`,
                }}
              />
            </div>
          </div>

          {/* 3. STYLE (Max 30) */}
          <div>
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-center font-type text-[10px] uppercase leading-tight sm:text-xs">
              <span className="min-w-0 font-bold text-ink">{scoreA ? scoreA.style : "--"}</span>
              <span className="min-w-0 font-bold text-ink [overflow-wrap:anywhere]">
                STYLE · CLARITY &amp; PERSUASIVENESS (MAX 30)
              </span>
              <span className="min-w-0 font-bold text-ink">{scoreB ? scoreB.style : "--"}</span>
            </div>
            <div className="relative mt-2 flex h-4 w-full min-w-0 overflow-hidden border-2 border-ink bg-paper">
              <div
                className="bg-sun transition-all duration-500"
                style={{
                  width: `${scoreA ? (scoreA.style / 30) * 50 : 25}%`,
                }}
              />
              <div aria-hidden="true" className="absolute inset-y-0 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-ink" />
              <div
                className="bg-hot transition-all duration-500 ml-auto"
                style={{
                  width: `${scoreB ? (scoreB.style / 30) * 50 : 25}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MATCH PROGRESS / CURRENT ZONE (Exact 3 Zones) */}
      <div className="min-w-0 border-t-2 border-ink bg-paper p-3 sm:p-4 md:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="font-type text-xs uppercase tracking-widest text-ink font-bold">
            MATCH PROGRESSION · CURRENT ZONE
          </div>
          {switchRoundTriggered && (
            <div className="flex max-w-full flex-wrap items-center gap-1.5 border border-ink bg-sun px-2 py-0.5 font-type text-xs font-bold text-ink">
              <span>⚡</span>
              <span>BUZZER STRUCK · SWITCH ROUND ACTIVE</span>
            </div>
          )}
        </div>

        {/* 3 Zone Steps */}
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
          {([1, 2, 3] as ZoneNumber[]).map((zNum) => {
            const zMeta = ZONES_METADATA[zNum];
            const isCurrent = zone === zNum && isLive;
            const isPast = zone > zNum || match.status === "completed";
            const isFuture = zone < zNum && isLive;

            return (
              <div
                key={zNum}
                className={`relative min-w-0 border-2 p-3 transition-all sm:p-4 ${
                  isCurrent
                    ? "border-hot bg-sun/30 shadow-[3px_3px_0_var(--hot)]"
                    : isPast
                      ? "border-ink/60 bg-paper"
                      : "border-ink/20 bg-ivory/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between font-type text-xs">
                  <span className="font-bold uppercase tracking-wider text-ink">ZONE 0{zNum}</span>
                  {isCurrent && (
                    <span className="flex items-center gap-1 font-bold text-hot">
                      <span className="pulse-dot h-2 w-2 rounded-full bg-hot" />
                      LIVE NOW
                    </span>
                  )}
                  {isPast && <span className="font-bold text-ink">✓ COMPLETE</span>}
                  {isFuture && <span className="text-stone">○ PENDING</span>}
                </div>

                <div className="display mt-2 break-words text-xl text-ink [overflow-wrap:anywhere]">{zMeta.title}</div>
                <p className="mt-1 break-words text-xs font-serif text-muted-foreground [overflow-wrap:anywhere]">{zMeta.description}</p>
              </div>
            );
          })}
        </div>

        {/* Simulation Controls for testing live states */}
        {onZoneChange && onToggleSwitchRound && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 pt-4 text-xs font-type">
            <span className="text-muted-foreground">Simulate zone transition:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onZoneChange(1)}
                className={`border border-ink px-2 py-1 ${zone === 1 ? "bg-ink text-sun" : "bg-paper"}`}
              >
                Zone 1
              </button>
              <button
                onClick={() => onZoneChange(2)}
                className={`border border-ink px-2 py-1 ${zone === 2 ? "bg-ink text-sun" : "bg-paper"}`}
              >
                Zone 2
              </button>
              <button
                onClick={() => onZoneChange(3)}
                className={`border border-ink px-2 py-1 ${zone === 3 ? "bg-ink text-sun" : "bg-paper"}`}
              >
                Zone 3
              </button>
              <button
                onClick={onToggleSwitchRound}
                className="max-w-full border border-hot bg-hot/10 px-2 py-1 text-left text-hot hover:bg-hot hover:text-paper"
              >
                {switchRoundTriggered ? "Reset Switch" : "⚡ Trigger Switch Buzzer"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
