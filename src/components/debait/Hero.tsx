import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, Radio } from "lucide-react";
import heroAuditorium from "@/assets/hero-auditorium.jpg";
import { event } from "@/content/event";
import { cinematicEase, useFinePointer } from "@/lib/motion";
import { DancingLetters } from "./DancingLetters";
import { Magnetic } from "./Magnetic";
import { TransitionLink } from "./CinematicTransition";

type HeroProps = {
  introReady?: boolean;
};

type FloatingDebatePill = {
  text: string;
  variant: "sun" | "hot";
  pos: string;
  delay: number;
  duration: number;
  rotate: number;
};

// Vibrant, high-contrast debate statement badges from the refined HTML storyboard reference
const floatingDebatePills: FloatingDebatePill[] = [
  {
    text: "Social media made my voice louder.",
    variant: "sun",
    pos: "top-[18%] left-[2%] lg:left-[5%]",
    delay: 0.3,
    duration: 6.8,
    rotate: -2,
  },
  {
    text: "I found my people online.",
    variant: "sun",
    pos: "bottom-[28%] left-[3%] lg:left-[6%]",
    delay: 0.9,
    duration: 7.4,
    rotate: 2.2,
  },
  {
    text: "EVERYBODY'S PERFORMING, NO ONE'S LISTENING.",
    variant: "hot",
    pos: "top-[22%] right-[2%] lg:right-[5%]",
    delay: 0.6,
    duration: 7.0,
    rotate: 2,
  },
  {
    text: "SCROLLING ISN'T CONNECTION.",
    variant: "hot",
    pos: "bottom-[26%] right-[3%] lg:right-[6%]",
    delay: 1.2,
    duration: 6.4,
    rotate: -2.5,
  },
];

const HERO_PHRASES = ["Make your point.", "Same minds, different arguments."];

function HeroTypewriter() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = HERO_PHRASES[phraseIdx] ?? "";
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (displayText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, 75);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2600);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length - 1));
        }, 35);
      } else {
        setIsDeleting(false);
        setPhraseIdx((prev) => (prev + 1) % HERO_PHRASES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIdx]);

  return (
    <span className="inline-flex items-center">
      <span>{displayText}</span>
      <span className="ml-1 inline-block h-6 w-0.5 bg-hot animate-pulse md:h-8" />
    </span>
  );
}

export function Hero({ introReady = true }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const sectionRectRef = useRef<DOMRect | null>(null);
  const reduce = useReducedMotion();
  const finePointer = useFinePointer();
  const ready = introReady || Boolean(reduce);
  const spotlightX = useMotionValue(-620);
  const spotlightY = useMotionValue(-620);
  const springSpotlightX = useSpring(spotlightX, { stiffness: 42, damping: 24, mass: 0.9 });
  const springSpotlightY = useSpring(spotlightY, { stiffness: 42, damping: 24, mass: 0.9 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const wordY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -74]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 64]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.1]);

  const fade = (delay: number, y = 20) => ({
    initial: reduce ? false : { opacity: 0, y },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration: 0.72, delay: ready ? delay : 0, ease: cinematicEase },
  });

  return (
    <section
      id="top"
      ref={ref}
      onPointerEnter={(event) => {
        if (!finePointer || reduce) return;
        sectionRectRef.current = event.currentTarget.getBoundingClientRect();
      }}
      onPointerMove={(event) => {
        if (!finePointer || reduce) return;
        if (!sectionRectRef.current) {
          sectionRectRef.current = event.currentTarget.getBoundingClientRect();
        }
        const rect = sectionRectRef.current;
        spotlightX.set(event.clientX - rect.left - 260);
        spotlightY.set(event.clientY - rect.top - 260);
      }}
      onPointerLeave={() => {
        sectionRectRef.current = null;
        spotlightX.set(-620);
        spotlightY.set(-620);
      }}
      className="grain relative flex min-h-[100svh] flex-col overflow-hidden bg-canvas text-mist"
    >
      {/* LOCKED CINEMATIC HERO BASE: Auditorium with stage lighting, podiums, atmospheric haze */}
      <motion.div
        aria-hidden="true"
        initial={reduce ? false : { clipPath: "inset(6% 5% 6% 5%)", opacity: 0, scale: 1.05 }}
        animate={ready ? { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, scale: 1 } : { opacity: 0 }}
        transition={{ duration: 1.25, ease: cinematicEase }}
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <motion.img
          src={heroAuditorium}
          alt=""
          aria-hidden="true"
          style={{ y: imageY, scale: imageScale }}
          className="h-[114%] w-full scale-105 object-cover object-center opacity-[0.95] brightness-[1.24] saturate-[0.92] contrast-[1.05] md:opacity-[0.84]"
        />

        {/* Cinematic Vignette and Dark Edges to preserve text readability */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_20%,rgba(5,5,5,0.62)_70%,rgba(5,5,5,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,5,0.45)_0%,transparent_35%,rgba(5,5,5,0.65)_75%,rgba(5,5,5,0.94)_100%)] opacity-75 md:opacity-100" />

        {/* Optimized GPU-composited stage lighting beams */}
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={
            ready && !reduce
              ? { opacity: [0.15, 0.28, 0.15], scale: [1, 1.05, 1] }
              : { opacity: 0.18, scale: 1 }
          }
          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
          className="pointer-events-none absolute -left-[10%] top-[4%] h-[56vw] w-[56vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,214,0,0.25)_0%,transparent_70%)] blur-2xl will-change-transform"
        />
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={
            ready && !reduce
              ? { opacity: [0.14, 0.26, 0.14], scale: [1.04, 0.96, 1.04] }
              : { opacity: 0.16, scale: 1 }
          }
          transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
          className="pointer-events-none absolute -right-[12%] top-[10%] h-[58vw] w-[58vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(216,27,114,0.22)_0%,transparent_70%)] blur-2xl will-change-transform"
        />

        {/* Fine pointer atmospheric spotlight */}
        {finePointer && !reduce && (
          <motion.div
            aria-hidden="true"
            style={{ x: springSpotlightX, y: springSpotlightY }}
            className="pointer-events-none absolute left-0 top-0 hidden h-[520px] w-[520px] rounded-full bg-sun/[0.06] blur-[90px] md:block"
          />
        )}
      </motion.div>

      {/* FLOATING DEBATE BADGES (High-contrast, vibrant, matching HTML reference) */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
        {floatingDebatePills.map((pill) => (
          <motion.div
            key={pill.text}
            initial={reduce ? false : { opacity: 0, y: 16, rotate: pill.rotate }}
            animate={
              ready && !reduce
                ? {
                    opacity: 1,
                    y: [0, -10, 0, 8, 0],
                    rotate: [
                      pill.rotate,
                      pill.rotate - 1.5,
                      pill.rotate,
                      pill.rotate + 1.5,
                      pill.rotate,
                    ],
                  }
                : { opacity: 1, y: 0, rotate: pill.rotate }
            }
            transition={{
              duration: pill.duration,
              delay: pill.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute ${pill.pos} hidden pointer-events-auto select-none md:block will-change-transform`}
          >
            <div
              className={`rounded-full px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 ${
                pill.variant === "sun"
                  ? "border border-sun/80 bg-sun text-ink shadow-[0_4px_20px_rgba(255,214,0,0.35)]"
                  : "border border-hot/80 bg-hot text-paper shadow-[0_4px_20px_rgba(216,27,114,0.4)]"
              }`}
            >
              {pill.text}
            </div>
          </motion.div>
        ))}
      </div>

      {/* HERO CONTENT: Refined according to HTML Reference & Storyboard */}
      <div className="relative z-20 flex flex-1 flex-col items-center justify-center px-5 pt-28 md:px-10 md:pt-36">
        <motion.div
          {...fade(0.36)}
          className="flex flex-wrap items-center justify-center gap-3 text-center font-type text-xs uppercase tracking-widest text-mist/75 md:text-sm"
        >
          <span className="text-hot font-bold">
            {event.organizer} · {event.college}
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline text-sun">Theme: {event.theme.join(" ")}</span>
        </motion.div>

        {/* DOMINANT DE'BAIT TITLE with living kinetic DancingLetters */}
        <motion.h1
          style={{ y: wordY }}
          className="display relative z-20 mt-4 text-center leading-[0.78] text-sun drop-shadow-[0_12px_28px_rgba(0,0,0,0.9)] md:mt-6"
        >
          <DancingLetters
            active={ready}
            className="text-[24vw] select-none md:text-[18vw] xl:text-[230px]"
          />
        </motion.h1>

        {/* Typewriter subheadline + event metadata matching HTML reference frames */}
        <motion.div {...fade(0.85)} className="mt-4 text-center md:mt-6">
          <p className="flex min-h-[2.5rem] items-center justify-center font-hand text-2xl text-paper md:min-h-[3.2rem] md:text-4xl">
            <HeroTypewriter />
          </p>
          <p className="mt-2 font-type text-xs uppercase tracking-widest text-mist/75 md:text-sm">
            12–13 October · {event.venue}
          </p>
        </motion.div>

        {/* CTAs styled precisely like the Refined HTML benchmark */}
        <motion.div
          {...fade(1.05)}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 pb-8 md:mt-8"
        >
          <Magnetic>
            <TransitionLink
              href="/register"
              className="btn-hot inline-flex items-center gap-2 rounded-full border-2 border-hot px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-paper shadow-lg hover:shadow-hot/30"
            >
              <span>Register your team</span>
              <ArrowDown size={15} />
            </TransitionLink>
          </Magnetic>
          <Magnetic>
            <TransitionLink
              href="/#format"
              className="btn-ghost inline-flex items-center gap-2 rounded-full border border-mist/40 px-6 py-2.5 font-sans text-xs uppercase tracking-wider text-mist hover:border-sun hover:text-sun"
            >
              <span>See the format</span>
            </TransitionLink>
          </Magnetic>
          <Magnetic>
            <TransitionLink
              href="/scoreboard"
              className="btn-ghost inline-flex items-center gap-2 rounded-full border border-hot/70 px-5 py-2.5 font-sans text-xs uppercase tracking-wider text-hot hover:bg-hot hover:text-paper"
            >
              <Radio size={14} className="animate-pulse" />
              <span>Live Arena</span>
            </TransitionLink>
          </Magnetic>
        </motion.div>
      </div>

      {/* Marquee Ticker */}
      <div className="relative z-30 overflow-hidden border-y border-line bg-canvas/95 py-3 text-sun">
        <div className="marquee flex w-max gap-10 whitespace-nowrap display text-2xl">
          {Array.from({ length: 2 }).map((_, copy) => (
            <div key={copy} className="flex gap-10" aria-hidden={copy === 1}>
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index} className="flex items-center gap-10">
                  DE&apos;BAIT 2026 <span className="text-hot">✱</span> FOR / AGAINST{" "}
                  <span className="text-hot">✱</span>
                  THREE ROUNDS. ONE STAGE.
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
