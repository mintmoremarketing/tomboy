import { Fragment } from "react";

// Makes long Shopify descriptions easier to skim: splits them into short paragraphs and
// highlights the selling points: whole feature phrases ("mid-rise fit", "breathable cotton
// blend", "fabric-covered waistband"), not single generic words like "fit" or "everyday".

const FEATURE_PATTERNS: RegExp[] = [
  // fabric, with its quality words: "breathable cotton blend", "100% super combed cotton"
  /\b(?:\d+%\s*)?(?:(?:super|ultra|extra|premium|pure|organic|breathable|lightweight|soft|stretchy?|combed|long-staple)[\s-]+){1,3}(?:cotton|modal|fabric|jersey|knit|fleece)(?:[\s-]+(?:blend|stretch))?\b/i,
  // rise and fit: "mid-rise fit", "athletic fit", "relaxed fit"
  /\b(?:low|mid|high)[\s-]rise(?:\s+fit)?\b/i,
  /\b(?:athletic|relaxed|regular|slim|snug|secure|flattering|tapered|contoured|ergonomic|comfort)\s+fit\b/i,
  // waistbands, cuffs, seams
  /\b(?:[a-z]+-)?covered\s+waistband\b/i,
  /\b(?:elastic|soft|anti-pinch|non-pinch|ribbed|wide|brushed|comfort|signature|branded)\s+waistband\b/i,
  /\b(?:ribbed|elastic)\s+(?:ankle\s+)?cuffs?\b/i,
  /\bflat-?lock\s+seams\b/i,
  // coverage and length
  /\b(?:full|moderate|medium)\s+(?:rear\s+)?coverage\b/i,
  /\bmid-length\b/i,
  // finish and colour
  /\b(?:vibrant|rich|fade-resistant|colou?r-?fast)\s+colou?r(?:\s+finish)?\b/i,
  // stand-alone performance and comfort features
  /\b(?:moisture-wicking|quick-dry(?:ing)?|anti-odou?r|anti-bacterial|chafe-free|tag-?free|tagless|seamless|pre-shrunk|hypoallergenic|no-fuss|itch-free|4-way stretch)\b/i,
  /\ball[\s-]day\s+comfort\b/i,
  /\bpremium\b/i,
  // percentages ("100%")
  /\b\d+(?:\.\d+)?\s?%/,
];

const COMBINED = new RegExp(FEATURE_PATTERNS.map((r) => `(?:${r.source})`).join("|"), "gi");
const MAX_PER_PARAGRAPH = 4;

function paragraphs(text: string) {
  const sentences = text
    .replace(/([.!?])(?=[A-Z])/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim()
    .match(/[^.!?]+[.!?]+["”’)]?|[^.!?]+$/g) ?? [text];
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) out.push(sentences.slice(i, i + 2).join(" ").trim());
  return out;
}

export function HighlightedDescription({ text }: { text: string; extraTerms?: string[] }) {
  // each phrase is highlighted once, at most 4 per paragraph, so highlights stay meaningful
  const seen = new Set<string>();
  let count = 0;

  return (
    <div className="pdp-description__text">
      {paragraphs(text).map((para, p) => {
        const pieces: React.ReactNode[] = [];
        let last = 0;
        let inParagraph = 0;
        for (const match of para.matchAll(COMBINED)) {
          const phrase = match[0];
          const key = phrase.toLowerCase().replace(/[\s-]+/g, " ");
          if (seen.has(key) || inParagraph >= MAX_PER_PARAGRAPH) continue;
          // Capitalised mid-sentence ("our Soft Cotton-Stretch Bikini") is the product's name, not a feature
          const before = para.slice(0, match.index).trimEnd();
          if (/^[A-Z]/.test(phrase) && before && !/[.!?:]$/.test(before)) continue;
          seen.add(key);
          inParagraph++;
          pieces.push(<Fragment key={`t${match.index}`}>{para.slice(last, match.index)}</Fragment>);
          // rotate three brand colours so highlights don't all look the same
          pieces.push(
            <mark key={`m${match.index}`} className={`pdp-hl pdp-hl--${count++ % 3}`}>
              {phrase}
            </mark>,
          );
          last = (match.index ?? 0) + phrase.length;
        }
        pieces.push(<Fragment key="end">{para.slice(last)}</Fragment>);
        return <p key={p}>{pieces}</p>;
      })}
    </div>
  );
}
