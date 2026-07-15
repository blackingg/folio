"use client";

import {
  motion,
  MotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";

function Pill({
  skill,
  index,
  total,
  progress,
}: {
  skill: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  // Each pill pops in over its own overlapping slice of the scroll window.
  const start = (index / total) * 0.85;
  const end = start + 0.15;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const scale = useTransform(progress, [start, end], [0.4, 1]);
  const y = useTransform(progress, [start, end], [12, 0]);

  return (
    <motion.div
      style={{ opacity, scale, y }}
      className="w-fit"
    >
      <Badge className="px-3 py-1 text-sm">{skill}</Badge>
    </motion.div>
  );
}

// A full-viewport "page": the panel pins while scroll drives the pill
// cascade, and only unpins (revealing the next section) once every pill
// has popped in. Scrolling back up reverses the cascade.
export function SkillPills({
  skills,
  title,
}: {
  skills: readonly string[];
  title?: string;
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  // Pills start popping as the panel scrolls in ("start 0.7") and finish
  // exactly when the container unpins ("end end").
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 0.7", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 30 });

  // Same exit treatment as ScrollFadeSection, but keyed to the unpin moment:
  // 0 while pinned, 1 once the panel has fully scrolled out the top.
  const { scrollYProgress: exitProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });
  const exitOpacity = useTransform(exitProgress, [0, 1], [1, 0.25]);
  const exitScale = useTransform(exitProgress, [0, 1], [1, 0.95]);
  const exitY = useTransform(exitProgress, [0, 1], [0, -24]);

  return (
    <div
      ref={targetRef}
      className="relative h-[160svh]"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center">
        <motion.div
          style={{ opacity: exitOpacity, scale: exitScale, y: exitY }}
          className="flex flex-col gap-y-3"
        >
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-xl font-bold"
          >
            {title}
          </motion.h2>
        )}
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <Pill
              key={skill}
              skill={skill}
              index={i}
              total={skills.length}
              progress={progress}
            />
          ))}
        </div>
        </motion.div>
      </div>
    </div>
  );
}
