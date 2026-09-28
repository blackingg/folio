"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ContactIllustration } from "@/components/contact-illustration";
import type { FullPageProps } from "@/components/full-page-scroll";
import { WordStagger, wordLine } from "@/components/word-stagger";

const container = { hidden: {}, visible: {} };

const illustration = {
  hidden: { opacity: 0, scale: 0.6, rotate: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 220, damping: 16, delay: 0.1 },
  },
};

const HEADING = wordLine(0.35, 0.06);
const BLURB = wordLine(0.65, 0.022);
const SIGNOFF = wordLine(1.35, 0.03);

export function ContactSection({
  emailUrl,
  active,
}: {
  emailUrl: string;
} & FullPageProps) {
  return (
    <div className="grid h-full items-center justify-center gap-4 px-4 text-center md:px-6">
      <motion.div
        initial="hidden"
        animate={active ? "visible" : "hidden"}
        variants={container}
        className="space-y-3"
      >
        <motion.div variants={illustration}>
          <ContactIllustration className="mx-auto size-40 sm:size-48 lg:size-64" />
        </motion.div>
        <motion.h2
          variants={HEADING}
          className="text-3xl font-bold tracking-tighter sm:text-5xl"
        >
          <WordStagger inherit>Let&apos;s build it.</WordStagger>
        </motion.h2>
        <motion.p
          variants={BLURB}
          className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
        >
          <WordStagger inherit>
            Got a product, concept, or wild idea? I&apos;m open to working with
            startups, individuals, and creative studios on digital products,
            interactive experiences, and everything in between.
          </WordStagger>
        </motion.p>
        <motion.p
          variants={SIGNOFF}
          className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
        >
          <WordStagger inherit>
            Just shoot me a mail{" "}
            <Link href={emailUrl} className="text-neon hover:underline">
              here
            </Link>
            , and I&apos;ll respond ASAP.
          </WordStagger>
        </motion.p>
      </motion.div>
    </div>
  );
}
