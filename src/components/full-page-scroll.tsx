"use client";

import { motion } from "framer-motion";
import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const TRANSITION_S = 0.7;
const WHEEL_THRESHOLD = 24;
const WHEEL_IDLE_RESET_MS = 150;
const TOUCH_THRESHOLD = 50;
// Locks input for slightly longer than the transition so one gesture can
// never queue a second page jump before the first one settles.
const GESTURE_LOCK_MS = TRANSITION_S * 1000 + 80;
// One phase of a StoryStepper slide swap. Owned here rather than in
// story-stepper.tsx so the lock below and the animation can't drift apart —
// story-stepper imports this (the dependency already runs that direction,
// so there's no import cycle).
export const STEP_TRANSITION_S = 0.26;
// A swap costs *two* phases, not one: AnimatePresence mode="wait" runs the
// outgoing slide's exit to completion before the incoming slide starts. Lock
// for both, or the second half of every transition is interruptible.
const STEP_LOCK_MS = STEP_TRANSITION_S * 2 * 1000 + 60;
// After the base lock, don't unlock while wheel events are still arriving —
// trackpad momentum from the same flick can keep firing well past the lock
// window, and re-arming mid-momentum lets that tail scroll straight into
// another page jump. Wait for this long a gap in wheel events instead.
const WHEEL_QUIET_MS = 120;
// ...but bound that wait. Wheel events refresh the quiet timer even while
// locked, so without a ceiling anyone scrolling continuously keeps pushing
// the deadline back and the lock never releases at all.
const MAX_QUIET_HOLD_MS = 400;

// A page with more than one viewport's worth of content (Work, Projects,
// Blog) can register one of these to consume a gesture internally — e.g.
// advancing to the next card — before FullPageScroll falls back to
// flipping the page. Returning false means "nothing left to consume in
// that direction," so paging proceeds as normal.
export type StepHandle = { step: (direction: 1 | -1) => boolean };

export type FullPageProps = {
  active?: boolean;
  stepRef?: (handle: StepHandle | null) => void;
};

// No document scroll, no scrollbar: this owns the whole viewport and turns
// every wheel tick / vertical swipe / arrow key into exactly one page
// transition. Horizontal gestures (dx > dy) are left alone so a page like
// the Projects carousel can still handle its own left-right dragging.
export function FullPageScroll({ children }: { children: React.ReactNode }) {
  const pages = Children.toArray(children);
  const total = pages.length;
  const [active, setActive] = useState(0);
  const activeRef = useRef(active);
  activeRef.current = active;
  const lockRef = useRef(false);
  const wheelAccum = useRef(0);
  const wheelResetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const lastWheelAtRef = useRef(0);
  // Registered by the active page via `stepRef` (see StepHandle above).
  const stepRefs = useRef<(StepHandle | null)[]>([]);
  const setStepRef = useCallback(
    (i: number) => (handle: StepHandle | null) => {
      stepRefs.current[i] = handle;
    },
    [],
  );
  const tryStep = useCallback((direction: 1 | -1) => {
    return stepRefs.current[activeRef.current]?.step(direction) ?? false;
  }, []);

  // Locks input for one gesture's worth of time after *any* advance — a
  // card step or a page flip. Without this, a single fast flick could cross
  // the wheel threshold multiple times before its momentum tapered off,
  // blowing through several cards (or a card and then the next page) in one
  // continuous motion instead of moving exactly one step.
  const lockGesture = useCallback((ms: number) => {
    lockRef.current = true;
    // One timer at a time: a stray one left over from a previous lock would
    // otherwise fire mid-transition and release this one early.
    clearTimeout(unlockTimer.current);
    const deadline = Date.now() + ms + MAX_QUIET_HOLD_MS;
    const settle = () => {
      const now = Date.now();
      const quietFor = now - lastWheelAtRef.current;
      if (quietFor < WHEEL_QUIET_MS && now < deadline) {
        unlockTimer.current = setTimeout(
          settle,
          Math.min(WHEEL_QUIET_MS - quietFor, deadline - now),
        );
        return;
      }
      // Momentum belonging to the gesture we just served shouldn't carry
      // over and part-fill the threshold for the next one.
      wheelAccum.current = 0;
      lockRef.current = false;
    };
    unlockTimer.current = setTimeout(settle, ms);
  }, []);

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(total - 1, index));
    if (clamped === activeRef.current || lockRef.current) return;
    lockGesture(GESTURE_LOCK_MS);
    setActive(clamped);
  }, [total, lockGesture]);

  // Single entry point for every gesture: try the active page's own
  // stepper first, and only flip pages once it reports nothing left to
  // consume in that direction. Both outcomes engage the same lock, just
  // scaled to how long that particular transition actually takes.
  const advance = useCallback((direction: 1 | -1) => {
    if (lockRef.current) return;
    if (tryStep(direction)) {
      lockGesture(STEP_LOCK_MS);
      return;
    }
    goTo(activeRef.current + direction);
  }, [tryStep, lockGesture, goTo]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("full-page-scroll-active");
    return () => html.classList.remove("full-page-scroll-active");
  }, []);

  useEffect(
    () => () => {
      clearTimeout(unlockTimer.current);
      clearTimeout(wheelResetTimer.current);
    },
    [],
  );

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      lastWheelAtRef.current = Date.now();
      e.preventDefault();
      if (lockRef.current) return;
      wheelAccum.current += e.deltaY;
      clearTimeout(wheelResetTimer.current);
      wheelResetTimer.current = setTimeout(() => {
        wheelAccum.current = 0;
      }, WHEEL_IDLE_RESET_MS);
      if (Math.abs(wheelAccum.current) > WHEEL_THRESHOLD) {
        const direction = wheelAccum.current > 0 ? 1 : -1;
        wheelAccum.current = 0;
        advance(direction);
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = touchStartX - e.changedTouches[0].clientX;
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dx) > Math.abs(dy)) return;
      if (Math.abs(dy) < TOUCH_THRESHOLD) return;
      const goingDown = dy > 0;
      advance(goingDown ? 1 : -1);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        advance(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        advance(-1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [advance]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <motion.div
        animate={{ y: `-${active * 100}dvh` }}
        transition={{ duration: TRANSITION_S, ease: [0.65, 0, 0.35, 1] }}
      >
        {pages.map((page, i) => (
          <div key={i} className="h-[100dvh] w-full">
            {isValidElement<FullPageProps>(page) && typeof page.type !== "string"
              ? cloneElement(page, {
                  active: i === active,
                  stepRef: setStepRef(i),
                })
              : page}
          </div>
        ))}
      </motion.div>

      <div className="pointer-events-none fixed right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2 sm:right-5">
        {pages.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to page ${i + 1}`}
            onClick={() => goTo(i)}
            className={cn(
              "pointer-events-auto size-1.5 rounded-full transition-all",
              i === active
                ? "h-4 bg-foreground"
                : "bg-foreground/25 hover:bg-foreground/50",
            )}
          />
        ))}
      </div>
    </div>
  );
}
