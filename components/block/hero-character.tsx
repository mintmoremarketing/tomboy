"use client";

import { AnimatePresence, motion } from "motion/react";

type Audience = "men" | "women" | "kids";

type Callout = {
  text: string;
  /** anchor point on the illustration, as fractions of the image box */
  x: number;
  y: number;
  side: "left" | "right";
};

// Same illustrations + halo colours as the welcome gateway lineup.
// Callouts are spec tags pinned to the garment (phone layout only).
const characters: Record<Audience, { src: string; halo: string; alt: string; callouts: Callout[] }> = {
  women: {
    src: "/gateway/women.webp",
    halo: "#EDB6AA",
    alt: "Illustrated woman in a dark shirt and cream trousers",
    callouts: [
      { text: "Combed cotton", x: 0.31, y: 0.3, side: "left" },
      { text: "No-pinch band", x: 0.34, y: 0.41, side: "right" },
      { text: "Zero chafe", x: 0.3, y: 0.64, side: "left" },
    ],
  },
  men: {
    src: "/gateway/men.webp",
    halo: "#F3DB93",
    alt: "Illustrated man in a blue shirt holding a phone",
    callouts: [
      { text: "Combed cotton", x: 0.63, y: 0.26, side: "right" },
      { text: "No-pinch band", x: 0.45, y: 0.43, side: "left" },
      { text: "Zero chafe", x: 0.4, y: 0.7, side: "right" },
    ],
  },
  kids: {
    src: "/gateway/kids.webp",
    halo: "#BCD5EC",
    alt: "Illustrated kid in a green shirt and cap",
    callouts: [
      { text: "Combed cotton", x: 0.55, y: 0.32, side: "right" },
      { text: "No-pinch band", x: 0.45, y: 0.47, side: "left" },
      { text: "Zero chafe", x: 0.4, y: 0.72, side: "right" },
    ],
  },
};

// direction: 0 = audience changed elsewhere (sink out / pop up),
// ±1 = swiped (slide out the way the finger went, next slides in behind it)
const variants = {
  enter: (dir: number) => (dir ? { x: `${dir * 70}%`, y: "0%", opacity: 0 } : { x: "0%", y: "105%", opacity: 0 }),
  center: { x: "0%", y: "0%", opacity: 1 },
  exit: (dir: number) => (dir ? { x: `${-dir * 70}%`, y: "0%", opacity: 0 } : { x: "0%", y: "105%", opacity: 0 }),
};

// The selected audience's character standing in the hero's sticker area.
export function HeroCharacter({
  audience,
  ready,
  direction = 0,
}: {
  audience: Audience;
  ready: boolean;
  direction?: number;
}) {
  const character = characters[audience];

  return (
    <div className="hero-character" aria-hidden={!ready}>
      <AnimatePresence mode="wait" initial custom={direction}>
        {ready && (
          <motion.div
            key={audience}
            className="hero-character__figure"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
          >
            <span className="hero-character__halo" style={{ background: character.halo }} />
            <span className="hero-character__body">
              <img src={character.src} alt={character.alt} draggable={false} />
              {character.callouts.map((callout, i) => (
                <motion.span
                  key={callout.text}
                  className={`hero-callout hero-callout--${callout.side}`}
                  style={{ "--x": `${callout.x * 100}%`, "--y": `${callout.y * 100}%` } as React.CSSProperties}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 20, delay: 0.55 + i * 0.18 }}
                >
                  <span className="hero-callout__dot" />
                  <span className="hero-callout__line" />
                  <span className="hero-callout__tag">{callout.text}</span>
                </motion.span>
              ))}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
