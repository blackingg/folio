"use client";

import { motion } from "framer-motion";
import { Children } from "react";
import BlurFade from "@/components/magicui/blur-fade";
import { SectionLink } from "@/components/section-link";
import { StoryStepper } from "@/components/story-stepper";
import type { FullPageProps } from "@/components/full-page-scroll";

const BLUR_FADE_DELAY = 0.04;

const section = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// A "stories" sub-pager for the featured projects: one project fills the
// slide at a time behind a segmented progress bar, advanced by the same
// wheel/touch/arrow gestures FullPageScroll uses to flip pages — see
// story-stepper.tsx.
export function ProjectsSection({
  children,
  active,
  stepRef,
}: {
  children: React.ReactNode;
} & FullPageProps) {
  const panels = Children.toArray(children);

  return (
    <div className="flex h-full flex-col justify-center px-6 pb-20 pt-12 sm:pb-32 sm:pt-24">
      <motion.div
        initial="hidden"
        animate={active ? "visible" : "hidden"}
        variants={section}
        className="mx-auto w-full max-w-xl space-y-6"
      >
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <h2 className="text-xl font-bold">Selected Projects</h2>
        </BlurFade>

        <StoryStepper
          count={panels.length}
          active={active}
          stepRef={stepRef}
          renderSlide={(i) => panels[i]}
        />

        <div className="flex justify-center">
          <SectionLink href="/projects">View all projects</SectionLink>
        </div>
      </motion.div>
    </div>
  );
}
