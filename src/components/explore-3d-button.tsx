"use client";

import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { type MouseEvent, useRef, useState } from "react";
import Link from "next/link";
import { DoorOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFullPage } from "@/components/full-page-scroll";

interface Explore3dButtonProps {
  className?: string;
  delay?: number;
}

export function Explore3dButton({
  className,
  delay = 0,
}: Explore3dButtonProps) {
  const pathname = usePathname();
  const { activeIndex } = useFullPage();
  const ref = useRef<HTMLAnchorElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const [burst, setBurst] = useState(0);

  const isVisible = pathname !== "/3d" && activeIndex >= 1;

  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [24, -24]), {
    stiffness: 350,
    damping: 14,
    mass: 0.6,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-24, 24]), {
    stiffness: 350,
    damping: 14,
    mass: 0.6,
  });

  function handleMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    pointerX.set((e.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((e.clientY - bounds.top) / bounds.height - 0.5);
  }

  function handleMouseLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -40 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className={cn(
            "pointer-events-auto fixed right-4 top-4 z-40 perspective-800 sm:right-6 sm:top-6",
            className,
          )}
        >
          <Link
            ref={ref}
            href="/3d"
            aria-label="Project TRUMAN, an explorable 3D world"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => setBurst((n) => n + 1)}
            className="group relative flex cursor-pointer items-center justify-center p-2 [transform-style:preserve-3d]"
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" } as any}
          >
            <span className="pointer-events-none absolute right-full top-1/2 mr-1 hidden -translate-y-1/2 whitespace-nowrap rounded-sm border border-[hsl(var(--neon)/0.35)] bg-background/90 px-3 py-1 text-xs font-medium text-foreground opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 sm:block">
              Project TRUMAN
            </span>

            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay + 0.3,
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.86, transition: { duration: 0.12 } }}
              className="relative size-20 sm:size-24 lg:size-32 [transform-style:preserve-3d]"
            >
              <div
                className="absolute -inset-3 animate-blob-hue rounded-full opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle, hsl(var(--neon) / 0.55) 0%, hsl(var(--neon) / 0.12) 65%, transparent 100%)",
                }}
              />

              <div className="absolute inset-0 animate-blob-breathe">
                <div className="size-full animate-blob-hue">
                  <div className="size-full animate-blob-spin">
                    <div
                      className="size-full animate-blob-morph overflow-hidden"
                      style={{
                        borderRadius: "62% 38% 44% 56% / 54% 48% 52% 46%",
                        background:
                          "radial-gradient(120% 120% at 30% 24%, hsl(48 100% 78%) 0%, hsl(var(--neon)) 38%, hsl(32 92% 46%) 100%)",
                        boxShadow:
                          "inset 0 -10px 20px hsl(26 90% 24% / 0.5), inset 0 8px 16px hsl(48 100% 90% / 0.4)",
                      }}
                    >
                      <div
                        className="size-full animate-blob-sheen opacity-75"
                        style={{
                          background:
                            "radial-gradient(36% 28% at 34% 26%, hsl(48 100% 95% / 0.9) 0%, transparent 70%)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {burst > 0 && (
                  <motion.span
                    key={burst}
                    initial={{ opacity: 0.85, scale: 0.6 }}
                    animate={{ opacity: 0, scale: 2.1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="pointer-events-none absolute inset-0 rounded-full border-2"
                    style={{ borderColor: "hsl(var(--neon) / 0.9)" }}
                  />
                )}
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <DoorOpen
                  className="size-6 text-background drop-shadow-sm transition-transform duration-300 group-hover:scale-110 sm:size-7 lg:size-9"
                  strokeWidth={2.25}
                />
              </div>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
