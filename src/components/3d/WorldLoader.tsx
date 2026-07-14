"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Phase = "loading" | "opening" | "done";

const OPEN_DELAY_MS = 350;
const OPEN_EASE: [number, number, number, number] = [0.83, 0, 0.17, 1];
const TYPE_INTERVAL_MS = 14;
const LOG_HISTORY = 2;

// Flavor log keyed to real progress — chunk counts map onto the 9 terrain
// chunks the engine actually waits for.
function logFor(v: number) {
  if (v < 3) return "booting world engine";
  if (v < 6) return "seeding simplex noise";
  if (v < 48) {
    const chunk = Math.min(9, Math.max(1, Math.ceil(((v - 6) / 42) * 9)));
    return `generating terrain chunk ${chunk}/9`;
  }
  if (v < 54) return "smoothing terrain normals";
  if (v < 61) return "planting trees";
  if (v < 67) return "growing distant billboards";
  if (v < 73) return "scattering grass";
  if (v < 79) return "filling the ocean";
  if (v < 85) return "raising the sky dome";
  if (v < 90) return "hanging the sun and moon";
  if (v < 94) return "sprinkling stars";
  if (v < 99.5) return "waking the player";
  return "entering world";
}

export function WorldLoader({
  progress,
  isLoaded,
}: {
  progress: number;
  isLoaded: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("loading");

  // The engine reports progress in chunky jumps (9 chunks ≈ 11% steps);
  // spring towards it so the line and counter glide instead of snapping.
  const target = useMotionValue(0);
  const smooth = useSpring(target, { stiffness: 50, damping: 18 });
  const display = useTransform(
    smooth,
    (v) => `${Math.min(100, Math.max(0, Math.round(v)))}%`,
  );
  const scaleX = useTransform(smooth, (v) => Math.min(1, v / 100));

  useEffect(() => {
    target.set(isLoaded ? 100 : progress);
  }, [progress, isLoaded, target]);

  // Track the newest log target, and open once the world is ready and the
  // counter has caught up to 100.
  const logTargetRef = useRef(logFor(0));
  useMotionValueEvent(smooth, "change", (v) => {
    logTargetRef.current = logFor(v);
    if (isLoaded && v >= 99.5 && phase === "loading") {
      setTimeout(() => setPhase("opening"), OPEN_DELAY_MS);
    }
  });

  // Terminal-style typewriter: type the active line out, then promote it to
  // dimmed history and jump to the newest pending message (skipping stale
  // intermediates, like a console that can't keep up).
  const [term, setTerm] = useState({
    history: [] as string[],
    active: "",
    count: 0,
  });
  useEffect(() => {
    const id = setInterval(() => {
      setTerm((t) => {
        if (t.count < t.active.length) return { ...t, count: t.count + 1 };
        if (logTargetRef.current === t.active) return t;
        return {
          history: t.active
            ? [...t.history, t.active].slice(-LOG_HISTORY)
            : t.history,
          active: logTargetRef.current,
          count: 0,
        };
      });
    }, TYPE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (isLoaded && phase === "loading" && smooth.get() >= 99.5) {
      const t = setTimeout(() => setPhase("opening"), OPEN_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [isLoaded, phase, smooth]);

  if (phase === "done") return null;

  const opening = phase === "opening";

  return (
    <div
      className={`fixed inset-0 z-50 ${opening ? "pointer-events-none" : "pointer-events-auto"}`}
      aria-hidden={opening}
    >
      <style>{`
        @keyframes wl-blink { 50% { opacity: 0 } }
        .wl-cursor { animation: wl-blink 1s steps(1) infinite; }
      `}</style>
      {/* Top half — carries the horizon line on its bottom edge */}
      <motion.div
        initial={false}
        animate={{ y: opening ? "-100%" : "0%" }}
        transition={{ duration: 1.1, ease: OPEN_EASE }}
        className="absolute inset-x-0 top-0 h-1/2 bg-background"
      >
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-6 pb-5 sm:px-10">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-4xl">
            Generating world
          </h2>
          <motion.span className="pb-1 text-sm font-medium tabular-nums text-foreground/80 sm:text-base">
            {display}
          </motion.span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-foreground/15" />
        <motion.div
          style={{ scaleX }}
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-foreground"
        />
      </motion.div>

      {/* Bottom half — carries the caption, and grows its own hairline
          the moment the seam splits so both edges stay drawn */}
      <motion.div
        initial={false}
        animate={{ y: opening ? "100%" : "0%" }}
        transition={{ duration: 1.1, ease: OPEN_EASE }}
        onAnimationComplete={() => {
          if (opening) setPhase("done");
        }}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-background"
      >
        <motion.div
          initial={false}
          animate={{ opacity: opening ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-x-0 top-0 h-px bg-foreground"
        />
        <div className="space-y-1 px-6 pt-4 font-mono text-xs text-muted-foreground sm:px-10">
          {term.history.map((line, i) => (
            <p
              key={`${i}-${line}`}
              className="opacity-40"
            >
              &gt; {line}
            </p>
          ))}
          <p>
            &gt; {term.active.slice(0, term.count)}
            <span className="wl-cursor ml-0.5 inline-block h-3 w-[7px] translate-y-0.5 bg-muted-foreground" />
          </p>
        </div>
      </motion.div>
    </div>
  );
}
