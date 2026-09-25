"use client";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react";

// Hero headline that moves like fabric. One mechanic (stretch → release),
// three personalities:
//   snap   — Men:   words pulled wide, snap back with one small wobble
//   settle — Women: letters stretch, then float back and settle (no snap)
//   bounce — Kids:  line 1 bounces up like a trampoline, line 2 snuggles in
// Every letter squishes on hover/tap. Switching audience stretches the old
// headline sideways and pulls it away before the next one enters.
export type HeadlineMood = "snap" | "settle" | "bounce";

const springs = {
  snap: { type: "spring", stiffness: 520, damping: 18, mass: 0.9 },
  settle: { type: "spring", stiffness: 110, damping: 20 },
  bounce: { type: "spring", stiffness: 600, damping: 12 },
  cozy: { type: "spring", stiffness: 90, damping: 16 },
} satisfies Record<string, Transition>;

const squishSpring: Record<HeadlineMood, Transition> = {
  snap: { type: "spring", stiffness: 600, damping: 15 },
  settle: { type: "spring", stiffness: 200, damping: 20 },
  bounce: { type: "spring", stiffness: 700, damping: 9 },
};

type Entrance = {
  initial: Record<string, number>;
  animate: Record<string, number>;
  transition: Transition;
};

function withDelay(spring: Transition, delay: number, fade = 0.2): Transition {
  return { ...spring, delay, opacity: { duration: fade, delay } };
}

function letterEntrance(mood: HeadlineMood, line: number, i: number, count: number): Entrance {
  if (mood === "settle") {
    return {
      initial: { opacity: 0, scaleX: 1.4, y: 10 },
      animate: { opacity: 1, scaleX: 1, y: 0 },
      transition: withDelay(springs.settle, i * 0.035, 0.4),
    };
  }
  if (line === 0) {
    // PLAY HARD. — stretch upward and bounce
    return {
      initial: { opacity: 0, y: 36, scaleY: 1.6, scaleX: 0.75 },
      animate: { opacity: 1, y: 0, scaleY: 1, scaleX: 1 },
      transition: withDelay(springs.bounce, i * 0.04, 0.12),
    };
  }
  // STAY COZY. — letters start spread apart and cuddle together
  return {
    initial: { opacity: 0, x: (i - (count - 1) / 2) * 14 },
    animate: { opacity: 1, x: 0 },
    transition: withDelay(springs.cozy, 0.45 + i * 0.015, 0.5),
  };
}

function Letter({ char, mood }: { char: string; mood: HeadlineMood }) {
  return (
    <motion.span
      className="sh-letter"
      whileHover={{ scaleX: 1.18, scaleY: 0.78 }}
      whileTap={{ scaleX: 1.18, scaleY: 0.78 }}
      transition={squishSpring[mood]}
    >
      {char}
    </motion.span>
  );
}

export function StretchHeadline({
  text,
  mood,
  accent,
  className,
}: {
  text: string;
  mood: HeadlineMood;
  accent: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const lines = text.split("\n");
  let wordIndex = 0;

  const bandDelay = mood === "snap" ? 0.25 : mood === "settle" ? 0.4 : 0.7;
  const bandSpring = mood === "bounce" ? springs.bounce : springs[mood];

  return (
    <h1 className={className ? `stretch-headline ${className}` : "stretch-headline"}>
      <span className="sh-sr">{lines.join(" ")}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={text}
          className="sh-block"
          aria-hidden="true"
          exit={reduceMotion ? undefined : { opacity: 0, scaleX: 1.3, x: 30 }}
          transition={{ duration: 0.22, ease: "easeIn" }}
        >
          {lines.map((line, lineIndex) => {
            const words = line.split(" ");
            // letter index counts across the whole line, so staggers flow word to word
            let letterIndex = 0;
            const letterCount = line.replace(/ /g, "").length;

            return (
              <span className="sh-line" key={lineIndex}>
                {words.map((word, w) => {
                  const chars = word.split("");
                  const space = w < words.length - 1 ? " " : null;

                  if (mood === "snap") {
                    const delay = wordIndex++ * 0.12;
                    return (
                      <span key={w}>
                        <motion.span
                          className="sh-word"
                          initial={reduceMotion ? false : { opacity: 0, scaleX: 1.7, scaleY: 0.85 }}
                          animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
                          transition={withDelay(springs.snap, delay, 0.15)}
                        >
                          {chars.map((char, c) => (
                            <Letter key={c} char={char} mood={mood} />
                          ))}
                        </motion.span>
                        {space}
                      </span>
                    );
                  }

                  return (
                    <span key={w}>
                      <span className="sh-word">
                        {chars.map((char, c) => {
                          const entrance = letterEntrance(mood, lineIndex, letterIndex++, letterCount);
                          return (
                            <motion.span
                              key={c}
                              className="sh-unit"
                              initial={reduceMotion ? false : entrance.initial}
                              animate={entrance.animate}
                              transition={entrance.transition}
                            >
                              <Letter char={char} mood={mood} />
                            </motion.span>
                          );
                        })}
                      </span>
                      {space}
                    </span>
                  );
                })}
              </span>
            );
          })}

          {/* elastic band underline in the audience colour */}
          <motion.span
            className="sh-band"
            style={{ background: accent }}
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ ...bandSpring, delay: bandDelay }}
          />
        </motion.span>
      </AnimatePresence>
    </h1>
  );
}
