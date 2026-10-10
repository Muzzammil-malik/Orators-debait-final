import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "@/hooks/useLenis";
import { cinematicEase, motionTiming } from "@/lib/motion";
import { ParticleWordmark } from "./ParticleWordmark";

const introSessionKey = "debait-2026-intro-seen";
const introTimeline = {
  atmosphere: 120,
  formation: 100,
  formed: 650,
  handoff: 1050,
  complete: motionTiming.intro * 1000,
} as const;

function hasSeenIntro() {
  try {
    return window.sessionStorage.getItem(introSessionKey) === "true";
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    window.sessionStorage.setItem(introSessionKey, "true");
  } catch {
    // A private or restricted browser can still experience the sequence safely.
  }
}

type OpeningSequenceProps = {
  onComplete: () => void;
  onReveal: () => void;
};

/**
 * A single-visit, soundless event-title sequence. The final handoff starts
 * the actual hero underneath the overlay before the overlay retreats.
 */
export function OpeningSequence({ onComplete, onReveal }: OpeningSequenceProps) {
  const [visible, setVisible] = useState(true);
  const [atmosphere, setAtmosphere] = useState(false);
  const [formed, setFormed] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const completed = useRef(false);
  const revealed = useRef(false);
  const reduce = useReducedMotion();
  const { isReducedMotion, start, stop } = useLenis();

  const reveal = useCallback(() => {
    if (revealed.current) return;
    revealed.current = true;
    setHandoff(true);
    onReveal();
  }, [onReveal]);

  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    reveal();
    markIntroSeen();
    setVisible(false);
    onComplete();
  }, [onComplete, reveal]);

  const resumeScrolling = useCallback(() => {
    // Let the outgoing particle canvas and full-screen exit composition unmount
    // before Lenis accepts input. This keeps the first wheel gesture from doing
    // the intro teardown and smooth-scroll handoff in the same frame.
    if (completed.current) start();
  }, [start]);

  useEffect(() => {
    if (!visible) return;
    const shouldSkip = reduce || isReducedMotion || hasSeenIntro();
    if (shouldSkip) {
      finish();
      return;
    }

    stop();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKeyDown);
    const atmosphereTimer = window.setTimeout(() => setAtmosphere(true), introTimeline.atmosphere);
    const formedTimer = window.setTimeout(() => setFormed(true), introTimeline.formed);
    const handoffTimer = window.setTimeout(reveal, introTimeline.handoff);
    const completeTimer = window.setTimeout(finish, introTimeline.complete);

    return () => {
      window.clearTimeout(atmosphereTimer);
      window.clearTimeout(formedTimer);
      window.clearTimeout(handoffTimer);
      window.clearTimeout(completeTimer);
      window.removeEventListener("keydown", onKeyDown);
      if (!completed.current) start();
    };
  }, [finish, isReducedMotion, reduce, reveal, start, stop, visible]);

  return (
    <AnimatePresence onExitComplete={resumeScrolling}>
      {visible && (
        <motion.section
          key="opening-sequence"
          aria-label="DE'BAIT opening sequence"
          initial={{ opacity: 1 }}
          animate={{ backgroundColor: handoff ? "rgba(5, 5, 5, 0.22)" : "rgba(5, 5, 5, 1)" }}
          exit={{ opacity: 0, clipPath: "inset(0 0 72% 0)" }}
          transition={{ duration: handoff ? 0.4 : 0.45, ease: cinematicEase }}
          className="intro-sequence fixed inset-0 z-[100] isolate overflow-hidden bg-canvas text-mist"
        >
          <motion.div
            aria-hidden="true"
            animate={{ opacity: atmosphere ? 0.22 : 0 }}
            transition={{ duration: 0.8, ease: cinematicEase }}
            className="intro-sequence__light intro-sequence__light--yellow"
          />
          <motion.div
            aria-hidden="true"
            animate={{ opacity: atmosphere ? 0.18 : 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: cinematicEase }}
            className="intro-sequence__light intro-sequence__light--magenta"
          />
          <motion.div
            aria-hidden="true"
            animate={{ opacity: handoff ? 0.18 : 0.7 }}
            transition={{ duration: 0.65, ease: cinematicEase }}
            className="grain-dark absolute inset-0"
          />
          <ParticleWordmark formationDelay={introTimeline.formation} formationDuration={500} />

          <div className="relative z-10 flex h-full flex-col justify-between px-5 py-6 md:px-10 md:py-9">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{
                opacity: formed ? 0 : atmosphere ? 1 : 0,
                scale: formed ? 1.05 : 1,
                y: formed ? -16 : 0,
              }}
              transition={{ duration: 0.55, ease: cinematicEase }}
              className="absolute left-1/2 top-[46%] w-full -translate-x-1/2 -translate-y-1/2 text-center"
            >
              <p className="font-type text-xs uppercase tracking-[0.42em] text-hot md:text-sm">
                Orators&apos; Club MJCET Presents
              </p>
              <h2 className="display mt-2 text-4xl uppercase tracking-wider text-mist md:text-6xl">
                DE&apos;BAIT 2026
              </h2>
            </motion.div>

            <div className="relative flex flex-1 items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 28 }}
                animate={{
                  opacity: formed ? (handoff ? 0 : 1) : 0,
                  scale: handoff ? 1.25 : 1,
                  y: 0,
                }}
                transition={{ duration: handoff ? 0.85 : 0.48, ease: cinematicEase }}
                className="relative text-center"
              >
                <p className="mb-4 font-type text-[11px] uppercase tracking-[0.35em] text-mist/65 md:text-xs">
                  Same minds. Different arguments.
                </p>
                <p className="display intro-sequence__wordmark text-[18vw] leading-none text-sun drop-shadow-[0_0_35px_rgba(255,214,0,0.35)] md:text-[14vw]">
                  DE&apos;BAIT
                </p>
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={
                    formed ? { scaleX: 1, opacity: handoff ? 0 : 1 } : { scaleX: 0, opacity: 0 }
                  }
                  transition={{ delay: formed ? 0.08 : 0, duration: 0.38, ease: cinematicEase }}
                  className="mx-auto mt-5 h-0.5 w-[72%] origin-left bg-hot"
                />
              </motion.div>
            </div>

            <div className="flex items-end justify-between gap-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: atmosphere ? (handoff ? 0 : 0.6) : 0 }}
                transition={{ duration: 0.4 }}
                className="font-type text-[10px] uppercase tracking-[0.22em] text-mist/65"
              >
                The Stage Is Set
              </motion.p>
              <button
                type="button"
                onClick={finish}
                className="font-type text-[10px] uppercase tracking-[0.2em] text-mist/80 underline decoration-hot underline-offset-4 transition-colors hover:text-sun focus-visible:outline-2 focus-visible:outline-hot focus-visible:outline-offset-4"
              >
                Skip intro →
              </button>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
