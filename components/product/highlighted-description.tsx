import { Fragment } from "react";

// Makes long Shopify descriptions easier to skim: splits them into short paragraphs
// and highlights the words shoppers look for (fabric, fit, features, colour, numbers).

const KEY_PHRASES = [
  // fabric
  "super combed cotton", "combed cotton", "pure cotton", "organic cotton", "cotton", "modal", "spandex", "elastane",
  "lycra", "polyester", "synthetic blend", "blend", "micro-knit", "jersey", "fleece", "ribbed", "rib-knit",
  "french terry", "terry", "knit", "fabric",
  // feel & performance
  "moisture-wicking", "breathable", "breathability", "lightweight", "quick-dry", "stretch", "stretchy", "soft",
  "super soft", "ultra-soft", "anti-odour", "anti-odor", "anti-pinch", "chafe-free", "tag-free", "tagless",
  "non-pinch", "pre-shrunk", "durable", "durability", "hypoallergenic", "comfort", "comfortable", "cooling",
  "odour-free", "itch-free", "gentle", "long-lasting", "colourfast", "fade-resistant", "wrinkle-free",
  "premium", "high-quality", "bold color", "bold colour", "grip", "gripper",
  // fit & build
  "mid-length", "regular fit", "slim fit", "relaxed fit", "elastic waistband", "waistband", "drawstring",
  "pockets", "pocket", "seamless", "flatlock seams", "athletic fit", "ankle cuff", "cuffs", "cuff",
  "silhouette", "tapered", "full-length", "coverage", "mobility", "fit",
  // use
  "all-day", "everyday", "high-intensity", "high-energy", "gym", "running", "training", "lounging", "sleep",
  "school", "sports", "play", "workout", "yoga", "travel", "casual", "weekend", "summer", "winter",
];

function paragraphs(text: string) {
  const sentences = text.replace(/([.!?])(?=[A-Z])/g, "$1 ").replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+["”’)]?|[^.!?]+$/g) ?? [text];
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) out.push(sentences.slice(i, i + 2).join(" ").trim());
  return out;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function HighlightedDescription({ text, extraTerms = [] }: { text: string; extraTerms?: string[] }) {
  // longest first so "super combed cotton" wins over "cotton"; colour names etc. come from the product
  const terms = [...new Set([...extraTerms.filter((t) => t && t.length > 2 && t !== "Default Title"), ...KEY_PHRASES])]
    .sort((a, b) => b.length - a.length)
    .map(escape);
  const pattern = new RegExp(`(\\d+(?:\\.\\d+)?\\s?%|\\b(?:${terms.join("|")})\\b)`, "gi");

  // each word is highlighted once, and at most 4 per paragraph, so highlights stay meaningful
  const seen = new Set<string>();
  let count = 0;
  return (
    <div className="pdp-description__text">
      {paragraphs(text).map((para, p) => {
        let inParagraph = 0;
        return (
        <p key={p}>
          {para.split(pattern).map((part, i) => {
            if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
            const key = part.toLowerCase();
            if (seen.has(key) || inParagraph >= 4) return <Fragment key={i}>{part}</Fragment>;
            seen.add(key);
            inParagraph++;
            // rotate three brand colours so highlights don't all look the same
            return (
              <mark key={i} className={`pdp-hl pdp-hl--${count++ % 3}`}>
                {part}
              </mark>
            );
          })}
        </p>
        );
      })}
    </div>
  );
}
