import { getCollectionByHandle } from "@/lib/shopify";
import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck, Feather, RefreshCw, Heart } from "lucide-react";

export const metadata = {
  title: "Kids & Children Essentials | Tomboy India",
  description: "100% Super Combed Cotton essentials for children. Anti-pinch waistbands, breathable fabric, zero-chafe comfort.",
};

const kidsCategories = [
  { name: "All Kids", href: "/collections/kids", active: true },
  { name: "Briefs", href: "/collections/kids-brief" },
  { name: "Boxers", href: "/collections/kids-boxer" },
  { name: "Vests", href: "/collections/kids-vest" },
  { name: "Shorts", href: "/collections/kids-shorts" },
  { name: "Pants", href: "/collections/kids-pants" },
  { name: "Socks", href: "/collections/kids-socks" },
];

const perks = [
  {
    icon: Feather,
    title: "100% Combed Cotton",
    desc: "Featherlight, ultra-soft combed yarns designed specifically for young, sensitive skin.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-Pinch Bands",
    desc: "Soft-stretch micro-rib waistbands that never dig in, pinch, or leave red marks.",
  },
  {
    icon: RefreshCw,
    title: "100+ Washes Durability",
    desc: "Reinforced double-stitch seams engineered to withstand non-stop playground wear.",
  },
  {
    icon: Heart,
    title: "Zero-Chafe Seams",
    desc: "Flatlock interior stitching prevents irritation so kids can play without distraction.",
  },
];

export default async function ChildrenPage() {
  const collection = await getCollectionByHandle("kids");
  const products = collection?.products?.edges || [];

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
      <header className="collection-header" style={{ borderBottom: "none", paddingBottom: "16px" }}>
        <div className="collection-header__inner">
          <span className="streetwear-sticker sticker-inline-yellow" style={{ marginBottom: "16px", display: "inline-block" }}>
            🧸 100% SKIN-SAFE COTTON
          </span>
          <p className="eyebrow">Children & Kids Lineup</p>
          <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", lineHeight: 1.05 }}>
            PLAY HARD.<br />STAY COZY.
          </h1>
          <p className="collection-desc" style={{ marginTop: "16px", maxWidth: "680px" }}>
            Super soft, breathable essentials built for everyday adventures. Designed with zero-itch tags, non-pinch waistbands, and hypoallergenic pure combed cotton.
          </p>
        </div>
      </header>

      {/* Sub-Category Pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", margin: "24px 0 40px" }}>
        {kidsCategories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="audience-pill"
            style={
              cat.active
                ? { backgroundColor: "var(--black)", color: "var(--white)", borderColor: "var(--black)" }
                : {}
            }
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Product Grid */}
      <main className="collection-main">
        {products.length === 0 ? (
          <div className="empty-collection" style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
            <Sparkles size={32} color="var(--accent)" />
            <h2>Live Shopify Kids Collection</h2>
            <p style={{ maxWidth: "480px" }}>
              Explore individual category collections below or browse our full store essentials.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/collections/kids-brief" className="button button--dark">
                Kids Briefs
              </Link>
              <Link href="/collections/kids-boxer" className="button button--light">
                Kids Boxers
              </Link>
              <Link href="/collections/kids-vest" className="button button--light">
                Kids Vests
              </Link>
            </div>
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
                    {!imageUrl && <span>{node.productType || "Kids Essential"}</span>}
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

      {/* Perks Grid */}
      <section style={{ marginTop: "80px", paddingTop: "48px", borderTop: "1px solid var(--border)" }}>
        <p className="eyebrow" style={{ textAlign: "center", marginBottom: "8px" }}>The Tomboy Kids Standard</p>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "40px" }}>
          Built for Sensitive Skin & Endless Play
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
          {perks.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                style={{
                  background: "var(--bg-card)",
                  padding: "28px 24px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "var(--white)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Icon size={20} color="var(--black)" />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>{p.title}</h3>
                <p style={{ fontSize: "0.92rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
