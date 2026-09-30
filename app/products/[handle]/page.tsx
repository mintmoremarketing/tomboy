import { cache } from "react";
import type { Metadata } from "next";
import { getProductByHandle } from "@/lib/shopify";
import { notFound } from "next/navigation";
import { SITE_NAME, SITE_URL, metaDescription } from "@/lib/site";
import ProductView from "./ProductView";

// one Shopify request shared by the metadata and the page
const loadProduct = cache((handle: string) => getProductByHandle(handle));

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await loadProduct(handle);
  if (!product) return { title: "Product not found", robots: { index: false } };

  const title = product.seo?.title || product.title;
  // Shopify SEO titles often already end in "| Tomboy India": don't add it twice
  const pageTitle = /tomboy/i.test(title) ? { absolute: title } : title;
  const description = metaDescription(product.seo?.description || product.description);
  const image = product.images?.edges?.[0]?.node;
  return {
    title: pageTitle,
    description,
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/products/${product.handle}`,
      images: image ? [{ url: image.url, alt: image.altText || product.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image.url] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await loadProduct(handle);

  if (!product) {
    notFound();
  }

  // Product details for Google (price, stock, photos) so results can show them
  const variants = product.variants?.edges?.map((e: any) => e.node) ?? [];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: metaDescription(product.description, product.title),
    image: product.images?.edges?.slice(0, 5).map((e: any) => e.node.url),
    brand: { "@type": "Brand", name: product.vendor || SITE_NAME },
    category: product.productType || undefined,
    url: `${SITE_URL}/products/${product.handle}`,
    offers: variants.slice(0, 50).map((v: any) => ({
      "@type": "Offer",
      sku: v.id.split("/").pop(),
      name: v.title !== "Default Title" ? v.title : undefined,
      price: Number(v.price?.amount ?? product.priceRange?.minVariantPrice?.amount).toFixed(2),
      priceCurrency: v.price?.currencyCode || "INR",
      availability: v.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${product.handle}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // escape "<" so product text can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }}
      />
      <ProductView product={product} />
    </>
  );
}
