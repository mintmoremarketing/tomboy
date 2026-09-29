import { cache } from "react";
import type { Metadata } from "next";
import { getCollectionByHandle } from "@/lib/shopify";
import { metaDescription } from "@/lib/site";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageTopbar } from "@/components/layout/page-topbar";
import { Sparkles } from "lucide-react";

// one Shopify request shared by the metadata and the page
const loadCollection = cache((handle: string) => getCollectionByHandle(handle));

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = await loadCollection(handle);
  if (!collection) return { title: "Collection not found", robots: { index: false } };

  const title = collection.seo?.title || collection.title;
  const description = metaDescription(
    collection.seo?.description || collection.description,
    `Shop ${collection.title} at Tomboy India: 100% super combed cotton, anti-pinch comfort, free shipping over ₹899.`,
  );
  const image = collection.image?.url || collection.products?.edges?.[0]?.node?.images?.edges?.[0]?.node?.url;
  return {
    title,
    description,
    alternates: { canonical: `/collections/${collection.handle}` },
    openGraph: { title, description, url: `/collections/${collection.handle}`, images: image ? [image] : undefined },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params;
  const collection = await loadCollection(handle);

  if (!collection) {
    notFound();
  }

  const products = collection.products?.edges || [];

  return (
    <div className="collection-page">
      {/* Top Banner */}
      <PageTopbar />

      {/* Hero Header */}
      <header className="collection-header">
        <div className="collection-header__inner">
          <p className="eyebrow">Collection</p>
          <h1>{collection.title}</h1>
          {collection.description && (
            <p className="collection-desc">{collection.description}</p>
          )}
        </div>
      </header>

      {/* Product Grid */}
      <main className="collection-main">
        {products.length === 0 ? (
          <div className="empty-collection">
            <Sparkles size={32} />
            <h2>No products found in this collection</h2>
            <p>Check back soon or browse our other essentials.</p>
            <Link href="/" className="button button--dark">
              Shop All
            </Link>
          </div>
        ) : (
          <div className="collection-grid">
            {products.map(({ node }: any) => {
              const imageUrl = node.images?.edges[0]?.node?.url;
              return (
                <Link
                  href={`/products/${node.handle}`}
                  key={node.id}
                  className="product-card product-card--grid"
                >
                  <div
                    className="product-card__art"
                    style={
                      imageUrl
                        ? { backgroundImage: `url(${imageUrl})` }
                        : {}
                    }
                  >
                    {!imageUrl && <span>{node.productType || "Essential"}</span>}
                  </div>
                  <div className="product-card__details">
                    <h3>{node.title}</h3>
                    <p>₹{Math.round(Number(node.priceRange?.minVariantPrice?.amount) || 0).toLocaleString("en-IN")}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
