"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import {
  ViscoseCarousel,
  type ViscoseProject,
} from "@/components/viscose/viscose-carousel";

/**
 * The full portfolio as one wheel — every project, no pagination.
 *
 * Breaks out of the layout's centred max-w-3xl column: an arc boxed into 720px
 * is a list with a curve, not a slice of something bigger going past. body has
 * overflow-x-hidden, so 100vw cannot open a horizontal scrollbar.
 *
 * The grid arrives as `children` and only ever shows as the no-WebGL fallback.
 * It comes in as a node because ProjectCard renders an icon per link, which
 * cannot cross the server/client boundary as a prop.
 */
export function ProjectsExplorer({
  projects,
  children,
}: {
  projects: readonly ViscoseProject[];
  children: React.ReactNode;
}) {
  return (
    <div className="relative left-1/2 -mb-20 -mt-12 flex h-[100svh] w-screen -translate-x-1/2 flex-col sm:-mb-32 sm:-mt-24">
      <header className="shrink-0 px-6 pt-6 sm:px-10 sm:pt-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to overview
        </Link>
      </header>

      <ViscoseCarousel
        projects={projects}
        heading="All Projects"
        layout="full"
        // Not a loop: wrapping hides where the list ends, so there is no way
        // to tell you have seen everything.
        loop={false}
        // No FullPageScroll here, so the ring takes the wheel itself.
        className="min-h-0 flex-1 touch-none pb-16"
        fallback={
          <div className="mx-auto h-full max-w-3xl overflow-y-auto px-6 pb-28">
            {children}
          </div>
        }
      />
    </div>
  );
}
