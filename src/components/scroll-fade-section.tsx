"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const MIN_OPACITY = 0.25;
const MIN_SCALE = 0.95;
const DRIFT = 24;

type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

// Mirrored scroll treatment: the section fades, shrinks, and drifts up from
// below as it slides into the viewport, then reverses out the top so
// following content appears to slide over it. Sections already in view on
// load (e.g. the hero) start fully entered.
//
// Pinned pages (WorkStack, etc.) pass custom enter/exit offsets so the
// dimming keys to their pin/unpin moments instead of the raw container
// edges — their containers span several viewports and would otherwise sit
// dimmed through the whole pinned interaction.
export function ScrollFadeSection({
  children,
  className,
  style,
  enterOffset = ["start end", "end end"],
  exitOffset = ["start start", "end start"],
  scaleAndDrift = true,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  enterOffset?: ScrollOffset;
  exitOffset?: ScrollOffset;
  // The scale/drift transform is anchored at the wrapper's own top edge, so
  // its pixel effect grows with distance from that edge. That's subtle for
  // a single-viewport-tall panel but blows up for wrappers that span many
  // viewports (e.g. WorkStack's sticky pile) — content near the bottom
  // jumps by hundreds of pixels the instant the exit phase starts. Callers
  // wrapping tall content should pass false and rely on opacity alone.
  scaleAndDrift?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // 0 while the section is still below the fold, 1 once it's fully visible.
  const { scrollYProgress: enterProgress } = useScroll({
    target: ref,
    offset: enterOffset,
  });
  // 0 until the section starts leaving out the top, 1 once it's gone.
  const { scrollYProgress: exitProgress } = useScroll({
    target: ref,
    offset: exitOffset,
  });

  // The two windows only overlap for sections taller than the viewport;
  // taking the min keeps that case sane instead of double-dimming.
  const opacity = useTransform(
    [enterProgress, exitProgress],
    ([enter, exit]: number[]) =>
      Math.min(
        MIN_OPACITY + enter * (1 - MIN_OPACITY),
        1 - exit * (1 - MIN_OPACITY),
      ),
  );
  const scale = useTransform(
    [enterProgress, exitProgress],
    ([enter, exit]: number[]) =>
      Math.min(MIN_SCALE + enter * (1 - MIN_SCALE), 1 - exit * (1 - MIN_SCALE)),
  );
  // Comes up from +DRIFT while entering, rests at 0, leaves toward -DRIFT.
  const y = useTransform(
    [enterProgress, exitProgress],
    ([enter, exit]: number[]) => DRIFT * (1 - enter) - DRIFT * exit,
  );

  return (
    <motion.div
      ref={ref}
      style={
        scaleAndDrift
          ? { ...style, opacity, scale, y }
          : { ...style, opacity }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
