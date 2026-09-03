"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ViscoseCarousel,
  type ViscoseProject,
} from "@/components/viscose/viscose-carousel";
import {
  useFullPage,
  type FullPageProps,
} from "@/components/full-page-scroll";

// The slide that ends the ring: a drawn tile rather than a screenshot, so it
// merges and strings honey like any project card. Module-level so its identity
// is stable — the render loop rebuilds whenever the projects array changes.
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
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// The featured projects as an arc of a much bigger wheel. Takes the whole
// panel rather than a column: the cards have to fuse into one another, and
// there is nothing to fuse with inside a max-w-xl box.
//
// Answers the same `stepRef` gesture contract the story stepper did, so a
// wheel tick turns the ring one slot and only flips on to Work at the end.
export function ProjectsSection({
  projects,
  active,
  stepRef,
}: {
  projects: readonly ViscoseProject[];
} & FullPageProps) {
  const slides = useMemo(() => [...projects, VIEW_ALL], [projects]);
  // The ring's frame loop is the most expensive thing on this page, so it
  // waits for the flip to land rather than starting the moment `active`
  // flips — see the note on FullPageContext. Nothing is lost visually: the
  // entry fan re-arms from zero on activation regardless, so it simply
  // begins when the panel arrives instead of part-way through the slide.
  const { settled } = useFullPage();

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
        // Clamped, not looping: the end slots hand the gesture back.
        loop={false}
        compact
        active={active && settled}
        stepRef={stepRef}
        fallback={<StillProjects projects={projects} />}
        // Breaks the body's max-w-3xl column: the arc needs the width.
        className="relative left-1/2 min-h-0 w-screen -translate-x-1/2 flex-1"
      />

    </motion.div>
  );
}

// Shown when the ring cannot run: no WebGL. Not a scroller — this panel owns
// exactly one viewport and has no scrollbar to give.
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
