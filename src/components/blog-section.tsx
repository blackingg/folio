"use client";

import { motion } from "framer-motion";
import { Children } from "react";
import BlurFade from "@/components/magicui/blur-fade";
import { SectionIntro } from "@/components/section-intro";
import { SectionLink } from "@/components/section-link";
import { StoryStepper } from "@/components/story-stepper";
import type { FullPageProps } from "@/components/full-page-scroll";

const section = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// A "stories" sub-pager for the latest posts: one post fills the slide at a
// time behind a segmented progress bar, advanced by the same wheel/touch/
// arrow gestures FullPageScroll uses to flip pages — see story-stepper.tsx.
export function BlogSection({
  children,
  kicker,
  heading = "Recent Writing",
  intro,
  srLabel,
  active,
  stepRef,
}: {
  children: React.ReactNode;
  kicker?: string;
  heading?: string;
  intro?: string;
  srLabel?: string;
} & FullPageProps) {
  const posts = Children.toArray(children);

  return (
    <div className="flex h-full flex-col justify-center px-6 pb-20 pt-12 sm:pb-32 sm:pt-24">
      <motion.div
        initial="hidden"
        animate={active ? "visible" : "hidden"}
        variants={section}
        className="mx-auto w-full max-w-xl space-y-6"
      >
        <BlurFade>
          <SectionIntro
            kicker={kicker}
            heading={heading}
            srLabel={srLabel}
            lead={intro}
            active={active}
          />
        </BlurFade>

        <StoryStepper
          count={posts.length}
          active={active}
          stepRef={stepRef}
          renderSlide={(i) => posts[i]}
        />

        <div className="flex justify-center">
          <SectionLink href="/blog">View all posts</SectionLink>
        </div>
      </motion.div>
    </div>
  );
}
