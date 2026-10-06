"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import "./text-fill-animation.css";

interface CharProps {
  char: string;
  range: [number, number];
  progress: any;
  dimColor?: string;
  primaryColor?: string;
  textColor?: string;
}

function Char({
  char,
  range,
  progress,
  dimColor = "rgba(10, 10, 10, 0.16)",
  primaryColor = "#FF3344",
  textColor = "#0A0A0A",
}: CharProps) {
  const [start, end] = range;
  const mid = start + (end - start) * 0.4;

  const color = useTransform(
    progress,
    [start, mid, end],
    [dimColor, primaryColor, textColor]
  );

  return (
    <motion.span
      style={{ color }}
      className="inline-block transition-colors duration-150"
    >
      {char}
    </motion.span>
  );
}

export function TextFillAnimation({
  text,
  className,
  dimColor = "rgba(10, 10, 10, 0.18)",
  primaryColor = "#FF3344",
  textColor = "#0A0A0A",
}: {
  text: string;
  className?: string;
  dimColor?: string;
  primaryColor?: string;
  textColor?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.35"],
  });

  const words = text.split(" ");
  let totalChars = 0;
  for (const w of words) {
    totalChars += w.length;
  }

  let currentCharIndex = 0;

  return (
    <div
      ref={containerRef}
      className={cn("obsidian-text-fill", className)}
    >
      <div className="tfa-heading">
        {words.map((word, wordIndex) => (
          <span
            key={wordIndex}
            className="tfa-word"
            style={{
              display: "inline-flex",
              whiteSpace: "nowrap",
              marginRight: "0.36em",
            }}
          >
            {word.split("").map((char, charIndex) => {
              const start = currentCharIndex / totalChars;
              const end = (currentCharIndex + 1) / totalChars;
              currentCharIndex++;

              return (
                <Char
                  key={charIndex}
                  char={char}
                  range={[start, end]}
                  progress={scrollYProgress}
                  dimColor={dimColor}
                  primaryColor={primaryColor}
                  textColor={textColor}
                />
              );
            })}
          </span>
        ))}
      </div>
    </div>
  );
}

type StoryAudience = "men" | "women" | "kids";

const STORY: Record<StoryAudience, { kicker: string; text: string; perks: [string, string, string]; cta: string; fallback: string }> = {
  men: {
    kicker: "The Tomboy Standard",
    text: "We stripped away itchy tags, tight restrictive bands, and stiff seams. Every single piece is crafted with 100% super combed cotton that moves naturally with your body — breathable, chafe-free, and effortlessly soft from sunrise to midnight.",
    perks: ["Anti-Pinch Ergonomic Waistband", "2X Breathability Micro-Knit", "Pre-Shrunk Long-Staple Fibers"],
    cta: "Explore Men's Collection",
    fallback: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
  },
  women: {
    kicker: "Made For Her",
    text: "No digging elastic, no scratchy lace, no seams that show through. Every piece is cut from 100% super combed cotton that stays soft on your skin and shapes to you — lightweight, breathable, and comfortable from your first meeting to your last stretch of the day.",
    perks: ["Soft-Touch Covered Waistband", "Seam-Smooth Everyday Fit", "Skin-Friendly Breathable Cotton"],
    cta: "Explore Women's Collection",
    fallback: "/gateway/women.webp",
  },
  kids: {
    kicker: "Made For Little Ones",
    text: "Kids climb, run, tumble and nap in the same clothes, so we made them gentle. Tag-free, with soft waistbands that never pinch, and 100% super combed cotton that's kind to sensitive skin — built to survive the playground and a hundred washes after it.",
    perks: ["Tag-Free, Zero-Itch Comfort", "Non-Pinch Soft Waistband", "Gentle On Sensitive Skin"],
    cta: "Explore Kids' Collection",
    fallback: "/gateway/kids.webp",
  },
};

const firstPhoto = (data: Record<string, string | null> | undefined) =>
  data ? ((Object.values(data).find((v) => typeof v === "string") as string | undefined) ?? null) : undefined;

export function CraftStorySection({
  audience = "men",
  initialPhotos = {},
}: {
  audience?: StoryAudience;
  /** Shop Essentials photos per audience, already fetched by the homepage on the server */
  initialPhotos?: Partial<Record<StoryAudience, Record<string, string | null>>>;
}) {
  const story = STORY[audience];
  // a real product photo for this audience (first one from the essentials collections)
  const [photos, setPhotos] = useState<Partial<Record<StoryAudience, string | null>>>(() => {
    const seeded: Partial<Record<StoryAudience, string | null>> = {};
    for (const [a, data] of Object.entries(initialPhotos)) seeded[a as StoryAudience] = firstPhoto(data) ?? null;
    return seeded;
  });
  useEffect(() => {
    if (audience in photos) return;
    fetch(`/api/essentials?audience=${audience}`)
      .then((res) => res.json())
      .then((data) => {
        setPhotos((prev) => ({ ...prev, [audience]: data && !data.error ? firstPhoto(data) ?? null : null }));
      })
      .catch(() => setPhotos((prev) => ({ ...prev, [audience]: null })));
  }, [audience, photos]);
  // men keep the original portrait; women and kids use their product photo at a larger size
  const photo = audience === "men" ? null : photos[audience]?.replace(/width=\d+/, "width=900");
  const image = photo || story.fallback;

  return (
    <section className="scroll-story-section">
      <div className="scroll-story-container">
        {/* Left Side: Visual Image Card */}
        <div className="scroll-story-visual">
          <div className="scroll-story-image-card">
            <img
              key={image}
              src={image}
              alt="Tomboy super combed cotton craftsmanship"
              className="scroll-story-img"
            />
            <div className="scroll-story-badge-bottom">
              <span>🇮🇳 100% Super Combed Pure Cotton</span>
            </div>
          </div>
        </div>

        {/* Right Side: Scroll Text Fill */}
        <div className="scroll-story-copy">
          <div className="scroll-story-kicker">
            <span className="kicker-pill">{story.kicker}</span>
            <small>Scroll to reveal ↓</small>
          </div>

          <TextFillAnimation
            key={audience}
            text={story.text}
            dimColor="rgba(10, 10, 10, 0.18)"
            primaryColor="#FF3344"
            textColor="#0A0A0A"
          />

          <div className="scroll-story-perks">
            {story.perks.map((perk, i) => (
              <div className="story-perk" key={perk}>
                <CheckCircle2 size={18} className={["text-[#00F5D4]", "text-[#FFE500]", "text-[#52F264]"][i]} />
                <span>{perk}</span>
              </div>
            ))}
          </div>

          <div className="scroll-story-action">
            <Link
              href={`/collections/${audience}`}
              className="button button--dark button--pop"
            >
              {story.cta} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CraftStorySection;
