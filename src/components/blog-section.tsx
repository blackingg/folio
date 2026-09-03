"use client";

import { motion } from "framer-motion";
import { Children } from "react";
import BlurFade from "@/components/magicui/blur-fade";
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
  active,
  stepRef,
}: {
  children: React.ReactNode;
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
          <h2 className="mb-2 text-xl font-bold">Recent Writing</h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            I share my thoughts on software development, life, and the
            things I&apos;m learning along the way.
          </p>
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
