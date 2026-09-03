"use client";

import { motion } from "framer-motion";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Explore3dButton } from "@/components/explore-3d-button";

const FullPageContext = createContext<{ activeIndex: number }>({ activeIndex: 0 });

export const useFullPage = () => useContext(FullPageContext);

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
// that direction," so paging proceeds as normal. `axis` declares which
// gesture direction the stepper answers to, and has to match how its items
// are actually laid out — see the routing table on FullPageScroll below.
export type StepHandle = {
  step: (direction: 1 | -1) => boolean;
  axis?: "x" | "y";
};

export type FullPageProps = {
  active?: boolean;
  stepRef?: (handle: StepHandle | null) => void;
};

// No document scroll, no scrollbar: this owns the whole viewport and turns
// every wheel tick, swipe and arrow key into exactly one transition. Which
// transition depends on the axis the gesture came in on and on what the
// active page registered through `stepRef`:
//
//   vertical    the page's stepper if it runs vertically, otherwise a page
//               flip — so a page with no stepper at all simply flips.
//   horizontal  the page's stepper if it runs horizontally, otherwise
//               nothing. Sideways gestures never flip the page: running out
//               of slides should stop, not spill into a section change
//               nobody asked for.
//
// That split is what makes a swipe up on Work or Blog jump to the next
// section rather than walk their slides — both lay their slides out side by
// side and register on "x". The projects ring stands upright on desktop and
// travels vertically, so it stays on "y" and still takes vertical gestures.
//
// Each axis tallies its own wheel deltas. A trackpad flick is never purely
// one direction, and a shared counter would let the stray component of a
// vertical swipe part-fill the horizontal threshold, and vice versa.
export function FullPageScroll({ children }: { children: React.ReactNode }) {
  const pages = Children.toArray(children);
  const total = pages.length;
  const [active, setActive] = useState(0);
  const activeRef = useRef(active);
  activeRef.current = active;
  const lockRef = useRef(false);
  const wheelAccum = useRef(0);
  const wheelAccumX = useRef(0);
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
  // An axis mismatch reports "not consumed" rather than declining to look,
  // which is what lets a vertical swipe page straight past Work's slides.
  const tryStep = useCallback((direction: 1 | -1, axis: "x" | "y") => {
    const handle = stepRefs.current[activeRef.current];
    if (!handle || (handle.axis ?? "y") !== axis) return false;
    return handle.step(direction);
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
      wheelAccumX.current = 0;
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

  // Entry point for vertical gestures: a vertical stepper gets first
  // refusal, then the page flips. Both outcomes engage the same lock, just
  // scaled to how long that particular transition actually takes.
  const advance = useCallback((direction: 1 | -1) => {
    if (lockRef.current) return;
    if (tryStep(direction, "y")) {
      lockGesture(STEP_LOCK_MS);
      return;
    }
    goTo(activeRef.current + direction);
  }, [tryStep, lockGesture, goTo]);

  // The sideways counterpart, with no page-flip fallback by design.
  const advanceX = useCallback((direction: 1 | -1) => {
    if (lockRef.current) return;
    if (tryStep(direction, "x")) lockGesture(STEP_LOCK_MS);
  }, [tryStep, lockGesture]);

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
      lastWheelAtRef.current = Date.now();
      e.preventDefault();
      if (lockRef.current) return;
      const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const accum = sideways ? wheelAccumX : wheelAccum;
      accum.current += sideways ? e.deltaX : e.deltaY;
      clearTimeout(wheelResetTimer.current);
      wheelResetTimer.current = setTimeout(() => {
        wheelAccum.current = 0;
        wheelAccumX.current = 0;
      }, WHEEL_IDLE_RESET_MS);
      if (Math.abs(accum.current) > WHEEL_THRESHOLD) {
        const direction = accum.current > 0 ? 1 : -1;
        accum.current = 0;
        if (sideways) advanceX(direction);
        else advance(direction);
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
      } else if (e.key === "ArrowRight") {
        advanceX(1);
      } else if (e.key === "ArrowLeft") {
        advanceX(-1);
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
  }, [advance, advanceX]);

  return (
    <FullPageContext.Provider value={{ activeIndex: active }}>
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

        <Explore3dButton />

        <SlidePrompt
          active={active}
          total={total}
          onNext={() => advance(1)}
          onPrev={() => advance(-1)}
        />
      </div>
    </FullPageContext.Provider>
  );
}

function SteppingArrows() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 18);
    }, 550); // Relaxed stepping cadence (550ms per step)
    return () => clearInterval(interval);
  }, []);

  // Calculate active arrow index (0, 1, 2) or -1 for pause
  let activeArrow = -1;
  if (step < 3) activeArrow = step;
  else if (step >= 4 && step < 7) activeArrow = step - 4;
  else if (step >= 8 && step < 11) activeArrow = step - 8;

  // During the pause window between series (steps 11 to 17), hide arrows completely
  const isPause = step >= 11;
  if (isPause) {
    return null;
  }

  return (
    <div className="flex flex-col items-center -space-y-2">
      {[0, 1, 2].map((i) => {
        const isActive = activeArrow === i;
        return (
          <motion.div
            key={i}
            animate={{
              opacity: isActive ? 1 : 0.15,
              scale: isActive ? 1.25 : 0.85,
              y: isActive ? 2 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              color: isActive ? "hsl(var(--neon))" : "hsl(var(--neon) / 0.2)",
              filter: isActive ? "drop-shadow(0 0 10px hsl(var(--neon)))" : "none",
            }}
          >
            <ChevronDown className="size-6 stroke-[2.5]" />
          </motion.div>
        );
      })}
    </div>
  );
}

function SlidePrompt({
  active,
  onNext,
}: {
  active: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [hasSlid, setHasSlid] = useState(false);

  useEffect(() => {
    if (active > 0) {
      setHasSlid(true);
    }
  }, [active]);

  if (hasSlid) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ delay: 1, duration: 0.6 }}
      className="pointer-events-none fixed inset-x-0 bottom-20 z-30 mx-auto flex items-center justify-center"
    >
      <button
        type="button"
        onClick={onNext}
        aria-label="Slide down to continue"
        className="pointer-events-auto group relative flex items-center justify-center p-2 transition-colors cursor-pointer"
      >
        <SteppingArrows />
      </button>
    </motion.div>
  );
}
