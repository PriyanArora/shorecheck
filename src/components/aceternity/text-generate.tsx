"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/** Aceternity TextGenerateEffect: words fade in one after another. */
export function TextGenerate({
  words,
  className,
  delay = 0,
}: {
  words: string;
  className?: string;
  delay?: number;
}) {
  const parts = words.split(" ");
  return (
    <span className={cn("inline", className)}>
      {parts.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: delay + i * 0.08, ease: "easeOut" }}
          className="inline-block"
        >
          {w}
          {i < parts.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}
