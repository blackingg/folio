"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ContactIllustration } from "@/components/contact-illustration";
import type { FullPageProps } from "@/components/full-page-scroll";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const illustration = {
  hidden: { opacity: 0, scale: 0.6, rotate: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 220, damping: 16 },
  },
};

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
          variants={item}
          className="text-3xl font-bold tracking-tighter sm:text-5xl"
        >
          Get in Touch
        </motion.h2>
        <motion.p
          variants={item}
          className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
        >
          Want to chat? Just shoot me a mail{" "}
          <Link
            href={emailUrl}
            className="text-neon hover:underline"
          >
            here
          </Link>{" "}
          and I&apos;ll respond whenever I can.
        </motion.p>
      </motion.div>
    </div>
  );
}
