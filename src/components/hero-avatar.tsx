"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { type MouseEvent, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Pops in with a spring, drifts on a slow idle float once settled, and
// tilts toward the cursor on hover — the little bit of interactivity that
// makes the hero feel alive instead of a static portrait.
export function HeroAvatar({
  src,
  alt,
  initials,
  className,
  delay = 0,
}: {
  src: string;
  alt: string;
  initials: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [28, -28]), {
    stiffness: 350,
    damping: 14,
    mass: 0.6,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-28, 28]), {
    stiffness: 350,
    damping: 14,
    mass: 0.6,
  });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
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
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.12 }}
      transition={{ type: "spring", stiffness: 240, damping: 16, delay }}
      style={{ rotateX, rotateY, perspective: 400 }}
      className={cn(
        "cursor-pointer [transform-style:preserve-3d]",
        className,
      )}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay + 0.6,
        }}
        whileHover={{
          filter: "drop-shadow(0 8px 24px rgb(0 0 0 / 0.25))",
        }}
        style={{ translateZ: 24 }}
      >
        <Avatar className="size-56 md:size-32 border-2 shadow-sm">
          <AvatarImage alt={alt} src={src} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </motion.div>
    </motion.div>
  );
}
