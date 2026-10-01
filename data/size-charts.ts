// Size charts shown from the product page's "Size chart" link.
//
// ⚠️ PLACEHOLDER MEASUREMENTS: these are standard Indian sizing ranges, not Tomboy's own
// pattern measurements. Replace them with the brand's real numbers before launch (or add a
// size chart to the product in Shopify: custom.size_chart, which the site shows instead).
//
// All body measurements in inches; the chart shows centimetres alongside.

export type SizeChart = {
  title: string;
  /** what each column measures, e.g. "Chest", "Waist" */
  columns: string[];
  /** size label -> one [min, max] inch range per column (or a plain string, e.g. height in cm) */
  rows: Record<string, ([number, number] | string)[]>;
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
  kids: {
    title: "Kids (by age)",
    columns: ["Height (cm)", "Waist"],
    rows: {
      "1-2 years": ["80–92", [19, 20]],
      "3-4 years": ["92–104", [20, 21]],
      "5-6 years": ["104–116", [21, 22]],
      "7-8 years": ["116–128", [22, 23]],
      "9-10 years": ["128–140", [23, 24]],
      "11-12 years": ["140–152", [24, 26]],
      "13-14 years": ["152–164", [26, 28]],
    },
    howToMeasure: [
      "Height: measure standing straight against a wall, without shoes.",
      "Kids grow fast. If they're between sizes, go one size up.",
    ],
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
  if (/\b(kids?|boys?|girls?)\b|boy[’']s|girl[’']s/.test(t)) return SIZE_CHARTS.kids;
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
