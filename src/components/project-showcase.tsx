"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Explicit initial/animate on the slide root keeps these from inheriting
// StoryStepper's enter/center/exit variant labels.
const slideIn = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

// Wipes open left-to-right; the media inside settles back from a slight
// overscale so the reveal has some push behind it rather than just appearing.
const frameIn = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const mediaIn = {
  hidden: { scale: 1.1 },
  visible: { scale: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

const lineIn = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// The screenshot is the whole point of a project, so it leads: full-bleed,
// no card chrome, just rounded corners. Everything else is a caption under
// it. Built for the homepage stepper — /projects still uses ProjectCard.
export function ProjectShowcase({
  title,
  href,
  dates,
  description,
  tags,
  image,
  video,
  links,
}: {
  title: string;
  href?: string;
  dates: string;
  description: string;
  tags?: readonly string[];
  image?: string;
  video?: string;
  links?: readonly { type: string; href: string }[];
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideIn}
      className="space-y-4"
    >
      <motion.div
        variants={frameIn}
        className="relative aspect-[16/10] max-h-[38svh] w-full overflow-hidden rounded-2xl bg-muted"
      >
        <Link
          href={href || "#"}
          target={href ? "_blank" : undefined}
          rel={href ? "noopener noreferrer" : undefined}
          className="block size-full"
        >
          <motion.div variants={mediaIn} className="size-full">
            {video ? (
              <video
                src={video}
                autoPlay
                loop
                muted
                playsInline
                className="size-full object-cover object-top"
              />
            ) : image ? (
              <Image
                src={image}
                alt={title}
                width={900}
                height={563}
                className="size-full object-cover object-top"
              />
            ) : null}
          </motion.div>
        </Link>
      </motion.div>

      <motion.div
        variants={lineIn}
        className="flex items-baseline justify-between gap-4"
      >
        <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h3>
        <time className="shrink-0 text-sm tabular-nums text-neutral-500">
          {dates}
        </time>
      </motion.div>

      <motion.p
        variants={lineIn}
        className="line-clamp-2 text-sm leading-relaxed text-foreground/80"
      >
        {description}
      </motion.p>

      <motion.div
        variants={lineIn}
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
      >
        {tags && tags.length > 0 && (
          <p className="text-xs text-neutral-500 sm:text-sm">
            {tags.join(" · ")}
          </p>
        )}
        {links && links.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-foreground sm:text-sm"
              >
                {link.type}
                <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
