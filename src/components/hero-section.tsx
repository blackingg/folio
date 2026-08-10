"use client";

import { HeroAvatar } from "@/components/hero-avatar";
import { HeroGreeting } from "@/components/hero-greeting";
import { WordStagger } from "@/components/word-stagger";
import type { FullPageProps } from "@/components/full-page-scroll";

const BLUR_FADE_DELAY = 0.04;

export function HeroSection({
  name,
  description,
  avatarUrl,
  initials,
}: {
  name: string;
  description: string;
  avatarUrl: string;
  initials: string;
} & FullPageProps) {
  return (
    <div className="flex h-full flex-col justify-center px-6 pb-20 pt-12 sm:pb-32 sm:pt-24">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <div className="flex flex-col-reverse items-center justify-between gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-1 flex-col space-y-2 text-center sm:text-left">
            <h1 className="sr-only">{name} - Frontend Engineer Portfolio</h1>
            <HeroGreeting
              firstName={name.split(" ")[0]}
              className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
              delay={BLUR_FADE_DELAY}
            />
            <p className="max-w-[700px] text-left text-base leading-relaxed sm:text-lg md:text-xl">
              <WordStagger
                text={description}
                delay={BLUR_FADE_DELAY + 0.5}
              />
            </p>
          </div>
          <HeroAvatar
            src={avatarUrl}
            alt={name}
            initials={initials}
            delay={BLUR_FADE_DELAY}
          />
        </div>
      </div>
    </div>
  );
}
