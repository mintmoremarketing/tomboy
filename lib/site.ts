// Public site details used for SEO (canonical links, sitemap, social previews).
// Set NEXT_PUBLIC_SITE_URL to the live address once it's decided (no trailing slash).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.tomboyindia.com").replace(/\/$/, "");
export const SITE_NAME = "Tomboy India";
export const SITE_DESCRIPTION =
  "100% super combed cotton innerwear and everyday essentials for men, women and kids. Anti-pinch waistbands, tag-free comfort, free shipping over ₹899 and easy 7-day returns.";

// Short plain-text description for meta tags (Shopify descriptions can be long)
export function metaDescription(text?: string | null, fallback = SITE_DESCRIPTION) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  if (clean.length <= 158) return clean;
  return `${clean.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}
