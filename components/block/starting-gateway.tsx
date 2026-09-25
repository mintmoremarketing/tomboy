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
  image: string;
}[] = [
  // circle + tint colours are sampled to sit with each illustration's muted palette
  { id: "women", label: "Women", tagline: "Insanely soft", accent: "#EDB6AA", tint: "#FBF1EE", image: "/gateway/women.webp" },
  { id: "men", label: "Men", tagline: "Zero nonsense", accent: "#F3DB93", tint: "#FBF6E7", image: "/gateway/men.webp" },
  { id: "kids", label: "Kids", tagline: "Play hard", accent: "#BCD5EC", tint: "#EEF4FA", image: "/gateway/kids.webp" },
];

const spring = { type: "spring", stiffness: 240, damping: 22 } as const;

// Full-screen "pick your fit" welcome screen. Shown on the homepage for
// first-time visitors, and always at /welcome.
// Right side is a character-select lineup: three poster cards whose
// characters pop up on load. Hovering/focusing a card widens it and lifts
// its character; the other two characters sink out of view.
export function StartingGateway({
  isOpen,
  onSelectAudience,
}: {
  isOpen: boolean;
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
      <div className="gateway-screen gw-full">
        <header className="gw-full__bar">
          <img src="/logo.webp" alt="Tomboy India" className="gateway-logo" />
        </header>

        <div className="gw-full__grid">
          <div className="welcome-copy gw-full__copy">
            <p className="eyebrow">Tomboy India</p>
            <StretchHeadline text={"TOO SOFT\nTO TAKE OFF."} mood="settle" accent="#FFE500" />
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
              {lineups.map(({ id, label, tagline, accent, tint, image }, i) => {
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
                      initial={{ y: "100%" }}
                      animate={
                        isLeaving
                          ? { opacity: 0, scale: 0.94 }
                          : {
                              y: isDimmed ? "62%" : isActive ? "-5%" : "0%",
                              opacity: isDimmed ? 0.35 : 1,
                              scale: 1,
                            }
                      }
                      transition={
                        isLeaving
                          ? { duration: 0.35, ease: "easeOut" }
                          : { ...spring, delay: interacted ? 0 : 0.2 + i * 0.08 }
                      }
                    >
                      <img src={image} alt="" draggable={false} />
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
