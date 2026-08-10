"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { FullPageProps } from "@/components/full-page-scroll";

const heading = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const wordsContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.018, delayChildren: 0.3 } },
};

const word = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

// CTAs land a beat after the last word does, so the pacing stays right
// however long the summary happens to be.
function ctaVariants(wordCount: number) {
  const delay = 0.3 + wordCount * 0.018 + 0.15;
  return {
    hidden: { opacity: 0, y: 16, scale: 0.85 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 260, damping: 20, delay },
    },
  };
}

// Plays once, in full, every time this becomes the active page: the
// heading blurs in, the summary cascades word by word, then the CTAs
// spring in behind it. Reverses instantly if the page is left mid-cascade.
export function AboutReveal({
  summary,
  resumeUrl,
  active,
}: {
  summary: string;
  resumeUrl: string;
} & FullPageProps) {
  const words = summary.split(" ");
  const cta = ctaVariants(words.length);

  return (
    <div className="flex h-full flex-col justify-center px-6 pb-20 pt-12 sm:pb-32 sm:pt-24">
      <div className="mx-auto w-full max-w-3xl">
        <motion.h2
          initial="hidden"
          animate={active ? "visible" : "hidden"}
          variants={heading}
          className="mb-3 text-xl font-bold"
        >
          About
        </motion.h2>
        <motion.p
          initial="hidden"
          animate={active ? "visible" : "hidden"}
          variants={wordsContainer}
          className="max-w-full text-pretty font-sans text-base text-foreground/80 leading-relaxed sm:text-lg"
        >
          {words.map((w, i) => (
            <span key={i}>
              <motion.span
                variants={word}
                className="inline-block"
              >
                {w}
              </motion.span>
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </motion.p>
        <motion.div
          initial="hidden"
          animate={active ? "visible" : "hidden"}
          variants={cta}
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
      </div>
    </div>
  );
}
