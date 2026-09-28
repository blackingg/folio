"use client";

import { Children, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const word = {
  hidden: { opacity: 0, y: 14, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const wordLine = (delay: number, stagger = 0.045) => ({
  hidden: {},
  visible: { transition: { delayChildren: delay, staggerChildren: stagger } },
});

function split(content: ReactNode): ReactNode[] {
  const out: ReactNode[] = [];
  Children.toArray(content).forEach((child) => {
    if (typeof child !== "string") {
      out.push(child);
      return;
    }
    for (const piece of child.split(/(\s+)/)) if (piece) out.push(piece);
  });
  return out;
}

const isSpace = (part: ReactNode) =>
  typeof part === "string" && part.trim() === "";

export function WordStagger({
  text,
  children,
  className,
  delay = 0,
  stagger = 0.045,
  inherit = false,
}: {
  text?: string;
  children?: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  inherit?: boolean;
}) {
  const parts = split(children ?? text ?? "");
  let nth = 0;

  return (
    <span className={cn("inline", className)}>
      {parts.map((part, i) => {
        if (isSpace(part)) return <span key={i}>{part}</span>;
        const order = nth++;
        return inherit ? (
          <motion.span key={i} variants={word} className="inline-block">
            {part}
          </motion.span>
        ) : (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 14, filter: "blur(5px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              delay: delay + order * stagger,
            }}
            className="inline-block"
          >
            {part}
          </motion.span>
        );
      })}
    </span>
  );
}
