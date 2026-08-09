"use client";

import {
  motion,
  MotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

function Word({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  // Each word lights up over an overlapping ~3-word-wide slice of the first
  // 70% of the pin, so neighbours settle together instead of one at a time.
  const windowSize = Math.min(0.7, (3 / total) * 0.7);
  const start = (index / total) * 0.7;
  const end = start + windowSize;
  const opacity = useTransform(progress, [start, end], [0.15, 1]);
  const y = useTransform(progress, [start, end], [10, 0]);

  return (
    <motion.span
      style={{ opacity, y, display: "inline-block" }}
    >
      {word}
      {" "}
    </motion.span>
  );
}

// A pinned "page" like SkillPills/WorkStack: the panel holds while scroll
// lights the summary up word by word, then the CTAs pop in at the end
// before the section unpins and hands off to the next one.
export function AboutReveal({
  summary,
  resumeUrl,
}: {
  summary: string;
  resumeUrl: string;
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  const words = summary.split(" ");

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 0.8", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 30 });

  // Same exit treatment as ScrollFadeSection, keyed to the unpin moment.
  const { scrollYProgress: exitProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });
  const exitOpacity = useTransform(exitProgress, [0, 1], [1, 0.25]);
  const exitScale = useTransform(exitProgress, [0, 1], [1, 0.95]);
  const exitY = useTransform(exitProgress, [0, 1], [0, -24]);

  const ctaOpacity = useTransform(progress, [0.75, 1], [0, 1]);
  const ctaScale = useTransform(progress, [0.75, 1], [0.85, 1]);
  const ctaY = useTransform(progress, [0.75, 1], [16, 0]);

  return (
    <div
      ref={targetRef}
      className="relative h-[220svh]"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center">
        <motion.div
          style={{ opacity: exitOpacity, scale: exitScale, y: exitY }}
          className="mx-auto w-full max-w-3xl"
        >
          <motion.h2
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-3 text-xl font-bold"
          >
            About
          </motion.h2>
          <p className="max-w-full text-pretty font-sans text-base text-foreground/80 leading-relaxed sm:text-lg">
            {words.map((word, i) => (
              <Word
                key={i}
                word={word}
                index={i}
                total={words.length}
                progress={progress}
              />
            ))}
          </p>
          <motion.div
            style={{ opacity: ctaOpacity, scale: ctaScale, y: ctaY }}
            className="mt-6 flex flex-wrap items-center gap-4"
          >
            <Link
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Download Resume
            </Link>
            <Link
              href="/3d"
              className="group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="text-sm font-medium tracking-tight sm:text-base">
                Explore 3D Experience <span className="text-xl">🚧</span>
              </span>
              <ChevronRight className="h-4 w-4 text-foreground/60 transition-all group-hover:translate-x-1 group-hover:text-foreground" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
