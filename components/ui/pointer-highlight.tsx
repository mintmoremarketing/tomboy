"use client";
import { cn } from "@/lib/utils";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";

// Aceternity "Pointer Highlight", ported to plain CSS (this project has no Tailwind).
// Layout lives in globals.css under `.ph-*`; colours come in via props so each
// call site can theme it. The box and the cursor share one in-view trigger and
// one transition, so the cursor always drags the box's bottom-right corner.
export function PointerHighlight({
  children,
  rectangleClassName,
  pointerClassName,
  containerClassName,
  rectangleStyle,
  pointerStyle,
  color,
  duration = 1,
  loop = true,
  holdFor = 1.2,
  delay = 0,
}: {
  children: React.ReactNode;
  rectangleClassName?: string;
  pointerClassName?: string;
  containerClassName?: string;
  rectangleStyle?: React.CSSProperties;
  pointerStyle?: React.CSSProperties;
  /** Fills the box and colours the pointer (they always match). */
  color?: string;
  duration?: number;
  loop?: boolean;
  holdFor?: number;
  /** Seconds before the first cycle — use it to stagger several highlights. */
  delay?: number;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const inView = useInView(containerRef, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // offsetWidth/Height include padding + border, matching where the box is drawn.
    const measure = () => setSize({ width: el.offsetWidth, height: el.offsetHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const ready = size.width > 0 && size.height > 0;
  const active = ready && inView;
  const w = size.width;
  const h = size.height;
  const end = { x: w - 2, y: h - 2 };

  // One cycle: drag open → hold → release (box vanishes, pointer stays) →
  // pointer glides back to the top-left corner → short rest → repeat.
  const release = 0.2;
  const back = duration * 0.7;
  const rest = 0.35;
  const cycle = duration + holdFor + release + back + rest;
  const tDrawn = duration / cycle;
  const tHold = (duration + holdFor) / cycle;
  const tReleased = (duration + holdFor + release) / cycle;
  const tBack = (duration + holdFor + release + back) / cycle;

  const looping = loop && !reduceMotion;
  const ease = "easeInOut" as const;
  const repeatAll = { duration: cycle, repeat: Infinity, ease, delay };

  const rectAnimate = looping
    ? { width: [0, w, w, w, 0], height: [0, h, h, h, 0], opacity: [1, 1, 1, 0, 0] }
    : { width: w, height: h };
  const rectTransition = reduceMotion
    ? { duration: 0 }
    : looping
      ? { ...repeatAll, times: [0, tDrawn, tHold, tReleased, 1] }
      : { duration, ease, delay };

  const pointerAnimate = looping
    ? { x: [0, end.x, end.x, end.x, 0, 0], y: [0, end.y, end.y, end.y, 0, 0], opacity: 1 }
    : { ...end, opacity: 1 };
  const pointerTransition = reduceMotion
    ? { duration: 0 }
    : looping
      ? { ...repeatAll, times: [0, tDrawn, tHold, tReleased, tBack, 1], opacity: { duration: 0.15, delay } }
      : { duration, ease, delay, opacity: { duration: 0.15, delay } };

  return (
    <span
      ref={containerRef}
      className={cn("ph-container", containerClassName)}
      style={color ? ({ "--ph-color": color } as React.CSSProperties) : undefined}
    >
      <span className="ph-content">{children}</span>
      {ready && (
        <span className="ph-layer" aria-hidden="true">
          <motion.span
            className={cn("ph-rect", rectangleClassName)}
            style={rectangleStyle}
            initial={{ width: 0, height: 0 }}
            animate={active ? rectAnimate : undefined}
            transition={rectTransition}
          />
          <motion.span
            className="ph-pointer"
            style={{ rotate: -90 }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={active ? pointerAnimate : undefined}
            transition={pointerTransition}
          >
            <Pointer className={cn("ph-pointer-icon", pointerClassName)} style={pointerStyle} />
          </motion.span>
        </span>
      )}
    </span>
  );
}

const Pointer = ({ ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
    </svg>
  );
};
