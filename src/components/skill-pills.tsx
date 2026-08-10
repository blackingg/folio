"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
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

const pillContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } },
};

const pill = {
  hidden: { opacity: 0, scale: 0.4, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

// Plays once per arrival on this page: the title blurs in, then the pills
// pop in one after another instead of all at once.
export function SkillPills({
  skills,
  title,
  active,
}: {
  skills: readonly string[];
  title?: string;
} & FullPageProps) {
  return (
    <div className="flex h-full flex-col justify-center px-6 pb-20 pt-12 sm:pb-32 sm:pt-24">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-y-3">
        {title && (
          <motion.h2
            initial="hidden"
            animate={active ? "visible" : "hidden"}
            variants={heading}
            className="text-xl font-bold"
          >
            {title}
          </motion.h2>
        )}
        <motion.div
          initial="hidden"
          animate={active ? "visible" : "hidden"}
          variants={pillContainer}
          className="flex flex-wrap gap-2"
        >
          {skills.map((skill) => (
            <motion.div
              key={skill}
              variants={pill}
              className="w-fit"
            >
              <Badge className="px-3 py-1 text-sm">{skill}</Badge>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
