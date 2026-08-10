"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Fades a line of text in word-by-word instead of as one block, so
// paragraphs read as a cascade rather than a single flat reveal.
export function WordStagger({
  text,
  className,
  delay = 0,
  stagger = 0.045,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={cn("inline", className)}>
      {words.map((word, i) => (
        <span key={i}>
          <motion.span
            initial={{ opacity: 0, y: 14, filter: "blur(5px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              delay: delay + i * stagger,
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
