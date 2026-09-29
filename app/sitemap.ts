import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/shopify";
import { SITE_URL } from "@/lib/site";

// Rebuilt at most once an hour, so new products show up without a redeploy
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  type Entry = { handle: string; updatedAt: string };
  const { products, collections }: { products: Entry[]; collections: Entry[] } = await getSitemapEntries().catch(() => ({
    products: [],
    collections: [],
  }));

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/children`, changeFrequency: "weekly", priority: 0.8 },
    ...collections.map((c) => ({
      url: `${SITE_URL}/collections/${c.handle}`,
      lastModified: c.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/products/${p.handle}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/privacy/ai`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
