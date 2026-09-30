"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionIntro } from "@/components/section-intro";
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
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
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
// same caption rhythm as the projects ring so the two sections read as one
// system.
function JobSlide({ work }: { work: Work }) {
  // "Bayse Markets (formerly Gowagr)" is two different things wearing one
  // string: the name, and an aside. Rendered at one weight the aside doubled
  // the title's length and pushed it onto a second line, where it outweighed
  // everything under it. Split so the name leads and the aside recedes.
  const asideAt = work.company.lastIndexOf(" (");
  const name = asideAt > 0 ? work.company.slice(0, asideAt) : work.company;
  const aside =
    asideAt > 0 && work.company.endsWith(")")
      ? work.company.slice(asideAt + 1)
      : null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideIn}
      className="space-y-5"
    >
      {/* Identity block. The logo aligns to the first line rather than the
          centre of a wrapped title, and the role and dates sit directly under
          the company instead of on their own full-width row — a job's name,
          role and span are one fact, so they read as one group. */}
      <div className="flex items-start gap-3 sm:gap-4">
        <motion.div
          variants={markIn}
          className="mt-1 size-10 shrink-0 overflow-hidden rounded-lg sm:size-12"
        >
          <Image
            src={work.logoUrl}
            alt={work.company}
            width={48}
            height={48}
            className="size-full object-contain"
          />
        </motion.div>
        <div className="min-w-0 space-y-1">
          <motion.h3
            variants={heroWipe}
            className="text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl"
          >
            {name}
            {aside && (
              <span className="block text-base font-normal tracking-normal text-muted-foreground sm:text-lg">
                {aside}
              </span>
            )}
          </motion.h3>
          <motion.p
            variants={lineIn}
            className="flex flex-wrap items-baseline gap-x-2 text-sm text-muted-foreground sm:text-base"
          >
            <span>{work.title}</span>
            <span aria-hidden className="text-neutral-600">
              &middot;
            </span>
            <time className="tabular-nums text-neutral-500">
              {work.start} — {work.end || "Present"}
            </time>
          </motion.p>
        </div>
      </div>

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
  kicker,
  heading,
  intro,
  srLabel,
  active,
  stepRef,
}: {
  works: Work[];
  kicker?: string;
  heading?: string;
  intro?: string;
  srLabel?: string;
} & FullPageProps) {
  return (
    <div className="flex h-full flex-col justify-center px-6 pb-20 pt-12 sm:pb-32 sm:pt-24">
      <motion.div
        initial="hidden"
        animate={active ? "visible" : "hidden"}
        variants={section}
        className="mx-auto w-full max-w-xl"
      >
        <SectionIntro
          kicker={kicker}
          heading={heading}
          srLabel={srLabel}
          lead={intro}
          active={active}
          className="mb-6"
        />

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
