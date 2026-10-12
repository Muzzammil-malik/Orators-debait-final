import { createFileRoute } from "@tanstack/react-router";
import { useTournament } from "@/hooks/useTournament";
import { ScoreboardHeader } from "@/components/debait/scoreboard/ScoreboardHeader";
import { LiveMatches } from "@/components/debait/scoreboard/LiveMatches";
import { LiveScorecard } from "@/components/debait/scoreboard/LiveScorecard";
import { AudienceVoting } from "@/components/debait/scoreboard/AudienceVoting";
import { RecentResults } from "@/components/debait/scoreboard/RecentResults";
import { MatchDetailModal } from "@/components/debait/scoreboard/MatchDetailModal";
import { TournamentBracket } from "@/components/debait/scoreboard/TournamentBracket";
import logoMark from "@/assets/logo-mark.png";

export const Route = createFileRoute("/scoreboard")({
  head: () => ({
    meta: [
      { title: "Live Arena & Scoreboard | DE'BAIT — Orators' Club MJCET" },
      {
        name: "description",
        content:
          "Live match scorecard and audience voting pulse for DE'BAIT by Orators' Club MJCET.",
      },
      { property: "og:title", content: "DE'BAIT Live Arena & Scoreboard" },
      {
        property: "og:description",
        content:
          "Live tournament tree, real-time judge scoring breakdown, and audience voting for DE'BAIT by Orators' Club MJCET.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScoreboardPage,
});

function ScoreboardPage() {
  const {
    tree,
    allMatches,
    liveMatches,
    activeMatch,
    selectedMatchId,
    setSelectedMatchId,
    modalMatch,
    modalMatchId,
    setModalMatchId,
    userVote,
    castVote,
    isLoading,
    error,
    refetch,
  } = useTournament();

  return (
    <main className="scoreboard-site min-h-screen bg-canvas text-mist selection:bg-hot selection:text-paper">
      {/* 1. COMPACT SCOREBOARD SPECIFIC HEADER */}
      <ScoreboardHeader hasLiveMatch={liveMatches.length > 0} />

      {(isLoading || error) && (
        <div className="mx-auto mt-4 max-w-[1400px] px-4 md:px-8">
          {isLoading && (
            <p
              role="status"
              className="border border-ink/20 bg-paper px-4 py-3 font-type text-xs text-ink"
            >
              Connecting to the live tournament…
            </p>
          )}
          {error && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 border border-hot bg-paper px-4 py-3 font-type text-xs text-ink"
            >
              <span>Tournament data could not be refreshed. Check your connection and retry.</span>
              <button
                type="button"
                onClick={() => void refetch()}
                className="border border-ink px-3 py-1.5 font-bold uppercase hover:bg-ink hover:text-sun"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Scoreboard Content Container */}
      <div className="mx-auto max-w-[1700px] px-3 py-8 md:px-6 space-y-16">
        {/* Banner: Editorial Hero Strip for Scoreboard */}
        <div className="border-b-4 border-ink pb-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-type text-xs uppercase tracking-widest text-hot font-bold">
                <span>ORATORS&rsquo; CLUB MJCET</span>
                <span>·</span>
                <span>OFFICIAL TOURNAMENT DESK</span>
              </div>
              <h1 className="display text-6xl md:text-8xl tracking-tight text-ink mt-2">
                Live <span className="text-hot">Scoreboard.</span>
              </h1>
              <p className="mt-3 font-serif text-lg md:text-xl text-ink/80 max-w-2xl">
                Real-time tournament progression, judge scoring, and audience sentiment for
                DE&rsquo;BAIT. 16 teams, 8 preliminary rounds, Top 8 evaluation,{" "}
                {tree?.semiFinals.length ?? 0} semifinal matches, and 1 grand championship final.
              </p>
            </div>

            {/* Quick Live Status Card */}
            <div className="border-3 border-ink bg-sun p-4 shadow-[4px_4px_0_var(--ink)] min-w-[260px]">
              <div className="font-type text-xs uppercase tracking-widest text-ink font-bold">
                TOURNAMENT STATUS
              </div>
              <div className="display mt-1 text-3xl text-ink">
                {liveMatches.length > 0 ? "ROUND IN PROGRESS" : "AWAITING NEXT ROUND"}
              </div>
              <div className="mt-2 text-xs font-type text-ink/80">
                8 Prelims → Top 8 Knockout · 100-Point System
              </div>
            </div>
          </div>
        </div>

        {tree && (
          <TournamentBracket
            tree={tree}
            selectedMatchId={selectedMatchId}
            onSelectMatch={(id) => {
              setSelectedMatchId(id);
              const el = document.getElementById("live-scorecard-section");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            onOpenMatchModal={(id) => setModalMatchId(id)}
          />
        )}

        {/* 3. CURRENT LIVE MATCHES */}
        <LiveMatches
          matches={liveMatches}
          selectedMatchId={selectedMatchId}
          onSelectMatch={(id) => {
            setSelectedMatchId(id);
            const el = document.getElementById("live-scorecard-section");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />

        {/* 4. LIVE SCORECARD (Functional Centerpiece) */}
        <div id="live-scorecard-section" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-3">
            <div>
              <div className="flex items-center gap-2 font-type text-xs uppercase tracking-widest text-ink">
                <span className="bg-ink px-2 py-0.5 text-sun">STAGE 03</span>
                <span>·</span>
                <span>Official Scoring</span>
              </div>
              <h2 className="display text-4xl text-ink md:text-5xl">
                Match <span className="text-hot">Scorecard.</span>
              </h2>
            </div>
            <div className="text-xs font-type text-muted-foreground">
              Official judge marks: Content (40) + Strategy (30) + Style (30)
            </div>
          </div>

          <LiveScorecard match={activeMatch} />
        </div>

        {/* 5. AUDIENCE / PARTICIPANT VOTING (Interactive Centerpiece) */}
        <AudienceVoting match={activeMatch} userVote={userVote} onCastVote={castVote} />

        {/* 6. RECENT RESULTS / MATCH HISTORY */}
        <RecentResults matches={allMatches} onOpenMatchModal={(id) => setModalMatchId(id)} />
      </div>

      {/* 7. MATCH DETAIL SUMMARY MODAL */}
      <MatchDetailModal
        match={modalMatch}
        isOpen={!!modalMatchId}
        onClose={() => setModalMatchId(null)}
      />

      {/* Clean Scoreboard Footer */}
      <footer className="mt-20 border-t-4 border-ink bg-sun px-6 py-12 md:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={logoMark}
              alt="Orators' Club MJCET"
              className="h-12 w-12 rounded-full border border-ink object-cover"
            />
            <div>
              <p className="display text-2xl text-ink">Orators&rsquo; Club</p>
              <p className="font-type text-xs uppercase text-ink/80">
                MJCET · Department of English · DE&rsquo;BAIT 2026
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-type text-xs uppercase tracking-wider text-ink">
            <a href="/" className="underline hover:text-hot">
              ← Return to Main Event Site
            </a>
            <a href="/#rules" className="underline hover:text-hot">
              Official Rulebook
            </a>
            <a href="/#schedule" className="underline hover:text-hot">
              Full Schedule
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
