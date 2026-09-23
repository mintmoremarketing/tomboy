import { getCollectionByHandle } from "@/lib/shopify";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    notFound();
  }

  const products = collection.products?.edges || [];

  return (
    <div className="collection-page">
      {/* Top Banner */}
      <div className="collection-topbar">
        <Link href="/" className="brand" aria-label="Tomboy homepage">
          <img src="/logo.webp" alt="Tomboy India" className="brand-logo" />
        </Link>
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> Back to Homepage
        </Link>
      </div>

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
                    <p>Rs. {node.priceRange?.minVariantPrice?.amount}</p>
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
