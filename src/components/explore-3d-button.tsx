"use client";

import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { type MouseEvent, useRef } from "react";
import Link from "next/link";
import { ChevronRight, ArrowUpRight, Box } from "lucide-react";
import { cn } from "@/lib/utils";

interface Explore3dButtonProps {
  className?: string;
  delay?: number;
}

export function Explore3dButton({ className, delay = 0 }: Explore3dButtonProps) {
  const pathname = usePathname();
  const ref = useRef<HTMLAnchorElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  // Hide button on the 3D page itself
  if (pathname === "/3d") {
    return null;
  }

  // 3D tilt transformation math - styled after HeroAvatar
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [26, -26]), {
    stiffness: 350,
    damping: 14,
    mass: 0.6,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-26, 26]), {
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

  // Repeating circular text string around the ring
  const text = "Explore 3D Experience 🚧 • Explore 3D Experience 🚧 • ";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay }}
      className={cn(
        "fixed top-4 right-4 sm:top-6 sm:right-6 z-40 pointer-events-auto perspective-800",
        className
      )}
    >
      <Link
        ref={ref}
        href="/3d"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative flex items-center justify-center p-2 cursor-pointer [transform-style:preserve-3d]"
        style={
          {
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          } as any
        }
      >
        {/* Continuous levitation / idle float wrapper (from profile avatar animation) */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay + 0.3,
          }}
          whileHover={{ scale: 1.1 }}
          className="relative flex items-center justify-center size-28 sm:size-32 [transform-style:preserve-3d]"
        >
          {/* Ambient Glow Aura */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/35 via-indigo-500/30 to-sky-400/35 opacity-60 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl"
            style={{ transform: "translateZ(-12px)" }}
          />

          {/* Glass Disc Base */}
          <div
            className="absolute inset-0 rounded-full border border-primary/25 bg-background/80 backdrop-blur-md shadow-2xl transition-colors duration-300 group-hover:border-primary/50 group-hover:bg-background/95"
            style={{ transform: "translateZ(0px)" }}
          />

          {/* Rotating Circular Text Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ transform: "translateZ(20px)" }}
          >
            <svg
              viewBox="0 0 100 100"
              className="size-full overflow-visible"
            >
              <path
                id="circularTextPath"
                d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                fill="none"
              />
              <text className="fill-foreground/90 group-hover:fill-primary text-[8px] font-semibold tracking-[0.14em] uppercase transition-colors duration-300">
                <textPath
                  href="#circularTextPath"
                  startOffset="0%"
                >
                  {text}
                </textPath>
              </text>
            </svg>
          </motion.div>

          {/* Center 3D Floating Icon Button Core */}
          <div
            className="relative flex items-center justify-center size-12 sm:size-14 rounded-full bg-primary/10 text-primary border border-primary/25 shadow-md group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300"
            style={{ transform: "translateZ(36px)" }}
          >
            <Box className="size-6 transition-transform duration-300 group-hover:rotate-12" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
