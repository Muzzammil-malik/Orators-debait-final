import { useEffect, useRef } from "react";

type Particle = {
  color: string;
  driftX: number;
  driftY: number;
  targetX: number;
  targetY: number;
};

type ParticleWordmarkProps = {
  formationDelay?: number;
  formationDuration?: number;
};

/** A one-shot dust title: fragments gather, settle, then hold inside the intro atmosphere. */
export function ParticleWordmark({
  formationDelay = 0,
  formationDuration = 1250,
}: ParticleWordmarkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const compact = window.matchMedia("(max-width: 767px)");
    const offscreen = document.createElement("canvas");
    const offscreenContext = offscreen.getContext("2d", { willReadFrequently: true });
    if (!offscreenContext) return;

    let particles: Particle[] = [];
    let frame = 0;
    let lastDraw = 0;
    let width = 0;
    let height = 0;
    let ratio = 1;
    const start = performance.now();

    const createParticles = () => {
      const rect = canvas.getBoundingClientRect();
      ratio = Math.min(window.devicePixelRatio || 1, compact.matches ? 1 : 1.4);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      offscreen.width = Math.floor(width * ratio);
      offscreen.height = Math.floor(height * ratio);
      offscreenContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      offscreenContext.clearRect(0, 0, width, height);

      const fontSize = Math.min(
        width * (compact.matches ? 0.19 : 0.15),
        compact.matches ? 78 : 220,
      );
      offscreenContext.font = `900 ${fontSize}px Anton, Impact, sans-serif`;
      offscreenContext.textAlign = "center";
      offscreenContext.textBaseline = "middle";
      offscreenContext.fillStyle = "white";
      offscreenContext.fillText("DE'BAIT", width / 2, height * 0.52);

      const image = offscreenContext.getImageData(0, 0, offscreen.width, offscreen.height).data;
      const step = compact.matches ? 10 : 7;
      const next: Particle[] = [];
      for (let y = 0; y < offscreen.height; y += step * ratio) {
        for (let x = 0; x < offscreen.width; x += step * ratio) {
          const alpha = image[(Math.floor(y) * offscreen.width + Math.floor(x)) * 4 + 3] ?? 0;
          if (alpha < 80) continue;
          const targetX = x / ratio;
          const targetY = y / ratio;
          next.push({
            targetX,
            targetY,
            driftX: targetX + (Math.random() - 0.5) * width * 0.65,
            driftY: targetY + (Math.random() - 0.5) * height * 0.55,
            color: Math.random() > 0.84 ? "216, 27, 114" : "255, 214, 0",
          });
        }
      }
      particles = next;
    };

    const draw = (now: number) => {
      if (now - lastDraw < 1000 / 30) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;
      const elapsed = now - start;
      const progress = Math.max(0, Math.min(1, (elapsed - formationDelay) / formationDuration));
      const arrival = 1 - Math.pow(1 - progress, 3);
      const overshoot =
        progress > 0.72 ? Math.sin((progress - 0.72) * Math.PI * 3.2) * (1 - progress) * 0.12 : 0;
      const eased = Math.max(0, Math.min(1.035, arrival + overshoot));
      const dustOpacity = Math.max(0, Math.min(1, (elapsed - formationDelay + 380) / 620));
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "screen";

      particles.forEach((particle, index) => {
        const shimmer = 0.62 + Math.sin(elapsed / 170 + index * 0.42) * 0.2;
        const x = particle.driftX + (particle.targetX - particle.driftX) * eased;
        const y = particle.driftY + (particle.targetY - particle.driftY) * eased;
        context.beginPath();
        context.arc(x, y, compact.matches ? 0.9 : 1.15, 0, Math.PI * 2);
        context.fillStyle = `rgba(${particle.color}, ${(0.18 + shimmer * 0.54) * dustOpacity})`;
        context.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    createParticles();
    window.addEventListener("resize", createParticles, { passive: true });
    compact.addEventListener("change", createParticles);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", createParticles);
      compact.removeEventListener("change", createParticles);
    };
  }, [formationDelay, formationDuration]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
