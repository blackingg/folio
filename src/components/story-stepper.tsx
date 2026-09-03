"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { STEP_TRANSITION_S } from "@/components/full-page-scroll";
import type { FullPageProps } from "@/components/full-page-scroll";

const SWIPE_THRESHOLD = 40;

const slide = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction * 32,
    filter: "blur(6px)",
  }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (direction: number) => ({
    opacity: 0,
    x: -direction * 32,
    filter: "blur(6px)",
  }),
};

// A story-style sub-pager: a segmented progress bar up top (Instagram/
// Snapchat style) and one slide full-bleed at a time, swapped with a
// directional blur/slide instead of a peeking carousel.
//
// Advances via the same `stepRef` gesture contract FullPageScroll hands
// every page (see full-page-scroll.tsx), registered on the "x" axis because
// the slides are laid out left to right. Sideways gestures walk the slides;
// vertical ones are never offered here at all and pass through to the outer
// page, so a swipe up means "next section" rather than "next slide".
//
// The split leaves each input to a different owner: sideways wheel deltas
// and arrow keys arrive through `stepRef`, while horizontal touch drags are
// bound below, since only this component knows how far a finger has to
// travel across a slide to count as a swipe.
export function StoryStepper({
  count,
  renderSlide,
  active,
  stepRef,
  className,
}: {
  count: number;
  renderSlide: (index: number) => React.ReactNode;
  className?: string;
} & FullPageProps) {
  const [index, setIndex] = useState(0);
  const directionRef = useRef(1);
  // The pills, arrows and swipe below drive the slide directly, without
  // going through FullPageScroll's gesture lock — so they need their own
  // guard, or a click landing mid-swap cuts the transition short.
  const busyRef = useRef(false);
  const busyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const markBusy = () => {
    busyRef.current = true;
    clearTimeout(busyTimer.current);
    busyTimer.current = setTimeout(() => {
      busyRef.current = false;
    }, STEP_TRANSITION_S * 2 * 1000);
  };

  useEffect(() => {
    if (active) {
      setIndex(0);
      directionRef.current = 1;
    }
  }, [active]);

  useEffect(() => () => clearTimeout(busyTimer.current), []);

  useEffect(() => {
    stepRef?.({
      axis: "x",
      step: (direction) => {
        // Report the gesture as consumed rather than declining it: declining
        // would hand it back to FullPageScroll, which would flip the whole
        // page mid-swap instead of just ignoring the input.
        if (busyRef.current) return true;
        if (direction === 1 && index < count - 1) {
          directionRef.current = 1;
          markBusy();
          setIndex((i) => i + 1);
          return true;
        }
        if (direction === -1 && index > 0) {
          directionRef.current = -1;
          markBusy();
          setIndex((i) => i - 1);
          return true;
        }
        return false;
      },
    });
    return () => stepRef?.(null);
  }, [stepRef, index, count]);

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(count - 1, i));
    if (clamped === index || busyRef.current) return;
    directionRef.current = clamped >= index ? 1 : -1;
    markBusy();
    setIndex(clamped);
  };

  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let dragging = false;
    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragging = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (!dragging && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        dragging = true;
      }
      if (dragging && e.cancelable) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!dragging) return;
      const dx = startX - e.changedTouches[0].clientX;
      if (Math.abs(dx) < SWIPE_THRESHOLD) return;
      if (dx > 0) goTo(index + 1);
      else goTo(index - 1);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
    // Re-bind each time `index` changes so onTouchEnd always closes over
    // the current slide instead of a stale one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, count]);

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-8 flex items-center gap-4">
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to item ${i + 1}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              // h-4 is the tap target; the visible rail inside stays hairline.
              className="group flex h-4 flex-1 items-center"
            >
              <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-foreground/12 transition-colors group-hover:bg-foreground/30">
                {i < index && (
                  <span className="absolute inset-0 rounded-full bg-foreground/30" />
                )}
                {i === index && (
                  // Keyed on index so it remounts and re-sweeps on arrival,
                  // rather than sitting there already filled.
                  <motion.span
                    key={index}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: "left" }}
                    className="absolute inset-0 rounded-full bg-foreground"
                  />
                )}
              </span>
            </button>
          ))}
        </div>
        <span className="shrink-0 text-xs tabular-nums text-neutral-500">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(count).padStart(2, "0")}
        </span>

        {/* Kept in the header rather than floated outside the slide, so they
            stay on screen no matter how wide the host section runs. */}
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            aria-label="Previous"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
            className="rounded-full p-1 text-foreground/40 transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={index === count - 1}
            onClick={() => goTo(index + 1)}
            className="rounded-full p-1 text-foreground/40 transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div ref={trackRef} className="relative touch-pan-y">
        <AnimatePresence mode="wait" custom={directionRef.current} initial={false}>
          <motion.div
            key={index}
            custom={directionRef.current}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: STEP_TRANSITION_S, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderSlide(index)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
