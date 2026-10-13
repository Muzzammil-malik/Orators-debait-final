import logoMark from "@/assets/logo-mark.png";
import { Magnetic } from "../Magnetic";
import { TransitionLink } from "../CinematicTransition";

interface ScoreboardHeaderProps {
  hasLiveMatch: boolean;
}

export function ScoreboardHeader({ hasLiveMatch }: ScoreboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-ivory/95 backdrop-blur-md">
      {/* Top Banner & Navigation */}
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-8">
        {/* Brand Link back to landing */}
        <Magnetic strength={8}>
          <TransitionLink
            href="/"
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
            title="Return to DE'BAIT Home"
          >
            <img
              src={logoMark}
              alt="Orators' Club MJCET"
              className="h-10 w-10 rounded-full border border-ink object-cover"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-type text-[10px] uppercase tracking-widest text-hot">
                Orators&rsquo; Club
              </span>
              <span className="display text-xl md:text-2xl">
                De<span className="text-hot">&rsquo;</span>Bait
              </span>
            </div>
          </TransitionLink>
        </Magnetic>

        {/* Center: Live / Status Indicator */}
        <div className="flex items-center gap-3">
          {hasLiveMatch ? (
            <div className="flex items-center gap-2 border-2 border-ink bg-sun px-3 py-1 text-ink shadow-[2px_2px_0_var(--ink)]">
              <span className="pulse-dot h-2.5 w-2.5 rounded-full bg-hot" />
              <span className="font-type text-xs font-bold uppercase tracking-wider">
                ● LIVE NOW
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 border border-ink/40 bg-paper px-3 py-1 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-stone" />
              <span className="font-type text-xs uppercase tracking-wider">Standby</span>
            </div>
          )}

          <div className="hidden items-center gap-1 font-type text-xs text-muted-foreground lg:flex">
            <span className="text-ink">THEME:</span>
            <span className="font-bold text-hot">Social Media &amp; Digital Natives</span>
          </div>
        </div>

        {/* Right: Quick Anchor Links */}
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-4 text-xs uppercase tracking-wider md:flex font-type">
            <Magnetic strength={7}>
              <TransitionLink href="#tree" className="text-ink hover:text-hot">
                Bracket
              </TransitionLink>
            </Magnetic>
            <Magnetic strength={7}>
              <TransitionLink href="#live-section" className="text-ink hover:text-hot">
                Live Match
              </TransitionLink>
            </Magnetic>
            <Magnetic strength={7}>
              <TransitionLink href="#voting" className="text-ink hover:text-hot">
                Audience Pulse
              </TransitionLink>
            </Magnetic>
            <Magnetic strength={7}>
              <TransitionLink href="#results" className="text-ink hover:text-hot">
                Results
              </TransitionLink>
            </Magnetic>
          </nav>

          <Magnetic strength={8}>
            <TransitionLink
              href="/"
              className="border-2 border-ink bg-paper px-3 py-1 font-type text-xs uppercase text-ink transition-colors hover:bg-ink hover:text-sun"
            >
              ← Main Site
            </TransitionLink>
          </Magnetic>
        </div>
      </div>

      {/* Editorial Subheader Title strip */}
      <div className="border-t border-ink/15 bg-paper px-4 py-2 text-center md:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 text-xs font-type">
          <div className="flex items-center gap-2">
            <span className="bg-ink px-1.5 py-0.5 text-sun font-bold">EVENT DESK</span>
            <span className="text-ink font-semibold uppercase tracking-wider">
              16 Teams · 8 Prelims (4 Left · 4 Right) → 4 Quarter-finals → 2 Semi-finals → Final ·
              100-Point System
            </span>
          </div>
          <div className="text-stone text-[11px]">
            Official Scoring: Content (40) + Strategy (30) + Style (30) · Audience Sentiment Tracked
            Separately
          </div>
        </div>
      </div>
    </header>
  );
}
