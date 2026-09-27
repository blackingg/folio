"use client";

import { motion } from "framer-motion";
import { SectionIntro } from "@/components/section-intro";
import { Badge } from "@/components/ui/badge";
import type { FullPageProps } from "@/components/full-page-scroll";

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

export function SkillPills({
  skills,
  title,
  srLabel,
  active,
}: {
  skills: readonly string[];
  title?: string;
  srLabel?: string;
} & FullPageProps) {
  return (
    <div className="flex h-full flex-col justify-center px-6 pb-20 pt-12 sm:pb-32 sm:pt-24">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-y-3">
        <SectionIntro
          heading={title}
          srLabel={srLabel}
          active={active}
        />
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
