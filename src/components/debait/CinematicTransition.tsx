import { useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cinematicEase } from "@/lib/motion";

type TransitionContextValue = {
  play: (action: () => void) => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function CinematicTransitionProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"cover" | "reveal" | null>(null);
  const activeRef = useRef(false);
  const timers = useRef<number[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const play = useCallback(
    (action: () => void) => {
      if (reduce) {
        action();
        return;
      }
      if (activeRef.current) return;

      activeRef.current = true;
      setPhase("cover");

      const releaseTimer = (timer: number) => {
        const index = timers.current.indexOf(timer);
        if (index !== -1) timers.current.splice(index, 1);
      };

      // Change routes only after the viewport has been covered.
      const actionTimer = window.setTimeout(() => {
        releaseTimer(actionTimer);
        action();
        setPhase("reveal");
      }, 270);

      const completionTimer = window.setTimeout(() => {
        releaseTimer(completionTimer);
        activeRef.current = false;
        setPhase(null);
      }, 540);

      timers.current.push(actionTimer, completionTimer);
    },
    [reduce],
  );

  return (
    <TransitionContext.Provider value={{ play }}>
      {children}
      {phase && (
        <motion.div
          aria-hidden="true"
          data-transition-phase={phase}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: phase === "cover" ? 1 : 0 }}
          transition={{ duration: 0.27, ease: cinematicEase }}
          style={{ transformOrigin: phase === "cover" ? "left center" : "right center" }}
          className={`pointer-events-auto fixed inset-0 z-[200] origin-left ${phase === "cover" ? "bg-hot" : "bg-sun"}`}
        />
      )}
    </TransitionContext.Provider>
  );
}

// This hook intentionally shares the transition context with its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useCinematicTransition() {
  const value = useContext(TransitionContext);
  if (!value)
    throw new Error("useCinematicTransition must be used inside CinematicTransitionProvider");
  return value;
}

type TransitionLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

/** An anchor that preserves native link affordances while adding the authoritative transition. */
export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  ({ href = "#", onClick, target, ...props }, ref) => {
    const navigate = useNavigate();
    const { play } = useCinematicTransition();

    const go = useCallback(() => {
      const validHref = href || "#";
      const [path, rawHash] = validHref.split("#");
      const hash = rawHash ? `#${rawHash}` : "";

      if (!path || path === window.location.pathname) {
        if (hash) scrollToHash(hash);
        return;
      }

      navigate({ to: path as "/" | "/register" | "/scoreboard" });
      if (hash) window.setTimeout(() => scrollToHash(hash), 80);
    }, [href, navigate]);

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        target
      ) {
        return;
      }
      event.preventDefault();
      play(go);
    };

    return <a ref={ref} href={href || "#"} target={target} onClick={handleClick} {...props} />;
  },
);

TransitionLink.displayName = "TransitionLink";
