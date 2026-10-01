"use client";

// What Scout volunteers on a product page: size help based on the shopper's saved sizes
// ("My sizes" in Scout), and what goes with the product once it's in the cart.

import type { SizeProfile } from "@/components/assistant/client";
import { sizeKey } from "@/data/size-charts";
import type { NudgeAction, NudgeProduct } from "@/components/assistant/nudges";

export type ProductKind = "tee" | "bottoms" | "innerwear" | "vest" | "panty" | "bra" | "socks" | "kids";

export function productKind(title: string, productType?: string | null): ProductKind | null {
  const t = `${title} ${productType ?? ""}`.toLowerCase();
  if (/\b(kids?|boys?|girls?)\b|boy[’']s|girl[’']s/.test(t)) return "kids";
  if (/\bsocks?\b/.test(t)) return "socks";
  if (/\bbras?\b/.test(t)) return "bra";
  if (/\b(panty|panties|bikini|hipster)\b/.test(t)) return "panty";
  if (/\b(vest|vests|tank)\b/.test(t)) return "vest";
  if (/\b(brief|briefs|boxer|boxers|trunk|trunks)\b/.test(t)) return "innerwear";
  if (/\b(t-?shirt|tee)\b/.test(t)) return "tee";
  if (/\b(shorts?|pants?|joggers?|track|pyjamas?|lounge)\b/.test(t)) return "bottoms";
  return null;
}

// Which saved size applies, and how to talk about it
const PROFILE_FOR: Record<ProductKind, { key: keyof SizeProfile; says: string } | null> = {
  tee: { key: "menTop", says: "tees" },
  vest: { key: "menTop", says: "vests and tops" },
  bottoms: { key: "menUnderwear", says: "bottoms" },
  innerwear: { key: "menUnderwear", says: "innerwear" },
  panty: { key: "womenPanty", says: "panties" },
  bra: { key: "womenBra", says: "bras" },
  kids: { key: "kidSize", says: "kids' wear" },
  socks: null,
};

export function savedSizeFor(kind: ProductKind | null, profile: SizeProfile) {
  if (!kind) return null;
  const p = PROFILE_FOR[kind];
  if (!p) return null;
  let value = (profile[p.key] as string | undefined)?.trim();
  if (!value && kind === "kids" && profile.kidAge) value = profile.kidAge.trim();
  return value ? { value, says: p.says } : null;
}

// The product's size that matches a saved size ("L", "l", "5-6 years", or a kid's age "5")
export function matchSize(saved: string, sizes: string[]): string | null {
  const key = sizeKey(saved);
  const exact = sizes.find((s) => sizeKey(s) === key);
  if (exact) return exact;
  const age = Number(saved.match(/^\d+/)?.[0]);
  if (age) {
    return (
      sizes.find((s) => {
        const [a, b] = (s.match(/\d+/g) ?? []).map(Number);
        return a !== undefined && b !== undefined && age >= a && age <= b;
      }) ?? null
    );
  }
  return null;
}

// "What goes with it" after adding to cart
const PAIRING: Record<ProductKind, { text: string; ask: string; label: string } | null> = {
  tee: { text: "Great choice! This tee looks even better with these:", ask: "Show me joggers or shorts that go well with {this}", label: "Show matching bottoms" },
  bottoms: { text: "Love it. Pair them with one of these tees:", ask: "Which t-shirts go well with {this}?", label: "Show matching tees" },
  innerwear: { text: "Nice! A matching vest completes the set:", ask: "Show me vests that match {this}", label: "Show matching vests" },
  vest: { text: "Good call. These go perfectly with it:", ask: "Show me briefs or trunks that go with {this}", label: "Show matching innerwear" },
  panty: { text: "Lovely pick! These pair beautifully with it:", ask: "Which bras go well with {this}?", label: "Show matching bras" },
  bra: { text: "Lovely pick! Complete the set with these:", ask: "Which panties go well with {this}?", label: "Show matching panties" },
  kids: { text: "Cute pick! These go great with it:", ask: "What kids' items go well with {this}?", label: "Show what goes with it" },
  socks: null,
};

export function pairingNudge(kind: ProductKind | null): { text: string; actions: NudgeAction[] } | null {
  const p = kind ? PAIRING[kind] : null;
  return p ? { text: p.text, actions: [{ label: p.label, ask: p.ask }] } : null;
}

// ---- "Complete the look": real products from the collection that goes with this one ----
function pairCollections(kind: ProductKind | null, title: string): string[] {
  const t = title.toLowerCase();
  switch (kind) {
    case "tee":
      return ["track-pants", "shorts"];
    case "bottoms":
      return ["t-shirt"];
    case "innerwear":
      return ["tomboy-vest"];
    case "vest":
      return ["tomboy-brief", "tomboy-boxer"];
    case "panty":
      return ["bra"];
    case "bra":
      return ["panties"];
    case "kids":
      return /short|pant|jogger/.test(t) ? ["kids-vest"] : /vest/.test(t) ? ["kids-brief", "kids-boxer"] : ["kids-shorts", "kids-pants"];
    default:
      return [];
  }
}

export async function pairProducts(kind: ProductKind | null, title: string, exclude: string, count = 2): Promise<NudgeProduct[]> {
  // a few from each matching collection, then take turns so two collections give one each
  const lists = await Promise.all(
    pairCollections(kind, title).map((handle) =>
      fetch(`/api/products?collection=${handle}`)
        .then((r) => r.json())
        .then((edges) => (Array.isArray(edges) ? edges.slice(0, 4).map((e: any) => e.node) : []))
        .catch(() => [] as any[]),
    ),
  );
  const out: NudgeProduct[] = [];
  for (let i = 0; out.length < count && lists.some((l) => l[i]); i++) {
    for (const list of lists) {
      const node = list[i];
      if (!node || node.handle === exclude || out.some((p) => p.handle === node.handle)) continue;
      out.push({
        handle: node.handle,
        title: node.title,
        image: node.images?.edges?.[0]?.node?.url ?? null,
        price: Number(node.priceRange?.minVariantPrice?.amount) || 0,
        compareAt: Number(node.compareAtPriceRange?.minVariantPrice?.amount) || 0,
      });
      if (out.length >= count) break;
    }
  }
  return out;
}
