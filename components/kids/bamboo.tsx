"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

// The kids' bamboo story (Kids lineup only):
//   BambooSeal — rotating "India's first · 100% bamboo" sticker in the hero
//   BambooBand — wavy green section with the headline, benefits and a shop link
//   BambooPill — small tag on bamboo product cards / product pages (see lib/bamboo.ts)
// Claim wording comes from the client brief; benefits are kept general until the team
// confirms what they can substantiate.

const SEAL_TEXT = "INDIA'S FIRST • 100% BAMBOO • KIDS' INNERWEAR • ";

function Leaf({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M6 34C6 18 18 6 34 6c0 16-12 28-28 28Z" fill="currentColor" />
      <path d="M8 32 30 10" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}


export function BambooSeal() {
  return (
    <div className="bamboo-seal" role="img" aria-label="India's first 100% bamboo kids' innerwear">
      <svg className="bamboo-seal__ring" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <path id="bamboo-seal-circle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <text>
          <textPath href="#bamboo-seal-circle" startOffset="0" textLength="458" lengthAdjust="spacingAndGlyphs">
            {SEAL_TEXT}
          </textPath>
        </text>
      </svg>
      <span className="bamboo-seal__core" aria-hidden="true">
        <Leaf className="bamboo-seal__leaf" />
        <strong>100%</strong>
        <span>BAMBOO</span>
      </span>
    </div>
  );
}

const PERKS = [
  { label: "Super soft", note: "Silky-smooth on little bodies" },
  { label: "Breathes easy", note: "Light and airy for play days" },
  { label: "Kind to young skin", note: "Gentle, no itchy feel" },
  { label: "Stays fresh", note: "Comfortable from school to sleep" },
];

export function BambooBand() {
  return (
    <section className="bamboo-band v2-wave" aria-labelledby="bamboo-title">
      {/* hand-drawn bamboo pattern (Summer Bamboo asset), drawn by CSS: .bamboo-band::before */}

      <div className="bamboo-band__inner">
        <p className="bamboo-band__eyebrow">🎋 India&apos;s first</p>
        <h2 id="bamboo-title">
          100% bamboo
          <br />
          kids&apos; innerwear.
        </h2>
        <p className="bamboo-band__lead">
          Made from bamboo fabric, start to finish. The softest thing we make, for the ones who never sit still.
        </p>

        <ul className="bamboo-band__perks">
          {PERKS.map((p, i) => (
            <li key={p.label} style={{ "--tilt": `${[-3, 2, -1.5, 3][i]}deg` } as React.CSSProperties}>
              <strong>{p.label}</strong>
              <span>{p.note}</span>
            </li>
          ))}
        </ul>

        <Link className="bamboo-band__cta" href="/collections/kids">
          Shop kids' innerwear <ArrowRight size={18} aria-hidden />
        </Link>
      </div>
    </section>
  );
}

export function BambooPill({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <span className={`bamboo-pill bamboo-pill--${size}`}>
      <span aria-hidden="true">🎋</span> 100% Bamboo
    </span>
  );
}
