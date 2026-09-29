"use client";

import { useEffect, useState, type RefObject } from "react";

// Dots under a horizontal swipe row (phones only): shows which card is centred, tap to jump.
export function SwipeDots({ rowRef, count }: { rowRef: RefObject<HTMLElement | null>; count: number }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const onScroll = () => {
      const box = row.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      let best = 0;
      let bestDist = Infinity;
      Array.from(row.children).forEach((child, i) => {
        const r = child.getBoundingClientRect();
        const dist = Math.abs(r.left + r.width / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive(best);
    };
    row.addEventListener("scroll", onScroll, { passive: true });
    return () => row.removeEventListener("scroll", onScroll);
  }, [rowRef]);

  const goTo = (i: number) => {
    const row = rowRef.current;
    const el = row?.children[i] as HTMLElement | undefined;
    if (!row || !el) return;
    // measure on screen: the cards' offsetParent isn't the row
    const box = row.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    row.scrollBy({ left: r.left + r.width / 2 - (box.left + box.width / 2), behavior: "smooth" });
  };

  return (
    <div className="swipe-dots" role="tablist" aria-label="Cards">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`Card ${i + 1} of ${count}`}
          className={`swipe-dots__dot${i === active ? " is-active" : ""}`}
          onClick={() => goTo(i)}
        />
      ))}
    </div>
  );
}
