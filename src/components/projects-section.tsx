"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ViscoseCarousel,
  type ViscoseProject,
} from "@/components/viscose/viscose-carousel";
import type { FullPageProps } from "@/components/full-page-scroll";

// The slide that ends the ring. A drawn neon tile rather than a screenshot
// (see posterPainter), so it merges and strings honey exactly like a project
// card does — it just happens to open the full list instead of a site.
// Module-level so its identity is stable: the render loop rebuilds itself
// whenever the projects array changes.
const VIEW_ALL: ViscoseProject = {
  title: "View all projects",
  href: "/projects",
  internal: true,
  dates: "",
  description: "",
  technologies: [],
  poster: { label: "View all" },
};

const section = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// The featured projects as an arc of a much bigger wheel — see
// components/viscose. The carousel takes the whole panel rather than sitting
// in a column, because the cards have to be able to fuse into one another and
// there is nothing to fuse with inside a max-w-xl box.
//
// It answers the same `stepRef` gesture contract the story stepper did, so a
// wheel tick turns the ring one slot and only flips on to Work once the last
// project has been past — see full-page-scroll.tsx.
export function ProjectsSection({
  projects,
  active,
  stepRef,
}: {
  projects: readonly ViscoseProject[];
} & FullPageProps) {
  const slides = useMemo(() => [...projects, VIEW_ALL], [projects]);

  return (
    <motion.div
      initial="hidden"
      animate={active ? "visible" : "hidden"}
      variants={section}
      className="flex h-full flex-col pb-20 pt-6 sm:pb-24 sm:pt-10"
    >
      <ViscoseCarousel
        projects={slides}
        heading="Selected Projects"
        // Clamped rather than looping: the first and last slots are what hand
        // the gesture back to FullPageScroll.
        loop={false}
        compact
        active={active}
        stepRef={stepRef}
        fallback={<StillProjects projects={projects} />}
        // Breaks the body's max-w-3xl column for the same reason /projects
        // does — the arc needs the width to read as an arc.
        className="relative left-1/2 min-h-0 w-screen -translate-x-1/2 flex-1"
      />

    </motion.div>
  );
}

// Shown when the ring cannot or should not run: reduced motion, or no WebGL.
// Deliberately not a scroller — this panel owns exactly one viewport and has
// no scrollbar to give, so the featured set is laid out to fit instead.
function StillProjects({ projects }: { projects: readonly ViscoseProject[] }) {
  return (
    <div className="mx-auto flex size-full max-w-3xl flex-col justify-center gap-4 px-6">
      <h2 className="text-xl font-bold">Selected Projects</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {projects.map((project) => (
          <li key={project.title}>
            <Link
              href={project.href || "#"}
              target={project.href ? "_blank" : undefined}
              rel={project.href ? "noopener noreferrer" : undefined}
              className="group block space-y-2"
            >
              <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-muted">
                {project.image && (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(min-width: 640px) 30vw, 45vw"
                    className="object-cover object-top"
                  />
                )}
              </div>
              <p className="text-sm font-medium group-hover:underline">
                {project.title}
              </p>
              <time className="text-xs text-neutral-500 sm:text-sm">
                {project.dates}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
