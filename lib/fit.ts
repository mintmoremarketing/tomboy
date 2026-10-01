// Fit Finder maths: body measurements -> recommended size per product type, using the
// same charts the "Size chart" link shows (data/size-charts.ts).

import { SIZE_CHARTS, type SizeChart } from "@/data/size-charts";
import type { Fit, SizeProfile } from "@/components/assistant/client";

export type FitAudience = "men" | "women" | "kids";

export type Measurements = {
  heightCm?: number;
  weightKg?: number;
  chestIn?: number; // bust for women
  waistIn?: number;
  hipIn?: number;
  underbustIn?: number;
  kidAge?: number; // years
};

export type Recommendation = { key: keyof SizeProfile; label: string; size: string; basis: string };

const inches = (cm: number) => cm / 2.54;
export const toInches = (value: number, unit: "in" | "cm") => (unit === "cm" ? inches(value) : value);

// The chart row for a measurement in one column. Between two rows (or relaxed fit and in the top
// half of a row) goes one size up; below the smallest row gives the smallest size.
function sizeFrom(chart: SizeChart, column: number, value: number, fit: Fit): string | null {
  const rows = Object.entries(chart.rows)
    .map(([size, values]) => ({ size, range: values[column] }))
    .filter((r): r is { size: string; range: [number, number] } => Array.isArray(r.range));
  if (!rows.length || !value) return null;
  for (let i = 0; i < rows.length; i++) {
    const [min, max] = rows[i].range;
    if (value < min) return rows[i].size; // fell in the gap below this row: take it (the larger)
    if (value <= max) {
      const upperHalf = value > (min + max) / 2;
      if (fit === "relaxed" && upperHalf && rows[i + 1]) return rows[i + 1].size;
      return rows[i].size;
    }
  }
  return rows[rows.length - 1].size; // above the chart: largest size
}

// Kids: by age first, else by height
function kidSize(m: Measurements): { size: string; basis: string } | null {
  const rows = Object.keys(SIZE_CHARTS.kids.rows);
  if (m.kidAge) {
    const row = rows.find((r) => {
      const [a, b] = (r.match(/\d+/g) ?? []).map(Number);
      return m.kidAge! >= a && m.kidAge! <= b;
    });
    if (row) return { size: row, basis: `age ${m.kidAge}` };
    if (m.kidAge < 1) return { size: rows[0], basis: `age ${m.kidAge}` };
  }
  if (m.heightCm) {
    for (const [size, values] of Object.entries(SIZE_CHARTS.kids.rows)) {
      const [lo, hi] = String(values[0]).split(/[–-]/).map(Number);
      if (m.heightCm <= hi || !hi) return { size, basis: `height ${Math.round(m.heightCm)} cm` };
      void lo;
    }
    return { size: rows[rows.length - 1], basis: `height ${Math.round(m.heightCm)} cm` };
  }
  return null;
}

export function recommend(audience: FitAudience, m: Measurements, fit: Fit = "regular"): Recommendation[] {
  const out: Recommendation[] = [];
  const add = (key: keyof SizeProfile, label: string, size: string | null, basis: string) => {
    if (size) out.push({ key, label, size, basis });
  };
  const r = (n?: number) => (n ? `${Math.round(n)}"` : "");

  if (audience === "kids") {
    const k = kidSize(m);
    if (k) add("kidSize", "Kids' wear", k.size, k.basis);
    return out;
  }
  if (audience === "men") {
    if (m.chestIn) add("menTop", "T-shirts & vests", sizeFrom(SIZE_CHARTS.mensTops, 0, m.chestIn, fit), `chest ${r(m.chestIn)}`);
    if (m.waistIn) add("menUnderwear", "Innerwear & bottoms", sizeFrom(SIZE_CHARTS.mensInnerwear, 0, m.waistIn, fit), `waist ${r(m.waistIn)}`);
    return out;
  }
  // women
  const pantyBy = m.hipIn ? sizeFrom(SIZE_CHARTS.womensBottoms, 1, m.hipIn, fit) : m.waistIn ? sizeFrom(SIZE_CHARTS.womensBottoms, 0, m.waistIn, fit) : null;
  if (pantyBy) add("womenPanty", "Panties", pantyBy, m.hipIn ? `hip ${r(m.hipIn)}` : `waist ${r(m.waistIn)}`);
  if (m.underbustIn) add("womenBra", "Bras", sizeFrom(SIZE_CHARTS.bra, 0, m.underbustIn, fit), `under-bust ${r(m.underbustIn)}`);
  else if (m.chestIn) add("womenBra", "Bras", sizeFrom(SIZE_CHARTS.bra, 1, m.chestIn, fit), `bust ${r(m.chestIn)}`);
  return out;
}

// A line for Scout's context ("My sizes" notes), so its answers know the measurements
export function measurementNote(audience: FitAudience, m: Measurements, source: "photo" | "manual") {
  const parts = [
    m.heightCm && `height ${Math.round(m.heightCm)} cm`,
    m.weightKg && `weight ${Math.round(m.weightKg)} kg`,
    m.kidAge && `kid's age ${m.kidAge}`,
    m.chestIn && `${audience === "women" ? "bust" : "chest"} ~${Math.round(m.chestIn)} in`,
    m.underbustIn && `under-bust ~${Math.round(m.underbustIn)} in`,
    m.waistIn && `waist ~${Math.round(m.waistIn)} in`,
    m.hipIn && `hip ~${Math.round(m.hipIn)} in`,
  ].filter(Boolean);
  return parts.length ? `Fit Finder (${source === "photo" ? "estimated from a photo" : "entered"}): ${parts.join(", ")}` : "";
}
