"use client";

import {
  motion,
  MotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { Children, useRef } from "react";

function RevealCard({
  children,
  index,
  total,
  progress,
  className,
}: {
  children: React.ReactNode;
  index: number;
  total: number;
  progress: MotionValue<number>;
  className?: string;
}) {
  // Each card rises over its own overlapping slice of the scroll window,
  // so the row builds left-to-right instead of appearing all at once.
  const start = (index / total) * 0.55;
  const end = start + 0.45;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [72, 0]);
  const scale = useTransform(progress, [start, end], [0.94, 1]);
  // Cards tip up from a slight backward lean, like they're standing up off
  // the page. Perspective lives on the card so the tilt reads per-card.
  const rotateX = useTransform(progress, [start, end], [16, 0]);
  const filter = useTransform(progress, [start, end], [
    "blur(6px)",
    "blur(0px)",
  ]);

  return (
    <motion.div
      style={{ opacity, y, scale, rotateX, filter, transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scroll-driven reveal for the blog card grid: progress is keyed to the grid
// entering the viewport and spring-smoothed, so the cascade plays forward on
// the way down and reverses when scrolling back up.
export function BlogCardsReveal({
  children,
  className,
  itemClassName,
}: {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Starts once the grid's top clears the bottom ~10% of the viewport and
  // completes by the time it reaches the upper third.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.35"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 30 });
  const items = Children.toArray(children);

  return (
    <div
      ref={ref}
      className={className}
    >
      {items.map((child, i) => (
        <RevealCard
          key={i}
          index={i}
          total={items.length}
          progress={progress}
          className={itemClassName}
        >
          {child}
        </RevealCard>
      ))}
    </div>
  );
}
