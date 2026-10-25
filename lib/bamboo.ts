// Kids' bamboo innerwear: a product counts as bamboo when it's tagged "bamboo" in Shopify
// (Products → product → Tags), or "bamboo" is in its title. Drives the green
// "100% Bamboo" pill on product cards and product pages.
export function isBamboo(p: { title?: string | null; tags?: string[] | null } | null | undefined): boolean {
  if (!p) return false;
  if (p.tags?.some((t) => t.trim().toLowerCase() === "bamboo")) return true;
  return /\bbamboo\b/i.test(p.title ?? "");
}
