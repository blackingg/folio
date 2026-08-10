"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionLink } from "@/components/section-link";
import { StoryStepper } from "@/components/story-stepper";
import type { FullPageProps } from "@/components/full-page-scroll";

type Work = {
  company: string;
  title: string;
  href?: string;
  badges?: readonly string[];
  logoUrl: string;
  start: string;
  end?: string;
  description?: string;
};

const section = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Explicit initial/animate on the slide root keeps these from inheriting
// StoryStepper's enter/center/exit variant labels.
const slideIn = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const markIn = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 18 },
  },
};

// Same left-to-right wipe the Projects showcase uses on its screenshot —
// here the company name is the hero, so it gets the identical reveal. The
// negative vertical inset keeps tall glyphs and descenders from clipping.
const heroWipe = {
  hidden: { clipPath: "inset(-15% 100% -15% 0)" },
  visible: {
    clipPath: "inset(-15% 0% -15% 0)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const lineIn = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// A job has no screenshot, so the company name is the visual: display type
// leads, the logo drops to a small mark, and everything below follows the
// same caption rhythm as ProjectShowcase so the two sections read as one
// system.
function JobSlide({ work }: { work: Work }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideIn}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <motion.div
          variants={markIn}
          className="size-10 shrink-0 overflow-hidden rounded-lg sm:size-12"
        >
          <Image
            src={work.logoUrl}
            alt={work.company}
            width={48}
            height={48}
            className="size-full object-contain"
          />
        </motion.div>
        <motion.h3
          variants={heroWipe}
          className="text-4xl font-bold tracking-tighter sm:text-6xl"
        >
          {work.company}
        </motion.h3>
      </div>

      <motion.div
        variants={lineIn}
        className="flex items-baseline justify-between gap-4"
      >
        <p className="text-base text-muted-foreground sm:text-lg">
          {work.title}
        </p>
        <time className="shrink-0 text-sm tabular-nums text-neutral-500">
          {work.start} — {work.end || "Present"}
        </time>
      </motion.div>

      {work.description && (
        <motion.p
          variants={lineIn}
          className="text-sm leading-relaxed text-foreground/80 sm:text-base"
        >
          {work.description}
        </motion.p>
      )}

      <motion.div
        variants={lineIn}
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
      >
        {work.badges && work.badges.length > 0 && (
          <p className="text-xs text-neutral-500 sm:text-sm">
            {work.badges.join(" · ")}
          </p>
        )}
        {work.href && (
          <Link
            href={work.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-foreground sm:text-sm"
          >
            Visit site
            <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}

// A "stories" sub-pager for the job history: one role fills the slide at a
// time behind a segmented progress bar, advanced by the same wheel/touch/
// arrow gestures FullPageScroll uses to flip pages — see story-stepper.tsx.
export function WorkStack({
  works,
  title,
  active,
  stepRef,
}: {
  works: Work[];
  title?: string;
} & FullPageProps) {
  return (
    <div className="flex h-full flex-col justify-center px-6 pb-20 pt-12 sm:pb-32 sm:pt-24">
      <motion.div
        initial="hidden"
        animate={active ? "visible" : "hidden"}
        variants={section}
        className="mx-auto w-full max-w-xl"
      >
        {title && <h2 className="mb-6 text-xl font-bold">{title}</h2>}

        <StoryStepper
          count={works.length}
          active={active}
          stepRef={stepRef}
          renderSlide={(i) => <JobSlide work={works[i]} />}
        />

        <div className="mt-8 flex justify-center">
          <SectionLink href="/work">View full career path</SectionLink>
        </div>
      </motion.div>
    </div>
  );
}
