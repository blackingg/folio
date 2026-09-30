"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const rise = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function SectionIntro({
  kicker,
  heading,
  srLabel,
  lead,
  active = true,
  align = "start",
  className,
}: {
  kicker?: string;
  heading?: string;
  srLabel?: string;
  lead?: string;
  active?: boolean;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate={active ? "visible" : "hidden"}
      variants={rise}
      className={cn(
        "flex flex-col gap-1",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {srLabel && <h2 className="sr-only">{srLabel}</h2>}
      {kicker && (
        <p className="text-sm text-muted-foreground">{kicker}</p>
      )}
      {heading &&
        (srLabel ? (
          <p className="text-balance text-xl font-bold sm:text-2xl">
            {heading}
          </p>
        ) : (
          <h2 className="text-balance text-xl font-bold sm:text-2xl">
            {heading}
          </h2>
        ))}
      {lead && (
        <p className="max-w-prose text-pretty text-sm text-muted-foreground sm:text-base">
          {lead}
        </p>
      )}
    </motion.div>
  );
}
