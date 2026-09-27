"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SectionIntro } from "@/components/section-intro";
import type { FullPageProps } from "@/components/full-page-scroll";


const word = {
  hidden: { opacity: 0, y: 12 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut", delay },
  }),
};

function ctaVariants(delay: number) {
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

const LEAD_IN = 0.3;

const CASCADE = 1.6;

export function AboutReveal({
  paragraphs,
  resumeUrl,
  kicker,
  heading,
  active,
}: {
  paragraphs: readonly string[];
  resumeUrl: string;
  kicker?: string;
  heading?: string;
} & FullPageProps) {
  const total = paragraphs.reduce((n, p) => n + p.split(" ").length, 0);
  const step = CASCADE / Math.max(total, 1);
  const cta = ctaVariants(LEAD_IN + CASCADE + 0.15);

  let index = 0;

  return (
    <div className="flex h-full flex-col justify-center px-6 pb-16 pt-10 sm:pb-32 sm:pt-24">
      <div className="mx-auto w-full max-w-3xl">
        <SectionIntro
          kicker={kicker}
          heading={heading ?? "About"}
          srLabel={heading ? "About" : undefined}
          active={active}
          className="mb-3"
        />
        <div className="space-y-3 sm:space-y-4">
          {paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="max-w-full text-pretty font-sans text-sm leading-relaxed text-foreground/80 sm:text-base lg:text-lg"
            >
              {paragraph.split(" ").map((w, i, all) => {
                const delay = LEAD_IN + index * step;
                index += 1;
                return (
                  <span key={i}>
                    <motion.span
                      initial="hidden"
                      animate={active ? "visible" : "hidden"}
                      variants={word}
                      custom={delay}
                      className="inline-block"
                    >
                      {w}
                    </motion.span>
                    {i < all.length - 1 ? " " : ""}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-5 sm:mt-8">
          <motion.div
            initial="hidden"
            animate={active ? "visible" : "hidden"}
            variants={cta}
          >
            <Link
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Download Resume
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
