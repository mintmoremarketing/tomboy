"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
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

export function CraftStorySection({
  audience = "men",
}: {
  audience?: "men" | "women";
}) {
  return (
    <section className="scroll-story-section">
      <div className="scroll-story-container">
        {/* Left Side: Visual Image Card */}
        <div className="scroll-story-visual">
          <div className="scroll-story-image-card">
            <img
              src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"
              alt="Tomboy super combed cotton craftsmanship"
              className="scroll-story-img"
            />
            <div className="scroll-story-badge-top">
              <Sparkles size={14} className="text-[#00F5D4]" />
              
              <PointerHighlight
                rectangleClassName="bg-cyan-100 border-cyan-300"
                pointerClassName="text-cyan-500 h-3 w-3"
                containerClassName="inline-block"
              >
                <span className="relative z-10 text-cyan-900 font-bold">Zero Synthetic Blends</span>
              </PointerHighlight>

            </div>
            <div className="scroll-story-badge-bottom">
              <span>🇮🇳 100% Super Combed Pure Cotton</span>
            </div>
          </div>
        </div>

        {/* Right Side: Scroll Text Fill */}
        <div className="scroll-story-copy">
          <div className="scroll-story-kicker">
            <span className="kicker-pill">The Tomboy Standard</span>
            <small>Scroll to reveal ↓</small>
          </div>

          <TextFillAnimation
            text="We stripped away itchy tags, tight restrictive bands, and stiff seams. Every single piece is crafted with 100% super combed cotton that moves naturally with your body — breathable, chafe-free, and effortlessly soft from sunrise to midnight."
            dimColor="rgba(10, 10, 10, 0.18)"
            primaryColor="#FF3344"
            textColor="#0A0A0A"
          />

          <div className="scroll-story-perks">
            <div className="story-perk">
              <CheckCircle2 size={18} className="text-[#00F5D4]" />
              <span>Anti-Pinch Ergonomic Waistband</span>
            </div>
            <div className="story-perk">
              <CheckCircle2 size={18} className="text-[#FFE500]" />
              <span>2X Breathability Micro-Knit</span>
            </div>
            <div className="story-perk">
              <CheckCircle2 size={18} className="text-[#52F264]" />
              <span>Pre-Shrunk Long-Staple Fibers</span>
            </div>
          </div>

          <div className="scroll-story-action">
            <Link
              href={`/collections/${audience}`}
              className="button button--dark button--pop"
            >
              Explore {audience === "men" ? "Men's" : "Women's"} Collection{" "}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CraftStorySection;
