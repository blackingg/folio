"use client";

import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ResumeCard } from "@/components/resume-card";
import { ScrollFadeSection } from "@/components/scroll-fade-section";
import { cn } from "@/lib/utils";

type Work = {
  company: string;
  title: string;
  href?: string;
  badges?: readonly string[];
  logoUrl: string;
  start: string;
  end?: string;
  description?: string;
};

const STICKY_TOP = 260;
const PEEK_OFFSET = 18;
// Pin line for the section title, floating just above the card pile.
const TITLE_TOP = STICKY_TOP - 56;
// Fallback card height for the first render; the real height is measured
// after mount so the page geometry matches what's actually on screen.
const DEFAULT_CARD_HEIGHT = 190;

function StackCard({
  work,
  index,
  total,
  progress,
  measureRef,
}: {
  work: Work;
  index: number;
  total: number;
  progress: MotionValue<number>;
  measureRef?: React.Ref<HTMLDivElement>;
}) {
  // Once this card pins, shrink and dim it as the ones below scroll over it.
  const start = index / total;
  const isLast = index === total - 1;
  const scale = useTransform(
    progress,
    [start, 1],
    [1, isLast ? 1 : 1 - (total - 1 - index) * 0.04],
  );
  const opacity = useTransform(progress, [start, 1], [1, isLast ? 1 : 0.4]);

  return (
    <motion.div
      ref={measureRef}
      style={{ scale, opacity, top: STICKY_TOP + index * PEEK_OFFSET }}
      className={cn("sticky origin-top", !isLast && "mb-4")}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <ResumeCard
          logoUrl={work.logoUrl}
          altText={work.company}
          title={work.company}
          subtitle={work.title}
          href={work.href}
          badges={work.badges}
          period={`${work.start} ${work.end && "-"} ${work.end ?? "Present"}`}
          description={work.description}
        />
      </motion.div>
    </motion.div>
  );
}

export function WorkStack({ works, title }: { works: Work[]; title?: string }) {
  const targetRef = useRef<HTMLDivElement>(null);

  // Measure the last card so the pile bottom, button pin, and page padding
  // track the real rendered height instead of an estimate.
  const lastCardRef = useRef<HTMLDivElement>(null);
  const [lastCardHeight, setLastCardHeight] = useState(DEFAULT_CARD_HEIGHT);
  useEffect(() => {
    const el = lastCardRef.current;
    if (!el) return;
    const measure = () => setLastCardHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pileBottom =
    STICKY_TOP + PEEK_OFFSET * (works.length - 1) + lastCardHeight;

  // 0 when the first card pins, 1 when the last card lands. The padding
  // below the cards is sized so that landing moment coincides with the
  // container bottom meeting the viewport bottom — the next section stays
  // out of view until the pile is complete.
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: [`start ${STICKY_TOP}px`, "end end"],
  });

  return (
    <div
      ref={targetRef}
      className="relative"
    >
      {/* Enter finishes as the title pins, exit starts once the last card
          lands, so the panel stays at full strength through the whole
          stacking interaction. */}
      <ScrollFadeSection
        enterOffset={["start end", `start ${STICKY_TOP}px`]}
        exitOffset={["end end", "end start"]}
        style={{
          // 100svh of padding (minus the pile and the ~64px button block)
          // keeps the next section below the fold until the last card lands,
          // the extra 25svh holds the finished page a beat longer, and the
          // 6rem floor stops short viewports from collapsing the hold.
          paddingBottom: `max(6rem, calc(125svh - ${pileBottom + 64}px))`,
        }}
        className="origin-top z-100"
      >
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ top: TITLE_TOP || 1 }}
            className="sticky mb-3 text-xl font-bold"
          >
            {title}
          </motion.h2>
        )}
        {works.map((work, i) => (
          <StackCard
            key={work.company + work.title}
            work={work}
            index={i}
            total={works.length}
            progress={scrollYProgress}
            measureRef={i === works.length - 1 ? lastCardRef : undefined}
          />
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          // Trails below the last card and pins just under the pile — it
          // moves with the cards but never joins the stack, and since it's
          // always below them nothing ever slides over it.
          style={{ top: pileBottom + 24 }}
          className="sticky mt-4 flex justify-center"
        >
          <Link
            href="/work"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View Full Career Path
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </ScrollFadeSection>
    </div>
  );
}
