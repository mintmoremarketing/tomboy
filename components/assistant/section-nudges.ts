"use client";

import { useEffect } from "react";
import { nudge, type Nudge } from "@/components/assistant/nudges";

// Scout speaks up the moment a section reaches the middle of the screen (works for sections
// taller than the screen too). Checks positions on scroll rather than using an
// IntersectionObserver, which some embedded and background browsers pause.
export function useSectionNudges(sections: { selector: string; nudge: Nudge }[], deps: unknown[] = []) {
  useEffect(() => {
    const pending = sections.map((s) => ({ ...s, done: false }));
    let frame = 0;

    const check = () => {
      frame = 0;
      const mid = window.innerHeight / 2;
      for (const s of pending) {
        if (s.done) continue;
        const el = document.querySelector(s.selector);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top < mid && r.bottom > mid) {
          s.done = true;
          nudge(s.nudge);
        }
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };
    // rAF can be paused too; a plain timeout fallback keeps it working
    const onScrollSafe = () => {
      onScroll();
      window.setTimeout(check, 120);
    };

    window.addEventListener("scroll", onScrollSafe, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollSafe);
      if (frame) window.cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
