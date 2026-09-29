"use client";

import { useEffect, useState } from "react";

// Real swatch colours for products whose Shopify colour names are codes ("B AOP 1").
// Reads the garment's main colour from each variant's photo (centre of the frame, ignoring the
// white background and skin tones) and names it from a small palette.

export type Swatch = { hex: string; name: string };

const PALETTE: [string, [number, number, number]][] = [
  ["Black", [20, 20, 22]],
  ["Charcoal", [55, 58, 64]],
  ["Grey", [128, 128, 132]],
  ["Light Grey", [196, 196, 200]],
  ["White", [245, 245, 245]],
  ["Cream", [238, 228, 205]],
  ["Beige", [205, 185, 150]],
  ["Brown", [110, 72, 45]],
  ["Maroon", [110, 22, 38]],
  ["Red", [190, 35, 40]],
  ["Coral", [240, 110, 90]],
  ["Orange", [235, 120, 30]],
  ["Mustard", [205, 160, 40]],
  ["Yellow", [245, 215, 50]],
  ["Olive", [100, 105, 50]],
  ["Bottle Green", [30, 75, 60]],
  ["Green", [50, 140, 70]],
  ["Mint", [160, 225, 190]],
  ["Teal", [20, 105, 120]],
  ["Sky Blue", [120, 180, 230]],
  ["Blue", [40, 95, 190]],
  ["Navy", [25, 40, 75]],
  ["Purple", [95, 50, 130]],
  ["Lavender", [185, 165, 220]],
  ["Pink", [240, 140, 180]],
];

// name by hue and lightness (works better than nearest-colour for dark, dyed fabrics)
function nearestName([r, g, b]: [number, number, number]) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  const d = max - min;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (l < 0.1) return "Black";
  if (sat < 0.12 || d < 0.06) return l < 0.3 ? "Charcoal" : l < 0.6 ? "Grey" : l < 0.88 ? "Light Grey" : "White";
  let h = 0;
  const R = r / 255, G = g / 255, B = b / 255;
  if (max === R) h = ((G - B) / d) % 6;
  else if (max === G) h = (B - R) / d + 2;
  else h = (R - G) / d + 4;
  h = (h * 60 + 360) % 360;

  if (h < 15 || h >= 345) return l < 0.3 ? "Maroon" : l > 0.72 ? "Pink" : "Red";
  if (h < 40) return sat < 0.35 ? (l > 0.7 ? "Cream" : l < 0.35 ? "Brown" : "Beige") : l < 0.35 ? "Brown" : l > 0.7 ? "Peach" : "Orange";
  if (h < 65) return l < 0.35 ? "Olive" : l > 0.7 ? "Cream" : sat < 0.5 ? "Khaki" : l < 0.5 ? "Mustard" : "Yellow";
  if (h < 160) return l < 0.3 ? "Bottle Green" : l > 0.7 ? "Mint" : h < 90 && l < 0.45 ? "Olive" : "Green";
  if (h < 185) return l < 0.3 ? "Bottle Green" : l > 0.7 ? "Mint" : "Teal";
  if (h < 205) return l > 0.65 ? "Sky Blue" : "Teal";
  if (h < 250) return l < 0.3 ? "Navy" : l > 0.65 ? "Sky Blue" : "Blue";
  if (h < 290) return l > 0.7 ? "Lavender" : "Purple";
  return l < 0.3 ? "Wine" : l > 0.7 ? "Pink" : "Magenta";
}

const toHex = (c: number[]) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

function isSkinOrBackground(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (min > 225) return true; // white / near-white studio background
  // skin: warm, red > green > blue, moderate saturation
  return r > 95 && g > 40 && b > 20 && r > g && g > b && r - b > 30 && r - b < 130 && max - min < 140 && r > 150;
}

const luma = ([r, g, b]: [number, number, number]) => 0.3 * r + 0.59 * g + 0.11 * b;

// coarse hue family (or grey) so shadows and highlights of one fabric group together
function family(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 45) return "dark";
  if (max - min < 22) return "grey";
  let h = 0;
  if (max === r) h = ((g - b) / (max - min)) % 6;
  else if (max === g) h = (b - r) / (max - min) + 2;
  else h = (r - g) / (max - min) + 4;
  return `h${Math.round(((h * 60 + 360) % 360) / 30)}`;
}

const cache = new Map<string, Swatch | null>();

async function sample(url: string): Promise<Swatch | null> {
  if (cache.has(url)) return cache.get(url)!;
  const src = `${url}${url.includes("?") ? "&" : "?"}width=120`;
  const result = await new Promise<Swatch | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Shopify's CDN allows this, so the canvas can be read
    img.onload = () => {
      try {
        const w = 60;
        const h = Math.round((img.height / img.width) * w) || 75;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, w, h);
        // centre band, where the garment is in product shots
        const data = ctx.getImageData(Math.round(w * 0.25), Math.round(h * 0.2), Math.round(w * 0.5), Math.round(h * 0.6)).data;
        // the fabric's own colour: most common hue family, then its mid-to-light tones
        // (the darkest pixels are shadows in the folds, the lightest are prints and highlights)
        const pixels: [number, number, number][] = [];
        const families = new Map<string, number>();
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (isSkinOrBackground(r, g, b)) continue;
          pixels.push([r, g, b]);
          const key = family(r, g, b);
          families.set(key, (families.get(key) ?? 0) + 1);
        }
        const top = [...families.entries()].sort((x, y) => y[1] - x[1])[0]?.[0];
        if (!top) return resolve(null);
        const fabric = pixels
          .filter(([r, g, b]) => family(r, g, b) === top)
          .sort((x, y) => luma(x) - luma(y));
        const band = fabric.slice(Math.floor(fabric.length * 0.5), Math.ceil(fabric.length * 0.85));
        const avg = (k: number) => band.reduce((sum, px) => sum + px[k], 0) / band.length;
        const rgb: [number, number, number] = [avg(0), avg(1), avg(2)];
        resolve({ hex: toHex(rgb), name: nearestName(rgb) });
      } catch {
        resolve(null); // canvas blocked: fall back to the name-based colour
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
  cache.set(url, result);
  return result;
}

// A colour option "looks like a code" when it has no colour word in it (e.g. "B AOP 1", "C1").
const COLOUR_WORD = new RegExp(`\\b(${PALETTE.map(([n]) => n.split(" ").pop()).join("|")}|navy|blue|green|red|black|white|grey|gray|pink|purple|olive|maroon|khaki|melange|wine|rust|peach|lilac|sand|stone|indigo|denim|aqua|turquoise|lemon|lime|magenta)\\b`, "i");
export const looksLikeCode = (name: string) => !COLOUR_WORD.test(name);

export function useSwatches(colorImages: Record<string, string>) {
  const [swatches, setSwatches] = useState<Record<string, Swatch>>({});
  const key = JSON.stringify(colorImages);

  useEffect(() => {
    let cancelled = false;
    const entries = Object.entries(colorImages);
    Promise.all(entries.map(async ([color, url]) => [color, await sample(url)] as const)).then((results) => {
      if (cancelled) return;
      const next: Record<string, Swatch> = {};
      for (const [color, swatch] of results) if (swatch) next[color] = swatch;
      setSwatches(next);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return swatches;
}
