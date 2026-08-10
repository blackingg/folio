"use client";

import { motion } from "framer-motion";

// Each word springs in with a little tumble, then the hand keeps waving on
// a loop — the one bit of hero motion that never fully settles.
export function HeroGreeting({
  firstName,
  className,
  delay = 0,
}: {
  firstName: string;
  className?: string;
  delay?: number;
}) {
  const words = ["Hi,", "I'm", firstName];
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={word}>
          <motion.span
            initial={{ opacity: 0, y: 28, rotate: -6, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 18,
              delay: delay + i * 0.08,
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
          <span> </span>
        </span>
      ))}
      <motion.span
        initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 14,
          delay: delay + 0.3,
        }}
        className="inline-block origin-[70%_70%]"
      >
        <motion.span
          animate={{ rotate: [0, 18, -12, 18, -4, 0] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
            delay: delay + 1,
          }}
          className="inline-block origin-[70%_70%]"
        >
          👋
        </motion.span>
      </motion.span>
    </span>
  );
}
