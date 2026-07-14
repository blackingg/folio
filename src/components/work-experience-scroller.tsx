"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { WorkExperienceItem } from "@/components/work-experience-item";

type Work = Parameters<typeof WorkExperienceItem>[0]["work"];

const PANEL_FRACTION = 0.9;

function Panel({
  work,
  index,
  total,
  progress,
}: {
  work: Work;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const step = 1 / (total - 1);
  const center = index * step;
  const scale = useTransform(
    progress,
    [center - step, center, center + step],
    [0.92, 1, 0.92],
  );
  const opacity = useTransform(
    progress,
    [center - step, center, center + step],
    [0.5, 1, 0.5],
  );

  return (
    <motion.div
      style={{ scale, opacity }}
      className="w-[90%] shrink-0 pr-4 sm:pr-8"
    >
      <div className="overflow-y-auto rounded-2xl border bg-background p-6 shadow-sm min-h-[35svh] sm:p-10">
        <WorkExperienceItem
          work={work}
          index={index}
        />
      </div>
    </motion.div>
  );
}

export function WorkExperienceScroller({ works }: { works: Work[] }) {
  const targetRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  // 0 when the section enters the viewport, 1 once it pins to the top.
  const { scrollYProgress: entryProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "start start"],
  });
  // 0 while pinned, 1 once the section has fully scrolled out the top.
  const { scrollYProgress: exitProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });
  const frameScale = useTransform(
    [entryProgress, exitProgress],
    ([enter, exit]: number[]) => 0.8 + 0.2 * Math.min(enter, 1 - exit),
  );
  const frameOpacity = useTransform(
    [entryProgress, exitProgress],
    ([enter, exit]: number[]) => 0.4 + 0.6 * Math.min(enter, 1 - exit),
  );
  const [current, setCurrent] = useState(0);

  const total = works.length;
  // Panels are 90% of the viewport wide, so the track spans (0.9 * total) viewports.
  // The x percentage is relative to the viewport-wide container, so slide by
  // (track width - one viewport) to end with the last panel flush right.
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `-${(PANEL_FRACTION * total - 1) * 100}%`],
  );

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setCurrent(Math.min(total - 1, Math.max(0, Math.round(v * (total - 1)))));
  });

  // Let horizontal swipes (and trackpad horizontal wheel) drive the track by
  // converting them into the vertical scroll the animation is keyed to.
  const stickyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sticky = stickyRef.current;
    const section = targetRef.current;
    if (!sticky || !section) return;

    // Map gesture pixels onto the pinned scroll range so panels track ~1:1.
    const scrollByGesture = (dx: number) => {
      const v = scrollYProgress.get();
      if ((v <= 0 && dx < 0) || (v >= 1 && dx > 0)) return false;
      const trackWidth = (PANEL_FRACTION * total - 1) * sticky.clientWidth;
      const scrollRange = section.offsetHeight - window.innerHeight;
      if (trackWidth <= 0 || scrollRange <= 0) return false;
      window.scrollBy(0, (dx * scrollRange) / trackWidth);
      return true;
    };

    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let mode: "idle" | "horizontal" | "vertical" = "idle";

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = lastX = t.clientX;
      startY = t.clientY;
      mode = "idle";
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (mode === "idle") {
        const dx = Math.abs(t.clientX - startX);
        const dy = Math.abs(t.clientY - startY);
        if (Math.max(dx, dy) < 10) return;
        mode = dx > dy ? "horizontal" : "vertical";
      }
      if (mode !== "horizontal") return;
      if (e.cancelable) e.preventDefault();
      const dx = lastX - t.clientX;
      lastX = t.clientX;
      scrollByGesture(dx);
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (scrollByGesture(e.deltaX)) e.preventDefault();
    };

    // React registers touch/wheel handlers passively, so attach natively to
    // be able to preventDefault once a gesture is claimed as horizontal.
    sticky.addEventListener("touchstart", onTouchStart, { passive: true });
    sticky.addEventListener("touchmove", onTouchMove, { passive: false });
    sticky.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      sticky.removeEventListener("touchstart", onTouchStart);
      sticky.removeEventListener("touchmove", onTouchMove);
      sticky.removeEventListener("wheel", onWheel);
    };
  }, [scrollYProgress, total]);

  return (
    <section
      ref={targetRef}
      style={{ height: `${total * 55 + 45}vh` }}
      className="relative"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-[100svh] touch-pan-y flex-col justify-center overflow-hidden"
      >
        <motion.div style={{ scale: frameScale, opacity: frameOpacity }}>
          <div className="mb-4 flex items-baseline justify-between px-1">
            <span className="text-sm text-neutral-500">Scroll to explore</span>
            <span className="text-sm font-medium tabular-nums text-neutral-500">
              {String(current + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </span>
          </div>

          <motion.div
            style={{ x }}
            className="flex"
          >
            {works.map((work, i) => (
              <Panel
                key={work.company + work.title}
                work={work}
                index={i}
                total={total}
                progress={scrollYProgress}
              />
            ))}
          </motion.div>

          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="mt-6 h-0.5 origin-left rounded-full bg-[hsl(var(--neon))] shadow-[0_0_8px_hsl(var(--neon))]"
          />
        </motion.div>
      </div>
    </section>
  );
}
