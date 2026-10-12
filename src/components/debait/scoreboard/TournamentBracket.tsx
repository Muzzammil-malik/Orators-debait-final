import { useState } from "react";
import type { Match, TournamentTree } from "@/content/tournament";
import { ChampionNode } from "./ChampionNode";

interface TournamentBracketProps {
  tree: TournamentTree;
  selectedMatchId?: string;
  onSelectMatch: (matchId: string) => void;
  onOpenMatchModal: (matchId: string) => void;
}

export function TournamentBracket({
  tree,
  selectedMatchId,
  onSelectMatch,
  onOpenMatchModal,
}: TournamentBracketProps) {
  // Mobile stage tab: "prelims" | "sf" | "final"
  const [mobileStage, setMobileStage] = useState<"prelims" | "sf" | "final">("sf");
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);

  const { preliminaries = [], semiFinals = [], final, champion } = tree;

  // 8 Preliminary rounds: 4 on left side, 4 on right side
  const prelimsLeft = preliminaries.slice(0, 4); // PR 01, PR 02, PR 03, PR 04
  const prelimsRight = preliminaries.slice(4, 8); // PR 05, PR 06, PR 07, PR 08

  const semifinalSplitIndex = Math.ceil(semiFinals.length / 2);
  const semiFinalsLeft = semiFinals.slice(0, semifinalSplitIndex);
  const semiFinalsRight = semiFinals.slice(semifinalSplitIndex);

  return (
    <section
      id="tree"
      className="grain relative bg-ivory py-8 md:py-14 overflow-x-hidden"
      aria-label="Tournament Bracket"
    >
      <div className="w-full px-2 md:px-4">
        {/* Section Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
          <div>
            <div className="mb-1 flex items-center gap-3 font-type text-xs uppercase tracking-widest text-ink">
              <span className="bg-ink px-2 py-0.5 text-sun">STAGE 01</span>
              <span>16 Teams · 8 Prelims → Top 8 Evaluated → Semifinals → Grand Final</span>
            </div>
            <h2 className="display text-4xl text-ink md:text-6xl">
              Tournament <span className="text-hot">Tree.</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-type">
            <span className="flex items-center gap-1.5 border border-ink bg-paper px-2 py-1">
              <span className="h-2 w-2 rounded-full bg-hot" />
              <span className="text-ink">Live Match</span>
            </span>
            <span className="flex items-center gap-1.5 border border-ink bg-sun px-2 py-1 font-bold text-ink">
              <span>★</span>
              <span>Advancing Team</span>
            </span>
            <span className="flex items-center gap-1.5 border border-ink/40 bg-paper px-2 py-1 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-stone" />
              <span>Completed / Upcoming</span>
            </span>
          </div>
        </div>

        {/* Mobile Stage Selector (Tab controls under 1024px) */}
        <div
          className="mb-6 flex flex-wrap gap-2 lg:hidden"
          role="tablist"
          aria-label="Bracket stages"
        >
          {[
            { id: "prelims", label: "Preliminaries", count: 8 },
            { id: "sf", label: "Semifinals", count: semiFinals.length },
            { id: "final", label: "Championship Final", count: final ? 1 : 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={mobileStage === tab.id}
              onClick={() => setMobileStage(tab.id as "prelims" | "sf" | "final")}
              className={`flex-1 min-w-[120px] border-2 border-ink px-3 py-2 text-center font-type text-xs uppercase tracking-wider transition-colors ${
                mobileStage === tab.id
                  ? "bg-ink text-sun shadow-[2px_2px_0_var(--hot)] font-bold"
                  : "bg-paper text-ink hover:bg-sun/40"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* DESKTOP TOURNAMENT TREE (Prelims Left -> Semifinals -> Grand Final -> Semifinals -> Prelims Right) */}
        <div className="hidden lg:block w-full overflow-hidden pb-6">
          <div className="w-full">
            {/* Column Titles */}
            <div className="grid grid-cols-[1.2fr_1.1fr_1.3fr_1.1fr_1.2fr] gap-3 mb-3 text-center font-type text-xs font-bold uppercase tracking-wider text-ink">
              <div className="border-b-2 border-ink bg-paper/70 py-1.5 px-1 leading-tight">
                PRELIMINARIES
                <br />
                <span className="text-[10px] opacity-70">DAY 01 · MATCHES 01–04</span>
              </div>
              <div className="border-b-2 border-ink bg-paper/70 py-1.5 px-1 leading-tight">
                SEMIFINALS · A
                <br />
                <span className="text-[10px] opacity-70">
                  {semiFinalsLeft.length} {semiFinalsLeft.length === 1 ? "MATCH" : "MATCHES"}
                </span>
              </div>
              <div className="border-b-2 border-hot bg-sun/60 py-1.5 px-1 text-white leading-tight">
                GRAND FINAL &amp; TITLE
                <br />
                <span className="text-[10px] opacity-80">CHAMPIONSHIP DEBATE</span>
              </div>
              <div className="border-b-2 border-ink bg-paper/70 py-1.5 px-1 leading-tight">
                SEMIFINALS · B
                <br />
                <span className="text-[10px] opacity-70">
                  {semiFinalsRight.length} {semiFinalsRight.length === 1 ? "MATCH" : "MATCHES"}
                </span>
              </div>
              <div className="border-b-2 border-ink bg-paper/70 py-1.5 px-1 leading-tight">
                PRELIMINARIES
                <br />
                <span className="text-[10px] opacity-70">DAY 01 · MATCHES 05–08</span>
              </div>
            </div>

            {/* Visual Tree Grid with 5 Connected Columns */}
            <div className="grid grid-cols-[1.2fr_1.1fr_1.3fr_1.1fr_1.2fr] items-center gap-3 relative py-2">
              {/* SVG Connecting Lines Layer */}
              <svg
                className="absolute inset-0 pointer-events-none w-full h-full z-0"
                style={{ overflow: "visible" }}
                aria-hidden="true"
              >
                {/* Connectors: Left Prelims to SF 1 */}
                <path
                  d="M 23% 13% L 25% 13% L 25% 50% L 27% 50%"
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                />
                <path
                  d="M 23% 38% L 25% 38% L 25% 50% L 27% 50%"
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                />
                <path
                  d="M 23% 63% L 25% 63% L 25% 50% L 27% 50%"
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                />
                <path
                  d="M 23% 88% L 25% 88% L 25% 50% L 27% 50%"
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                />

                {/* Connector: SF 1 to Grand Final */}
                <path d="M 44% 50% L 47% 50%" fill="none" stroke="var(--ink)" strokeWidth="2.5" />

                {/* Connector: SF 2 to Grand Final */}
                <path d="M 56% 50% L 53% 50%" fill="none" stroke="var(--ink)" strokeWidth="2.5" />

                {/* Connectors: Right Prelims to SF 2 */}
                <path
                  d="M 77% 13% L 75% 13% L 75% 50% L 73% 50%"
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                />
                <path
                  d="M 77% 38% L 75% 38% L 75% 50% L 73% 50%"
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                />
                <path
                  d="M 77% 63% L 75% 63% L 75% 50% L 73% 50%"
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                />
                <path
                  d="M 77% 88% L 75% 88% L 75% 50% L 73% 50%"
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                />
              </svg>

              {/* Column 1: Preliminaries Left (PR 1 to 4) */}
              <div className="relative z-10 flex flex-col gap-2.5 justify-between py-1">
                {prelimsLeft.map((match) => (
                  <BracketMatchCard
                    key={match.id}
                    match={match}
                    compact
                    isSelected={selectedMatchId === match.id}
                    hoveredTeamId={hoveredTeamId}
                    onHoverTeam={setHoveredTeamId}
                    onSelect={() => onSelectMatch(match.id)}
                    onOpenModal={() => onOpenMatchModal(match.id)}
                  />
                ))}
              </div>

              {/* Column 2: Semifinals */}
              <div className="relative z-10 flex flex-col justify-center gap-2.5 py-3">
                {semiFinalsLeft.map((match) => (
                  <BracketMatchCard
                    key={match.id}
                    match={match}
                    isSelected={selectedMatchId === match.id}
                    hoveredTeamId={hoveredTeamId}
                    onHoverTeam={setHoveredTeamId}
                    onSelect={() => onSelectMatch(match.id)}
                    onOpenModal={() => onOpenMatchModal(match.id)}
                  />
                ))}
              </div>

              {/* Column 3: Center Grand Final & Champion Trophy */}
              <div className="relative z-10 flex flex-col items-center justify-center gap-3 py-3">
                {final && (
                  <>
                    <ChampionNode champion={champion} finalCompleted={final.status === "completed"} />
                    <div className="w-full max-w-sm">
                      <BracketMatchCard
                        match={final}
                        isFinal
                        isSelected={selectedMatchId === final.id}
                        hoveredTeamId={hoveredTeamId}
                        onHoverTeam={setHoveredTeamId}
                        onSelect={() => onSelectMatch(final.id)}
                        onOpenModal={() => onOpenMatchModal(final.id)}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Column 4: Semifinals */}
              <div className="relative z-10 flex flex-col justify-center gap-2.5 py-3">
                {semiFinalsRight.map((match) => (
                  <BracketMatchCard
                    key={match.id}
                    match={match}
                    isSelected={selectedMatchId === match.id}
                    hoveredTeamId={hoveredTeamId}
                    onHoverTeam={setHoveredTeamId}
                    onSelect={() => onSelectMatch(match.id)}
                    onOpenModal={() => onOpenMatchModal(match.id)}
                  />
                ))}
              </div>

              {/* Column 5: Preliminaries Right (PR 5 to 8) */}
              <div className="relative z-10 flex flex-col gap-2.5 justify-between py-1">
                {prelimsRight.map((match) => (
                  <BracketMatchCard
                    key={match.id}
                    match={match}
                    compact
                    isSelected={selectedMatchId === match.id}
                    hoveredTeamId={hoveredTeamId}
                    onHoverTeam={setHoveredTeamId}
                    onSelect={() => onSelectMatch(match.id)}
                    onOpenModal={() => onOpenMatchModal(match.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE RESPONSIVE BRACKET VIEW (Tabs for Prelims, SF, Final) */}
        <div className="lg:hidden space-y-6">
          {mobileStage === "prelims" && (
            <div className="space-y-6">
              <div>
                <div className="font-type text-xs uppercase tracking-widest text-ink font-bold pb-2 border-b-2 border-ink flex items-center justify-between">
                  <span>Day 01 Prelims (Matches 01–04)</span>
                  <span className="text-hot">Top 8 Advance</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 mt-3">
                  {prelimsLeft.map((match) => (
                    <BracketMatchCard
                      key={match.id}
                      match={match}
                      isSelected={selectedMatchId === match.id}
                      hoveredTeamId={hoveredTeamId}
                      onHoverTeam={setHoveredTeamId}
                      onSelect={() => onSelectMatch(match.id)}
                      onOpenModal={() => onOpenMatchModal(match.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="font-type text-xs uppercase tracking-widest text-ink font-bold pb-2 border-b-2 border-ink flex items-center justify-between">
                  <span>Day 01 Prelims (Matches 05–08)</span>
                  <span className="text-hot">Top 8 Advance</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 mt-3">
                  {prelimsRight.map((match) => (
                    <BracketMatchCard
                      key={match.id}
                      match={match}
                      isSelected={selectedMatchId === match.id}
                      hoveredTeamId={hoveredTeamId}
                      onHoverTeam={setHoveredTeamId}
                      onSelect={() => onSelectMatch(match.id)}
                      onOpenModal={() => onOpenMatchModal(match.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {mobileStage === "sf" && (
            <div className="space-y-4">
              <div className="font-type text-xs uppercase tracking-widest text-muted-foreground pb-2 border-b border-ink/20">
                Semifinals (Winners Advance to Championship Final)
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {semiFinals.map((match) => (
                  <BracketMatchCard
                    key={match.id}
                    match={match}
                    isSelected={selectedMatchId === match.id}
                    hoveredTeamId={hoveredTeamId}
                    onHoverTeam={setHoveredTeamId}
                    onSelect={() => onSelectMatch(match.id)}
                    onOpenModal={() => onOpenMatchModal(match.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {mobileStage === "final" && (
            <div className="space-y-6">
              {final && (
                <>
                  <ChampionNode champion={champion} finalCompleted={final.status === "completed"} />
                  <div className="max-w-md mx-auto">
                    <BracketMatchCard
                      match={final}
                      isFinal
                      isSelected={selectedMatchId === final.id}
                      hoveredTeamId={hoveredTeamId}
                      onHoverTeam={setHoveredTeamId}
                      onSelect={() => onSelectMatch(final.id)}
                      onOpenModal={() => onOpenMatchModal(final.id)}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom Interactive Help */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 pt-4 text-xs font-type text-muted-foreground">
          <div>
            💡 <strong className="text-ink">Official Structure:</strong> 16 Teams → 8 Preliminaries
            → Top 8 Evaluated → {semiFinals.length} Semifinal Matches → 1 Grand Final. Click any
            match to inspect its live score breakdown.
          </div>
          <div className="text-stone">
            All match results certified by Orators&rsquo; Club Tabulation Desk.
          </div>
        </div>
      </div>
    </section>
  );
}

interface BracketMatchCardProps {
  match: Match;
  isFinal?: boolean;
  isSelected?: boolean;
  compact?: boolean;
  hoveredTeamId: string | null;
  onHoverTeam: (teamId: string | null) => void;
  onSelect: () => void;
  onOpenModal: () => void;
}

function BracketMatchCard({
  match,
  isFinal,
  isSelected,
  hoveredTeamId,
  onHoverTeam,
  onSelect,
  onOpenModal,
}: BracketMatchCardProps) {
  const isLive = match.status === "live";
  const isCompleted = match.status === "completed";

  const isWinnerA = isCompleted && match.winnerTeamId === match.teamA?.id;
  const isWinnerB = isCompleted && match.winnerTeamId === match.teamB?.id;

  const isEliminatedA = isCompleted && !isWinnerA && !!match.winnerTeamId;
  const isEliminatedB = isCompleted && !isWinnerB && !!match.winnerTeamId;

  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer border-2 transition-all ${
        isLive
          ? "border-hot bg-paper shadow-[3px_3px_0_var(--hot)] ring-1 ring-hot/30"
          : isSelected
            ? "border-ink bg-sun shadow-[3px_3px_0_var(--ink)]"
            : "border-ink bg-paper shadow-[2px_2px_0_var(--ink)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)]"
      }`}
    >
      {/* Top Match Header Strip */}
      <div
        className={`flex items-center justify-between border-b-2 border-ink px-2 py-0.5 font-type text-[10px] uppercase tracking-wider ${
          isLive
            ? "bg-hot text-paper font-bold"
            : isFinal
              ? "bg-sun text-ink font-bold"
              : "bg-ivory text-ink"
        }`}
      >
        <span className="font-bold truncate">{match.roundLabel}</span>
        {isLive && (
          <span className="flex items-center gap-1 font-bold shrink-0">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-paper" />Z{match.zone}
          </span>
        )}
        {isCompleted && (
          <span className="flex items-center gap-1 rounded-full border border-emerald-500/60 bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-300 shrink-0">
            ✓
          </span>
        )}
        {!isLive && !isCompleted && <span className="text-[9px] text-stone shrink-0">–</span>}
      </div>

      {/* Team A Row */}
      <div
        onMouseEnter={() => match.teamA && onHoverTeam(match.teamA.id)}
        onMouseLeave={() => onHoverTeam(null)}
        className={`flex items-center justify-between border-b border-ink/20 px-2 py-1.5 transition-colors ${
          isWinnerA ? "bg-sun/40 font-bold" : ""
        } ${isEliminatedA ? "bg-ivory/15" : ""} ${
          hoveredTeamId && match.teamA && hoveredTeamId === match.teamA.id ? "bg-sun/60" : ""
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
          <span
            className={`display flex h-4 w-4 shrink-0 items-center justify-center border border-ink text-[10px] ${
              isWinnerA ? "bg-ink text-sun" : "bg-paper text-ink"
            }`}
          >
            {match.teamA ? String(match.teamA.number).padStart(2, "0") : "–"}
          </span>
          <span
            className={`truncate font-type text-[11px] uppercase leading-none ${
              isWinnerA ? "text-ink font-bold" : "font-semibold text-white"
            }`}
          >
            {match.teamA ? match.teamA.name : "TBD"}
          </span>
        </div>
        <div className="shrink-0 pl-1">
          {match.scoreA ? (
            <span
              className={`display text-base leading-none ${
                isWinnerA ? "text-ink font-bold" : "font-bold text-white"
              }`}
            >
              {match.scoreA.total}
            </span>
          ) : (
            <span className="font-type text-[10px] text-stone">--</span>
          )}
        </div>
      </div>

      {/* Team B Row */}
      <div
        onMouseEnter={() => match.teamB && onHoverTeam(match.teamB.id)}
        onMouseLeave={() => onHoverTeam(null)}
        className={`flex items-center justify-between px-2 py-1.5 transition-colors ${
          isWinnerB ? "bg-sun/40 font-bold" : ""
        } ${isEliminatedB ? "bg-ivory/15" : ""} ${
          hoveredTeamId && match.teamB && hoveredTeamId === match.teamB.id ? "bg-sun/60" : ""
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
          <span
            className={`display flex h-4 w-4 shrink-0 items-center justify-center border border-ink text-[10px] ${
              isWinnerB ? "bg-ink text-sun" : "bg-paper text-ink"
            }`}
          >
            {match.teamB ? String(match.teamB.number).padStart(2, "0") : "–"}
          </span>
          <span
            className={`truncate font-type text-[11px] uppercase leading-none ${
              isWinnerB ? "text-ink font-bold" : "font-semibold text-white"
            }`}
          >
            {match.teamB ? match.teamB.name : "TBD"}
          </span>
        </div>
        <div className="shrink-0 pl-1">
          {match.scoreB ? (
            <span
              className={`display text-base leading-none ${
                isWinnerB ? "text-ink font-bold" : "font-bold text-white"
              }`}
            >
              {match.scoreB.total}
            </span>
          ) : (
            <span className="font-type text-[10px] text-stone">--</span>
          )}
        </div>
      </div>

      {/* Footer Details strip */}
      <div className="flex items-center justify-between border-t border-ink/20 bg-ivory/60 px-2 py-0.5 font-type text-[9px] text-muted-foreground">
        <span className="truncate">{match.scheduledTime || match.court}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenModal();
          }}
          className="text-ink underline hover:text-hot shrink-0 ml-1"
        >
          ↗
        </button>
      </div>
    </div>
  );
}
