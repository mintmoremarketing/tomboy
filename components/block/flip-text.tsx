"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface FlowingTextProps {
  children: string;
  className?: string;
  intervalMs?: number;
}

export function FlowingText({
  children,
  className,
  intervalMs = 4500,
}: FlowingTextProps) {
  const [cycle, setCycle] = useState(0);

  // Periodic wave animation: letters go up one by one, disappear, and re-emerge
  useEffect(() => {
    const timer = setInterval(() => {
      setCycle((prev) => prev + 1);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  const words = children.split(" ");
  let totalIndex = 0;

  return (
    <span
      className={cn("inline-flex flex-wrap items-baseline", className)}
      style={{
        perspective: "1000px",
        columnGap: "0.36em",
        rowGap: "0.15em",
      }}
    >
      {words.map((word, wordIndex) => (
        <span
          key={wordIndex}
          className="inline-flex whitespace-nowrap"
          style={{ whiteSpace: "nowrap" }}
        >
          {word.split("").map((char) => {
            const index = totalIndex++;
            return (
              <motion.span
                key={`${cycle}-${index}`}
                className="inline-block select-none"
                style={{
                  display: "inline-block",
                  transformStyle: "preserve-3d",
                  willChange: "transform, opacity, filter",
                }}
                initial={{ y: 0, opacity: 1, rotateX: 0, filter: "blur(0px)" }}
                animate={{
                  y: [0, -32, 28, 0],
                  opacity: [1, 0, 0, 1],
                  filter: ["blur(0px)", "blur(2px)", "blur(1.5px)", "blur(0px)"],
                  rotateX: [0, -20, 15, 0],
                }}
                transition={{
                  duration: 1.1,
                  delay: index * 0.045, // Staggered wave timing
                  times: [0, 0.38, 0.48, 1],
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

export const FlipText = FlowingText;
export default FlowingText;
