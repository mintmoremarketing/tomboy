"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { StretchHeadline } from "@/components/block/stretch-headline";

export type Audience = "men" | "women" | "kids";

const lineups: {
  id: Audience;
  label: string;
  tagline: string;
  accent: string;
  tint: string;
  /** cut-out photo, shown on the desktop cards */
  image: string;
  /** full-body illustration, for the overlapping "family" group on phones and tablets */
  art: string;
}[] = [
  // v2: cut-out photos on the brand's sticker colours (the card is the colour, the disc is white)
  { id: "women", label: "Women", tagline: "Insanely soft", accent: "#FFFFFF", tint: "#FF8AD8", image: "/v2/gateway-women.webp", art: "/gateway/women.webp" },
  { id: "men", label: "Men", tagline: "Zero nonsense", accent: "#FFFFFF", tint: "#3DFF52", image: "/v2/gateway-men.webp", art: "/gateway/men.webp" },
  { id: "kids", label: "Kids", tagline: "Play hard", accent: "#FFFFFF", tint: "#FFE500", image: "/v2/gateway-kids.webp", art: "/v2/gateway-kids.webp" },
];

const spring = { type: "spring", stiffness: 240, damping: 22 } as const;

// Full-screen "pick your fit" welcome screen. Shown on the homepage for
// first-time visitors, and always at /welcome.
// Right side is a character-select lineup: three poster cards whose
// characters pop up on load. Hovering/focusing a card widens it and lifts
// its character; the other two characters sink out of view.
export function StartingGateway({
  isOpen,
  pending = false,
  onSelectAudience,
}: {
  isOpen: boolean;
  /** rendered before we know if this is a first visit: CSS shows it only when <html data-first-visit> */
  pending?: boolean;
  onSelectAudience: (val: Audience) => void;
}) {
  const [active, setActive] = useState<Audience | null>(null);
  // the staggered entrance delay only applies to the first pop-up
  const [interacted, setInteracted] = useState(false);

  // set on click/tap: the other two fade away, then we navigate
  const [chosen, setChosen] = useState<Audience | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, []);

  function highlight(id: Audience | null) {
    if (chosen) return;
    setActive(id);
    setInteracted(true);
  }

  function choose(id: Audience) {
    if (chosen) return;
    setChosen(id);
    setInteracted(true);
    leaveTimer.current = setTimeout(() => onSelectAudience(id), 600);
  }

  if (!isOpen) return null;

  return (
    <MotionConfig reducedMotion="user">
      <div className={`gateway-screen gw-full${pending ? " gw-pending" : ""}`}>
        <header className="gw-full__bar">
          <img src="/logo.webp" alt="Tomboy India" className="gateway-logo" />
        </header>

        <div className="gw-full__grid">
          <div className="welcome-copy gw-full__copy">
            <StretchHeadline text={"TOO SOFT\nTO TAKE OFF."} mood="settle" accent="#FFE500" cssEntrance />
            <p>
              100% Super Combed Cotton essentials designed for all-day freedom. Pick your fit to explore:
            </p>
          </div>

          <div className="welcome-visual gw-full__stage">
            <span className="lineup-sticker lineup-sticker--top" aria-hidden="true">
              🍒 Tomboy OG
            </span>
            <span className="lineup-sticker lineup-sticker--bottom" aria-hidden="true">
              🌿 100% Combed Cotton
            </span>

            <div className="lineup" onMouseLeave={() => highlight(null)}>
              {lineups.map(({ id, label, tagline, accent, tint, image, art }, i) => {
                const isChosen = chosen === id;
                const isLeaving = chosen !== null && !isChosen;
                const isActive = chosen ? isChosen : active === id;
                const isDimmed = !chosen && active !== null && !isActive;
                return (
                  <button
                    key={id}
                    className={`lineup-card lineup-card--${id} ${isActive ? "is-active" : ""} ${isDimmed ? "is-dimmed" : ""} ${isLeaving ? "is-leaving" : ""}`}
                    style={{ "--accent": accent, "--tint": tint } as React.CSSProperties}
                    onMouseEnter={() => highlight(id)}
                    onFocus={() => highlight(id)}
                    onBlur={() => highlight(null)}
                    onClick={() => choose(id)}
                    aria-label={`Shop ${label}`}
                  >
                    <span className="lineup-card__top">
                      <span className="lineup-card__num">0{i + 1}</span>
                      <span className="lineup-card__arrow">
                        <ArrowUpRight size={16} strokeWidth={2.5} />
                      </span>
                    </span>
                    <span className="lineup-card__label">{label}</span>
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          className="lineup-card__tagline"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                        >
                          {tagline}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    <span className="lineup-card__spot" aria-hidden="true" />

                    <motion.span
                      className="lineup-card__figure"
                      aria-hidden="true"
                      // entrance is a CSS animation (.gw-full .lineup-card__figure), so the photos
                      // are visible from the first paint; motion only handles hover/choose
                      initial={false}
                      animate={
                        isLeaving
                          ? { opacity: 0, scale: 0.94 }
                          : {
                              // photos are cropped at the legs, so they never lift off the card's
                              // bottom edge: the active one grows from the bottom instead
                              y: isDimmed ? "62%" : "0%",
                              opacity: isDimmed ? 0.35 : 1,
                              scale: isActive ? 1.05 : 1,
                            }
                      }
                      transition={
                        isLeaving
                          ? { duration: 0.35, ease: "easeOut" }
                          : spring
                      }
                    >
                      {/* the browser downloads only the one it shows */}
                      <picture>
                        <source media="(max-width: 860px)" srcSet={art} />
                        <img src={image} alt="" draggable={false} fetchPriority="high" decoding="async" />
                      </picture>
                    </motion.span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
