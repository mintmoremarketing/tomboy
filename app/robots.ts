import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // API routes and the audience picker aren't pages worth indexing
      disallow: ["/api/", "/welcome"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
