"use client";

import { useEffect, useRef, useState } from "react";

// Tomboy Family mascots (from the "9 x 10 feet - Tomboy Family" artwork) for the Kids lineup:
// a character standing between two sections. The speech bubble pops in, line by line, the
// first time the character scrolls into view.

/** true once the element has scrolled into view (then stays true) */
export function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return { ref, seen };
}

export type MascotName = "dad-tomboy" | "grandparents" | "betty" | "fido";

// characters who overlap in the artwork are cut out together, so nothing is clipped
const LINES: Record<MascotName, { alt: string; lines: [string, string][] }> = {
  "dad-tomboy": {
    alt: "Tomboy and his dad Adison",
    lines: [
      ["Tomboy", "So comfy I forget I'm even wearing them!"],
      ["Dad", "And no tags to cut out. Win-win."],
    ],
  },
  grandparents: {
    alt: "Grandma, Grandpa and Ginger",
    lines: [
      ["Grandpa", "In my day, undies were never this soft!"],
      ["Ginger", "Label free = no itchy tags. Best. Day. Ever."],
    ],
  },
  betty: { alt: "Betty", lines: [["Betty", "Sizes by age, 1 to 14. No guesswork, promise."]] },
  fido: { alt: "Fido the dog", lines: [["Fido", "Woof! Even I'd wear 100% bamboo."]] },
};

export function Mascot({
  name,
  place = "right",
  phase = 0,
}: {
  name: MascotName;
  place?: "left" | "right";
  /** offsets the sway so neighbours don't move in step */
  phase?: number;
}) {
  const { alt, lines } = LINES[name];
  const { ref, seen } = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className={`mascot mascot--${place} mascot--${name}${seen ? " is-seen" : ""}`} data-phase={phase}>
      <div className="mascot__inner">
        <p className="mascot__bubble">
          {lines.map(([who, text], i) => (
            <span key={who} style={{ "--line": i } as React.CSSProperties}>
              <strong>{who}:</strong> {text}
            </span>
          ))}
        </p>
        <img className="mascot__img" src={`/v2/mascots/${name}.webp`} alt={alt} draggable={false} loading="lazy" />
      </div>
    </div>
  );
}
