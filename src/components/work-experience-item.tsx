"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

export function WorkExperienceItem({ work, index }: WorkExperienceItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex gap-4 sm:gap-6">
      <span className="flex-none w-9 sm:w-12 pt-1.5 text-2xl sm:text-3xl font-bold leading-none tracking-tighter tabular-nums text-neutral-300 dark:text-neutral-700 select-none">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 sm:size-12 flex-none border bg-background">
            <AvatarImage
              src={work.logoUrl}
              alt={work.company}
              className="object-contain"
            />
            <AvatarFallback>{work.company[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <h3 className="font-semibold text-base sm:text-lg leading-tight">
              {work.company}
            </h3>
            <span className="text-sm text-neutral-500 tabular-nums">
              {work.start} — {work.end ?? "Present"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <span className="text-sm sm:text-base font-semibold">
              {work.title}
            </span>
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

          {work.responsibilities && work.responsibilities.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 self-start py-1 text-sm font-medium text-primary hover:underline transition-all"
            >
              {isExpanded ? "Show Less" : "Show Details"}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-300",
                  isExpanded ? "rotate-180" : "",
                )}
              />
            </button>
          )}
        </div>

        <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
          {work.description}
        </p>

        <AnimatePresence>
          {isExpanded && work.responsibilities && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <ul className="grid gap-3 pl-1 pt-1">
                {work.responsibilities.map((resp: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex gap-3 text-sm sm:text-base text-muted-foreground leading-relaxed group"
                  >
                    <span className="mt-2 size-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 flex-shrink-0 group-hover:bg-primary transition-colors" />
                    {resp}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {work.href && (
          <a
            href={work.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-primary transition-colors underline underline-offset-4"
          >
            Visit {work.company}
          </a>
        )}
      </div>
    </div>
  );
}
