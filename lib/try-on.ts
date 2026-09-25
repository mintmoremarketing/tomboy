// Which products can be tried on with an AI-generated preview.
//
// Only adult outerwear (tees, track pants, shorts, joggers). Innerwear (briefs,
// boxers, bras, panties, vests, trunks) and every kids' product are excluded on
// purpose: generating a real person's photo in underwear, or any image of a
// child, is open to abuse. The server enforces this; the UI only uses it to
// decide where to show the button.

const OUTERWEAR = /\b(t-?shirts?|tees?|track(s| pants?)?|joggers?|shorts|pants)\b/i;
const EXCLUDED = /\b(boys?|girls?|kids?|socks?|brief|briefs|boxer|boxers|bra|bras|pant(y|ies)|vests?|trunks?|innerwear|underwear)\b|[’']s\s+(boy|girl)/i;
const OUTERWEAR_TYPES = new Set(['t-shirt', 'shorts', 'track pants', 'pants']);

export function isTryOnEligible(product: { title: string; productType?: string | null; audience?: string }) {
  if (product.audience === 'kids') return false;
  const text = `${product.title} ${product.productType ?? ''}`;
  if (EXCLUDED.test(text)) return false;
  return OUTERWEAR_TYPES.has((product.productType ?? '').trim().toLowerCase()) || OUTERWEAR.test(product.title);
}

// Which part of the outfit the garment replaces, for the image prompt.
export function garmentSlot(title: string, productType?: string | null): 'top' | 'bottom' {
  return /t-?shirt|tee\b/i.test(`${title} ${productType ?? ''}`) ? 'top' : 'bottom';
}
