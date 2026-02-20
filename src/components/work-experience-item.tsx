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
    <div className="relative grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 sm:gap-10">
      <div className="relative z-10 hidden sm:block">
        <Avatar className="size-14 border-2 bg-background shadow-sm ring-8 ring-background">
          <AvatarImage
            src={work.logoUrl}
            alt={work.company}
            className="object-contain"
          />
          <AvatarFallback>{work.company[0]}</AvatarFallback>
        </Avatar>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:hidden mb-2">
            <Avatar className="size-10 border bg-background shadow-sm">
              <AvatarImage
                src={work.logoUrl}
                alt={work.company}
                className="object-contain"
              />
              <AvatarFallback>{work.company[0]}</AvatarFallback>
            </Avatar>
            <span className="font-bold text-lg">{work.company}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight hidden sm:block">
              {work.company}
            </h3>
            <span className="text-sm sm:text-base font-medium text-neutral-500 tabular-nums">
              {work.start} — {work.end ?? "Present"}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-lg font-semibold text-primary/90">
                {work.title}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {work.badges?.map((badge) => (
                  <Badge
                    key={badge}
                    variant="secondary"
                    className="px-2 py-0 text-[10px] font-semibold uppercase tracking-wider"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>

            {work.responsibilities && work.responsibilities.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-all"
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
        </div>

        <div className="space-y-4">
          <p className="text-base sm:text-lg text-foreground/80 leading-relaxed font-medium">
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
                <ul className="grid gap-3 pl-1 pt-2">
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
            <div className="pt-2">
              <a
                href={work.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-primary transition-colors underline underline-offset-4"
              >
                Visit {work.company}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
