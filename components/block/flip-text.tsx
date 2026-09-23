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
  intervalMs = 5000,
}: FlowingTextProps) {
  const [cycle, setCycle] = useState(0);

  // Periodic slow, elegant cascade wave flow
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
        perspective: "1200px",
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
          {word.split("").map((char, charIndex) => {
            const index = totalIndex++;
            return (
              <motion.span
                key={`${cycle}-${index}`}
                className="inline-block select-none"
                style={{
                  transformStyle: "preserve-3d",
                  display: "inline-block",
                  willChange: "transform",
                }}
                initial={{ y: 0, rotateX: 0 }}
                animate={{
                  y: [0, -10, 0],
                  rotateX: [0, 360, 0],
                }}
                transition={{
                  duration: 1.25, // Slow, fluid, graceful duration
                  delay: index * 0.075, // Smooth wave delay
                  ease: [0.25, 1, 0.5, 1], // Silky smooth cubic-bezier curve
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
