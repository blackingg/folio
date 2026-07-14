"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  MotionValue,
} from "framer-motion";
import { useRef, useState } from "react";
import { WorkExperienceItem } from "@/components/work-experience-item";

type Work = Parameters<typeof WorkExperienceItem>[0]["work"];

const PANEL_FRACTION = 0.9;

function Panel({
  work,
  index,
  total,
  progress,
}: {
  work: Work;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const step = 1 / (total - 1);
  const center = index * step;
  const scale = useTransform(
    progress,
    [center - step, center, center + step],
    [0.92, 1, 0.92],
  );
  const opacity = useTransform(
    progress,
    [center - step, center, center + step],
    [0.5, 1, 0.5],
  );

  return (
    <motion.div
      style={{ scale, opacity }}
      className="w-[90%] shrink-0 pr-4 sm:pr-8"
    >
      <div className="max-h-[68svh] overflow-y-auto rounded-2xl border bg-background p-5 shadow-sm sm:p-8">
        <WorkExperienceItem
          work={work}
          index={index}
        />
      </div>
    </motion.div>
  );
}

export function WorkExperienceScroller({ works }: { works: Work[] }) {
  const targetRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const [current, setCurrent] = useState(0);

  const total = works.length;
  // Panels are 90% of the viewport wide, so the track spans (0.9 * total) viewports.
  // The x percentage is relative to the viewport-wide container, so slide by
  // (track width - one viewport) to end with the last panel flush right.
  const x = useTransform(scrollYProgress, [0, 1], [
    "0%",
    `-${(PANEL_FRACTION * total - 1) * 100}%`,
  ]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setCurrent(Math.min(total - 1, Math.max(0, Math.round(v * (total - 1)))));
  });

  return (
    <section
      ref={targetRef}
      style={{ height: `${total * 55 + 45}vh` }}
      className="relative"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mb-4 flex items-baseline justify-between px-1">
          <span className="text-sm text-neutral-500">Scroll to explore</span>
          <span className="text-sm font-medium tabular-nums text-neutral-500">
            {String(current + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
        </div>

        <motion.div
          style={{ x }}
          className="flex"
        >
          {works.map((work, i) => (
            <Panel
              key={work.company + work.title}
              work={work}
              index={i}
              total={total}
              progress={scrollYProgress}
            />
          ))}
        </motion.div>

        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="mt-6 h-0.5 origin-left rounded-full bg-foreground/80"
        />
      </div>
    </section>
  );
}
