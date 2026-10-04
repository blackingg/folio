"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HeroAvatar } from "@/components/hero-avatar";
import { HeroGreeting } from "@/components/hero-greeting";
import { SectionLink } from "@/components/section-link";
import { WordStagger } from "@/components/word-stagger";
import type { FullPageProps } from "@/components/full-page-scroll";
import { cn } from "@/lib/utils";

const BLUR_FADE_DELAY = 0.04;

const HERO_STAGGER = 0.03;
const HERO_START = BLUR_FADE_DELAY + 0.5;

export function HeroSection({
  name,
  lines,
  avatarUrl,
  initials,
  hireUrl,
  workUrl,
  active,
}: {
  name: string;
  lines: readonly string[];
  avatarUrl: string;
  initials: string;
  hireUrl: string;
  workUrl: string;
} & FullPageProps) {

  let elapsed = HERO_START;
  const timed = lines.map((text) => {
    const delay = elapsed;
    elapsed += text.split(" ").length * HERO_STAGGER;
    return { text, delay };
  });

  return (
    <div className="flex h-full flex-col justify-center px-6 pb-20 pt-[clamp(1.25rem,5svh,3rem)] sm:pb-32 sm:pt-24">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <div className="flex flex-col-reverse items-center justify-between gap-[clamp(0.75rem,3svh,1.5rem)] sm:flex-row sm:items-start">
          <div className="flex w-full min-w-0 flex-1 flex-col space-y-3 text-left sm:space-y-4">
            <h1 className="sr-only">{name} - Software Engineer Portfolio</h1>
            <HeroGreeting
              firstName={name.split(" ")[0]}
              className="text-3xl font-bold tracking-tight sm:text-5xl sm:tracking-tighter xl:text-6xl/none"
              delay={BLUR_FADE_DELAY}
            />
            <div className="max-w-[40ch] space-y-2 sm:max-w-[46ch] sm:space-y-3">
              {timed.map(({ text, delay }, i) => (
                <p
                  key={text}
                  className={cn(
                    "text-pretty text-base leading-relaxed sm:text-lg sm:leading-snug md:text-xl",
                    i === timed.length - 1
                      ? "font-medium text-foreground"
                      : "text-foreground/70",
                  )}
                >
                  <WordStagger
                    text={text}
                    delay={delay}
                    stagger={HERO_STAGGER}
                  />
                </p>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: elapsed + 0.15,
              }}
              className="flex flex-wrap items-center gap-5 pt-3 sm:pt-4"
            >
              <Link
                href={hireUrl}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Hire me
              </Link>
              <SectionLink href={workUrl}>View my work</SectionLink>
            </motion.div>
          </div>
          <HeroAvatar
            src={avatarUrl}
            alt={name}
            initials={initials}
            delay={BLUR_FADE_DELAY}
            // Parks the idle bob once the hero is no longer the live panel.
            float={active ?? true}
          />
        </div>
      </div>
    </div>
  );
}
