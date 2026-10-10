import { useEffect, useState } from "react";

export const cinematicEase = [0.16, 1, 0.3, 1] as const;
export const editorialEase = [0.22, 0.8, 0.22, 1] as const;

export const motionTiming = {
  fast: 0.22,
  standard: 0.45,
  slow: 0.8,
  chapter: 1.1,
  intro: 1.6,
} as const;

export const revealUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export const editorialSpring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 22,
  mass: 0.7,
};

/** True only for mouse/trackpad environments where proximity effects make sense. */
export function useFinePointer() {
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsFinePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isFinePointer;
}
