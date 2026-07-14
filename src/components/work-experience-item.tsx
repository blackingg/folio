"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface WorkExperienceItemProps {
  work: {
    company: string;
    href?: string;
    badges?: readonly string[];
    location: string;
    title: string;
    logoUrl: string;
    start: string;
    end?: string;
    description: string;
    responsibilities?: string[];
  };
  index: number;
}

type Work = WorkExperienceItemProps["work"];

function DetailsModal({ work, onClose }: { work: Work; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${work.title} at ${work.company}`}
        initial={{ y: 48, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 48, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85svh] w-full overflow-y-auto rounded-t-2xl border bg-background p-6 shadow-xl sm:max-w-xl sm:rounded-2xl sm:p-8"
      >
        <button
          onClick={onClose}
          aria-label="Close details"
          className="absolute right-4 top-4 rounded-full border bg-background p-1.5 text-neutral-500 transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3 pr-10">
          <Avatar className="size-10 sm:size-12 flex-none border bg-background">
            <AvatarImage
              src={work.logoUrl}
              alt={work.company}
              className="object-contain"
            />
            <AvatarFallback>{work.company[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-semibold text-base sm:text-lg leading-tight">
              {work.company}
            </h3>
            <p className="text-sm text-neutral-500">
              {work.title} · {work.start} — {work.end ?? "Present"}
            </p>
          </div>
        </div>

        {work.badges && work.badges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {work.badges.map((badge) => (
              <Badge
                key={badge}
                className="whitespace-nowrap px-2 py-0.5 text-[10px] sm:text-xs"
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}

        <p className="mt-4 text-sm sm:text-base text-foreground/80 leading-relaxed">
          {work.description}
        </p>

        {work.responsibilities && work.responsibilities.length > 0 && (
          <ul className="mt-5 grid gap-3">
            {work.responsibilities.map((resp, idx) => (
              <li
                key={idx}
                className="flex gap-3 text-sm sm:text-base text-muted-foreground leading-relaxed group"
              >
                <span className="mt-2 size-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 flex-shrink-0 group-hover:bg-primary transition-colors" />
                {resp}
              </li>
            ))}
          </ul>
        )}

        {work.href && (
          <a
            href={work.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-primary transition-colors underline underline-offset-4"
          >
            Visit {work.company}
            <ArrowUpRight className="size-3.5" />
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}

export function WorkExperienceItem({ work, index }: WorkExperienceItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Portal target only exists on the client; skip on the server render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex gap-3 sm:gap-4">
      <span className="flex-none w-7 sm:w-10 pt-1 text-xl sm:text-2xl font-bold leading-none tracking-tighter tabular-nums text-neutral-300 dark:text-neutral-700 select-none">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8 sm:size-10 flex-none border bg-background">
            <AvatarImage
              src={work.logoUrl}
              alt={work.company}
              className="object-contain"
            />
            <AvatarFallback>{work.company[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <h3 className="font-semibold text-sm sm:text-base leading-tight">
              {work.company}
            </h3>
            <span className="text-xs sm:text-sm text-neutral-500 tabular-nums">
              {work.start} — {work.end ?? "Present"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5">
            <span className="text-sm font-semibold">{work.title}</span>
            {work.badges && work.badges.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {work.badges.map((badge) => (
                  <Badge
                    key={badge}
                    className="whitespace-nowrap px-2 py-0.5 text-[10px] sm:text-xs"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed">
          {work.description}
        </p>

        {work.responsibilities && work.responsibilities.length > 0 && (
          <Button
            onClick={() => setIsOpen(true)}
            size="sm"
            variant="secondary"
            className="h-7 self-end rounded-full px-3 text-xs font-medium gap-1"
          >
            View details
            <ArrowUpRight className="size-3.5" />
          </Button>
        )}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <DetailsModal
                work={work}
                onClose={() => setIsOpen(false)}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
