// Size charts shown from the product page's "Size chart" link.
//
// ⚠️ PLACEHOLDER MEASUREMENTS (adult charts): these are standard Indian sizing ranges, not
// Tomboy's own pattern measurements; the kids charts are the catalogue's real numbers. Replace them with the brand's real numbers before launch (or add a
// size chart to the product in Shopify: custom.size_chart, which the site shows instead).
//
// All body measurements in inches; the chart shows centimetres alongside.

export type SizeChart = {
  title: string;
  /** what each column measures, e.g. "Chest", "Waist" */
  columns: string[];
  /** size label -> one [min, max] inch range per column, an exact catalogue measurement
   *  ({ in, cm }), or a plain string (e.g. height in cm) */
  rows: Record<string, ([number, number] | { in: number; cm: number } | string)[]>;
  howToMeasure: string[];
};

const CHEST = "Wrap the tape around the fullest part of your chest, under the arms, keeping it level.";
const WAIST = "Measure around your natural waist, where you'd normally wear your waistband. Keep the tape snug, not tight.";
const HIP = "Stand with feet together and measure around the fullest part of your hips.";

export const SIZE_CHARTS: Record<string, SizeChart> = {
  mensTops: {
    title: "Men's T-shirts & tank tops",
    columns: ["Chest"],
    rows: {
      XS: [[34, 36]],
      S: [[36, 38]],
      M: [[38, 40]],
      L: [[40, 42]],
      XL: [[42, 44]],
      XXL: [[44, 46]],
      "3XL": [[46, 48]],
    },
    howToMeasure: [CHEST, "Between two sizes? Pick the larger one for a relaxed fit."],
  },
  mensInnerwear: {
    title: "Men's innerwear (briefs, trunks, boxers, vests)",
    columns: ["Waist", "Chest (vests)"],
    rows: {
      S: [[28, 30], [34, 36]],
      M: [[30, 32], [36, 38]],
      L: [[32, 34], [38, 40]],
      XL: [[34, 36], [40, 42]],
      XXL: [[36, 38], [42, 44]],
      "3XL": [[38, 40], [44, 46]],
      "4XL": [[40, 42], [46, 48]],
    },
    howToMeasure: [WAIST, CHEST + " (for vests)"],
  },
  mensBottoms: {
    title: "Men's shorts, track pants & joggers",
    columns: ["Waist", "Hip"],
    rows: {
      S: [[28, 30], [36, 38]],
      M: [[30, 32], [38, 40]],
      L: [[32, 34], [40, 42]],
      XL: [[34, 36], [42, 44]],
      XXL: [[36, 38], [44, 46]],
      "3XL": [[38, 40], [46, 48]],
    },
    howToMeasure: [WAIST, HIP],
  },
  womensBottoms: {
    title: "Women's panties",
    columns: ["Waist", "Hip"],
    rows: {
      S: [[26, 28], [34, 36]],
      M: [[28, 30], [36, 38]],
      L: [[30, 32], [38, 40]],
      XL: [[32, 34], [40, 42]],
      XXL: [[34, 36], [42, 44]],
    },
    howToMeasure: [WAIST, HIP],
  },
  bra: {
    title: "Women's bras",
    columns: ["Under-bust", "Bust"],
    rows: {
      S: [[28, 30], [32, 34]],
      M: [[30, 32], [34, 36]],
      L: [[32, 34], [36, 38]],
      XL: [[34, 36], [38, 40]],
      XXL: [[36, 38], [40, 42]],
    },
    howToMeasure: [
      "Under-bust: measure snugly around your ribcage, right under the bust.",
      "Bust: measure loosely around the fullest part of your bust.",
    ],
  },
  // Kids charts: Tomboy Junior's own measurements, from the Boys Innerwear and Boys Shorts &
  // Pants catalogues (March 2025). Catalogue sizes 2-14 are ages 1-2 to 13-14 years.
  kids: {
    title: "Kids innerwear (briefs & boxers)",
    columns: ["Waist"],
    rows: {
      "1-2 years": [{ in: 20, cm: 50 }],
      "3-4 years": [{ in: 22, cm: 55 }],
      "5-6 years": [{ in: 24, cm: 60 }],
      "7-8 years": [{ in: 26, cm: 65 }],
      "9-10 years": [{ in: 28, cm: 70 }],
      "11-12 years": [{ in: 30, cm: 75 }],
      "13-14 years": [{ in: 32, cm: 80 }],
    },
    howToMeasure: [
      "Waist: measure around your child's natural waist, where the waistband sits. Keep the tape snug, not tight.",
      "Kids grow fast. If they're between sizes, go one size up.",
    ],
  },
  kidsVests: {
    title: "Kids vests",
    columns: ["Chest"],
    rows: {
      "1-2 years": [{ in: 20, cm: 50 }],
      "3-4 years": [{ in: 22, cm: 55 }],
      "5-6 years": [{ in: 24, cm: 60 }],
      "7-8 years": [{ in: 26, cm: 65 }],
      "9-10 years": [{ in: 28, cm: 70 }],
      "11-12 years": [{ in: 30, cm: 75 }],
      "13-14 years": [{ in: 32, cm: 80 }],
    },
    howToMeasure: [
      "Chest: wrap the tape around the fullest part of the chest, under the arms, keeping it level.",
      "Kids grow fast. If they're between sizes, go one size up.",
    ],
  },
  kidsBottoms: {
    title: "Kids shorts & pants",
    columns: ["Waist"],
    rows: {
      "1-2 years": [{ in: 22, cm: 55 }],
      "3-4 years": [{ in: 24, cm: 60 }],
      "5-6 years": [{ in: 26, cm: 65 }],
      "7-8 years": [{ in: 28, cm: 70 }],
      "9-10 years": [{ in: 30, cm: 75 }],
      "11-12 years": [{ in: 32, cm: 80 }],
      "13-14 years": [{ in: 34, cm: 85 }],
    },
    howToMeasure: [
      "Waist: measure around your child's natural waist, where the waistband sits. Keep the tape snug, not tight.",
      "Kids grow fast. If they're between sizes, go one size up.",
    ],
  },
  kidsSocks: {
    title: "Kids socks (by age)",
    columns: ["Age"],
    rows: {
      "3-4 years": ["3–4 years"],
      "5-6 years": ["5–6 years"],
      "7-8 years": ["7–8 years"],
      "9-10 years": ["9–10 years"],
      "11-12 years": ["11–12 years"],
    },
    howToMeasure: ["Pick your child's age. If they have big feet for their age, go one size up."],
  },
  socks: {
    title: "Socks",
    columns: ["UK shoe size"],
    rows: {
      "Free Size": ["6–10"],
      S: ["3–5"],
      M: ["6–8"],
      L: ["9–11"],
    },
    howToMeasure: ["Pick the size that matches your usual shoe size."],
  },
};

// Which chart fits a product, from its title and Shopify product type
export function chartFor(title: string, productType?: string | null): SizeChart | null {
  const t = `${title} ${productType ?? ""}`.toLowerCase();
  if (/\b(kids?|boys?|girls?)\b|boy[’']s|girl[’']s/.test(t)) {
    if (/\bsocks?\b/.test(t)) return SIZE_CHARTS.kidsSocks;
    if (/\bvests?\b/.test(t)) return SIZE_CHARTS.kidsVests;
    if (/\b(shorts?|pants?|joggers?|track|pyjamas?|lounge)\b/.test(t)) return SIZE_CHARTS.kidsBottoms;
    return SIZE_CHARTS.kids;
  }
  if (/\bsocks?\b/.test(t)) return SIZE_CHARTS.socks;
  if (/\bbras?\b/.test(t)) return SIZE_CHARTS.bra;
  if (/\b(panty|panties|bikini|hipster)\b/.test(t)) return SIZE_CHARTS.womensBottoms;
  if (/\b(brief|briefs|boxer|boxers|trunk|trunks|vest|vests|innerwear)\b/.test(t)) return SIZE_CHARTS.mensInnerwear;
  if (/\b(t-?shirt|tee|tank)\b/.test(t)) return SIZE_CHARTS.mensTops;
  if (/\b(shorts?|pants?|joggers?|track|pyjamas?|lounge)\b/.test(t)) return SIZE_CHARTS.mensBottoms;
  return null;
}

// "1-2 years" vs "1–2 Years": compare sizes loosely
export const sizeKey = (s: string) => s.toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
