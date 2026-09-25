"use client";

import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Menu,
  RotateCw,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlipText } from "@/components/block/flip-text";
import { CraftStorySection } from "@/components/block/text-fill-animation";
import { MagneticImageTrail } from "@/components/block/magnetic-image-trail";
import {
  audienceContent,
  brandCards,
  creatorPlaceholders,
  footerGroups,
  offerTicker,
  productPlaceholders,
  reviewPlaceholders,
  shopEssentials,
} from "@/data/homepage";

type Audience = "men" | "women" | "kids";

export default function Home() {
  const [audience, setAudience] = useState<Audience>("men");
  const [showGateway, setShowGateway] = useState<boolean>(false);
  const [openFooter, setOpenFooter] = useState<string>("Shop");
  const [realProducts, setRealProducts] = useState<any[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem("tomboy-audience") as Audience | null;
    if (saved === "men" || saved === "women" || saved === "kids") {
      setAudience(saved);
      setShowGateway(false);
    } else {
      setShowGateway(true);
    }
  }, []);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRealProducts(data);
        }
      })
      .catch(console.error);
  }, []);

  function switchAudience(value: Audience) {
    setAudience(value);
    window.localStorage.setItem("tomboy-audience", value);
  }

  function handleNextAudience() {
    const next: Audience = audience === "men" ? "women" : audience === "women" ? "kids" : "men";
    switchAudience(next);
  }

  function handleGatewayChoice(value: Audience) {
    setAudience(value);
    setShowGateway(false);
    window.localStorage.setItem("tomboy-audience", value);
  }

  const products = useMemo(() => {
    if (realProducts.length > 0) {
      return realProducts.map((p) => ({
        audience: "all",
        title: p.node.title,
        handle: p.node.handle,
        type: p.node.productType || "Product",
        price: `Rs. ${p.node.priceRange.minVariantPrice.amount}`,
        color: "cream",
        imageUrl: p.node.images.edges[0]?.node.url,
      }));
    }
    return productPlaceholders.filter(
      (item) => item.audience === audience || item.audience === "all"
    );
  }, [audience, realProducts]);

  return (
    <main>
      <AnnouncementTicker />
      <Header
        audience={audience}
        onToggleAudience={handleNextAudience}
        onOpenGateway={() => setShowGateway(true)}
        products={products}
      />
      <Hero audience={audience} />
      <Essentials audience={audience} />
      <CraftStorySection audience={audience} />
      <ProductCarousel products={products} audience={audience} />
      <ActionStrip />
      <BrandStory />
      <ReviewTemplates />
      <StayUpdated />
      <Footer openFooter={openFooter} setOpenFooter={setOpenFooter} />

      <StartingGateway
        isOpen={showGateway}
        onSelectAudience={handleGatewayChoice}
      />
    </main>
  );
}

function StartingGateway({
  isOpen,
  onSelectAudience,
}: {
  isOpen: boolean;
  onSelectAudience: (val: Audience) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="gateway-screen">
      <div className="gateway-header">
        <img src="/logo.webp" alt="Tomboy India" className="gateway-logo" />
      </div>

      <div className="gateway-content">
        <div className="welcome-card">
          <div className="welcome-grid">
            <div className="welcome-copy">
              <p className="eyebrow">Tomboy India</p>
              <h1>
                TOO SOFT<br />
                TO TAKE OFF.
              </h1>
              <p>
                100% Super Combed Cotton essentials designed for all-day freedom. Pick your fit to explore:
              </p>
            </div>

            <div className="welcome-visual">
              <div className="welcome-image-slot">
                <div className="welcome-image-placeholder">
                  <span>[ Model / Campaign Photo Placeholder ]</span>
                </div>

                <div className="welcome-floating-buttons">
                  <button
                    className="welcome-pill-btn welcome-pill--women"
                    onClick={() => onSelectAudience("women")}
                  >
                    Women <ChevronRight size={16} />
                  </button>
                  <button
                    className="welcome-pill-btn welcome-pill--men"
                    onClick={() => onSelectAudience("men")}
                  >
                    Men <ChevronRight size={16} />
                  </button>
                  <button
                    className="welcome-pill-btn welcome-pill--kids"
                    onClick={() => onSelectAudience("kids")}
                  >
                    Kids <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StickerItem {
  id: string;
  type: "text" | "image";
  content?: string;
  emoji?: string;
  imageUrl?: string;
  bgColor: string;
  textColor: string;
  shadowColor: string;
  defaultLeft: string;
  defaultTop: string;
  rotation: number;
}

const initialStickers: StickerItem[] = [
  {
    id: "og",
    type: "text",
    content: "TOMBOY OG",
    emoji: "🍒",
    bgColor: "#FFFFFF",
    textColor: "#0A0A0A",
    shadowColor: "#FF3344",
    defaultLeft: "48%",
    defaultTop: "12%",
    rotation: -18,
  },
  {
    id: "softness",
    type: "text",
    content: "TOO SOFT TO TAKE OFF",
    emoji: "💥",
    bgColor: "#2E7CF6",
    textColor: "#FFFFFF",
    shadowColor: "#0A0A0A",
    defaultLeft: "80%",
    defaultTop: "8%",
    rotation: -4,
  },
  {
    id: "cotton",
    type: "text",
    content: "100% COMBED COTTON",
    emoji: "🌿",
    bgColor: "#FF3399",
    textColor: "#FFFFFF",
    shadowColor: "#0A0A0A",
    defaultLeft: "62%",
    defaultTop: "32%",
    rotation: -18,
  },
  {
    id: "waistband",
    type: "text",
    content: "ANTI-PINCH BAND",
    emoji: "☁️",
    bgColor: "#FFE500",
    textColor: "#0A0A0A",
    shadowColor: "#0A0A0A",
    defaultLeft: "48%",
    defaultTop: "70%",
    rotation: 0,
  },
  {
    id: "chafe",
    type: "text",
    content: "ZERO CHAFE",
    emoji: "🎯",
    bgColor: "#52F264",
    textColor: "#0A0A0A",
    shadowColor: "#0A0A0A",
    defaultLeft: "82%",
    defaultTop: "58%",
    rotation: -2,
  },
  {
    id: "fit",
    type: "text",
    content: "INDIAN BODY FIT",
    emoji: "🇮🇳",
    bgColor: "#FF3344",
    textColor: "#FFFFFF",
    shadowColor: "#00F5D4",
    defaultLeft: "69%",
    defaultTop: "74%",
    rotation: 18,
  },
];

function DraggableSticker({
  sticker,
  isSelected,
  onSelect,
}: {
  sticker: StickerItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const [delta, setDelta] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(sticker.rotation);
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [zIndex, setZIndex] = useState(15);

  const stickerRef = useRef<HTMLDivElement>(null);
  const dragOriginRef = useRef({ mouseX: 0, mouseY: 0, startDx: 0, startDy: 0 });
  const rotateOriginRef = useRef({ cx: 0, cy: 0 });

  // Drag Sticker Body
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".sticker-rotate-handle-wrapper")) return;

    e.preventDefault();
    e.stopPropagation();
    onSelect(sticker.id);
    setIsDragging(true);
    setZIndex(100 + (Date.now() % 1000));
    dragOriginRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startDx: delta.x,
      startDy: delta.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragOriginRef.current.mouseX;
    const dy = e.clientY - dragOriginRef.current.mouseY;
    setDelta({
      x: dragOriginRef.current.startDx + dx,
      y: dragOriginRef.current.startDy + dy,
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  // Rotate Sticker via Handle
  const onRotatePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(sticker.id);
    setIsRotating(true);
    setZIndex(100 + (Date.now() % 1000));

    if (stickerRef.current) {
      const rect = stickerRef.current.getBoundingClientRect();
      rotateOriginRef.current = {
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
      };
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onRotatePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isRotating) return;
    const { cx, cy } = rotateOriginRef.current;
    const rad = Math.atan2(e.clientY - cy, e.clientX - cx);
    const deg = Math.round(rad * (180 / Math.PI) + 90);
    setRotation(deg);
  };

  const onRotatePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isRotating) {
      setIsRotating(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  return (
    <div
      ref={stickerRef}
      className={`draggable-sticker ${isDragging ? "is-dragging" : ""} ${isSelected || isRotating ? "is-selected" : ""}`}
      style={{
        left: sticker.defaultLeft,
        top: sticker.defaultTop,
        transform: `translate3d(${delta.x}px, ${delta.y}px, 0) rotate(${rotation}deg) scale(${isDragging ? 1.08 : 1})`,
        backgroundColor: sticker.bgColor,
        color: sticker.textColor,
        boxShadow: `4px 4px 0px ${sticker.shadowColor}`,
        zIndex: isDragging || isRotating ? 999 : isSelected ? 60 : zIndex,
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(sticker.id);
      }}
    >
      {/* 360° Rotation Handle */}
      <div
        className="sticker-rotate-handle-wrapper"
        onPointerDown={onRotatePointerDown}
        onPointerMove={onRotatePointerMove}
        onPointerUp={onRotatePointerUp}
        onPointerCancel={onRotatePointerUp}
      >
        <div className={`sticker-rotate-knob ${isRotating ? "is-rotating" : ""}`} title="Drag handle to rotate sticker in any direction">
          <RotateCw size={12} strokeWidth={2.5} />
        </div>
        <div className="sticker-rotate-stem"></div>
      </div>

      {sticker.imageUrl ? (
        <img src={sticker.imageUrl} alt={sticker.content || "Sticker"} draggable={false} />
      ) : (
        <span className="sticker-label">
          {sticker.emoji && <span className="sticker-emoji">{sticker.emoji}</span>}
          {sticker.content}
        </span>
      )}
    </div>
  );
}

function Hero({ audience }: { audience: Audience }) {
  const content = audienceContent[audience];
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  return (
    <section
      className="hero-section-wrapper"
      onClick={() => setSelectedStickerId(null)}
    >
      <MagneticImageTrail className="hero-trail-container">
        <div className="hero">
          {/* Free-floating stickers spread across the entire hero */}
          <div className="hero-stickers-layer" aria-label="Draggable Stickers">
            {initialStickers.map((sticker) => (
              <DraggableSticker
                key={sticker.id}
                sticker={sticker}
                isSelected={selectedStickerId === sticker.id}
                onSelect={(id) => setSelectedStickerId(id)}
              />
            ))}
          </div>

          <div className="hero__copy">
            <span className="streetwear-sticker sticker-inline-cyan">
              ⚡ 100% UNISEX ENERGY
            </span>

            <p className="eyebrow">{content.kicker}</p>
            <h1>
              <FlipText>{content.headline}</FlipText>
            </h1>
            <p>{content.body}</p>

            <div className="hero__actions">
              <Link className="button button--dark" href={`/collections/${content.collectionHandle}`}>
                Shop {content.label} <ArrowRight size={18} />
              </Link>
              <Link className="button button--light" href="#story">
                Know the Fit
              </Link>
            </div>
          </div>
        </div>
      </MagneticImageTrail>
    </section>
  );
}

function AnnouncementTicker() {
  const repeated = [...offerTicker, ...offerTicker, ...offerTicker, ...offerTicker];

  return (
    <div className="ticker" aria-label="Store offers">
      <div className="ticker__track">
        {repeated.map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function Header({
  audience,
  onToggleAudience,
  onOpenGateway,
  products = [],
}: {
  audience: Audience;
  onToggleAudience: () => void;
  onOpenGateway?: () => void;
  products?: any[];
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <div className="header-left">
          <button
            className="icon-button nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link className="brand" href="/" aria-label="Tomboy homepage">
            <img src="/logo.webp" alt="Tomboy India" className="brand-logo" />
          </Link>
        </div>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/collections/men">Men</Link>
          <Link href="/collections/women">Women</Link>
          <Link href="/collections/kids">Kids</Link>
          <Link href="/collections/best-sellers">Best Sellers</Link>
          <a href="#story">Story</a>
          <a href="#reviews">Reviews</a>
        </nav>

        <div className="header-actions">
          <button
            className="audience-pill"
            onClick={onToggleAudience}
            aria-label="Switch between Men, Women, and Kids"
            title="Switch lineup between Men, Women, and Kids"
          >
            <span>{audience === "men" ? "Men" : audience === "women" ? "Women" : "Kids"}</span>
            <ChevronDown size={14} />
          </button>
          <button
            className="icon-button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
            title="Search products"
          >
            <Search size={20} />
          </button>
          <button
            className="icon-button hide-mobile"
            onClick={() => setAccountOpen(true)}
            aria-label="Customer Account"
            title="Customer Account"
          >
            <CircleUserRound size={20} />
          </button>
          <Link className="icon-button" href="/collections/best-sellers" aria-label="Shop">
            <ShoppingBag size={20} />
          </Link>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-links">
            <Link href="/collections/men" onClick={() => setMobileMenuOpen(false)}>
              Men
            </Link>
            <Link href="/collections/women" onClick={() => setMobileMenuOpen(false)}>
              Women
            </Link>
            <Link href="/collections/best-sellers" onClick={() => setMobileMenuOpen(false)}>
              Best Sellers
            </Link>
            <Link href="/collections/kids" onClick={() => setMobileMenuOpen(false)}>
              Kids Collection
            </Link>
            <button
              style={{
                textAlign: "left",
                padding: "12px 0",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "1.2rem",
                fontWeight: 900,
                textTransform: "uppercase",
              }}
              onClick={() => {
                setMobileMenuOpen(false);
                setAccountOpen(true);
              }}
            >
              <CircleUserRound size={20} /> My Account
            </button>
            <Link href="/info/about-us" onClick={() => setMobileMenuOpen(false)}>
              Our Story
            </Link>
            <Link href="/info/contact" onClick={() => setMobileMenuOpen(false)}>
              Contact Us
            </Link>
          </div>
        </div>
      )}

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
      />

      <AccountModal
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
      />
    </>
  );
}

function SearchModal({
  isOpen,
  onClose,
  products = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? products.filter((p) =>
        (p.title || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.type || "").toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal__header">
          <Search size={22} className="search-modal__icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search briefs, boxers, vests, styles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-modal__input"
          />
          <button className="icon-button" onClick={onClose} aria-label="Close search">
            <X size={22} />
          </button>
        </div>

        {query.trim() === "" ? (
          <div className="search-modal__suggestions">
            <p className="search-modal__label">Popular Searches</p>
            <div className="search-tags">
              {["Classic Briefs", "Boxers", "Pure Cotton Vests", "Bras", "Panties", "Best Sellers"].map((tag) => (
                <button
                  key={tag}
                  className="search-tag"
                  onClick={() => setQuery(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="search-modal__results">
            {filtered.length === 0 ? (
              <p className="search-modal__empty">No products found for &quot;{query}&quot;. Try another search term.</p>
            ) : (
              <div className="search-results-grid">
                {filtered.map((item) => (
                  <Link
                    href={`/products/${item.handle || "boxer"}`}
                    key={item.title}
                    className="search-result-item"
                    onClick={onClose}
                  >
                    <div
                      className="search-result-thumb"
                      style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : {}}
                    />
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AccountModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="account-modal__header">
          <h2>Tomboy Account</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close account modal">
            <X size={22} />
          </button>
        </div>
        <p className="account-modal__subtitle">Log in to track orders, manage addresses, and save favorites.</p>

        <form
          className="account-form"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = "https://houseoftomboy.myshopify.com/account/login";
          }}
        >
          <div className="form-field">
            <label>Email Address</label>
            <input type="email" placeholder="name@example.com" required />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>
          <button type="submit" className="button button--dark" style={{ width: "100%", marginTop: "10px" }}>
            Sign In with Shopify
          </button>
        </form>

        <div className="account-modal__footer">
          <a
            href="https://houseoftomboy.myshopify.com/account/register"
            className="text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Create New Account →
          </a>
          <Link href="/pages/contact" className="text-link" onClick={onClose}>
            Need Help? Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

function Essentials({ audience }: { audience: Audience }) {
  const items = shopEssentials[audience];

  return (
    <section className="section" id="essentials">
      <div className="section-heading">
        <p className="eyebrow">Shop essentials</p>
        <h2>
          {audience === "men"
            ? "Built around everyday men’s comfort."
            : audience === "women"
            ? "Comfort-led women’s essentials."
            : "Pure cotton everyday kids’ essentials."}
        </h2>
      </div>
      <div className="essentials-grid">
        {items.map((item: any) => (
          <Link
            className="essential-card"
            href={item.href}
            key={item.title}
            style={
              {
                "--hover-bg": item.bg,
                "--hover-color": item.textColor,
                "--hover-note": item.noteColor || "rgba(0, 0, 0, 0.7)",
              } as React.CSSProperties
            }
          >
            <span>{item.title}</span>
            <small>{item.note}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductCarousel({
  products,
  audience,
}: {
  products: any[];
  audience: Audience;
}) {
  return (
    <section className="section section--cream">
      <div className="section-heading section-heading--inline">
        <div>
          <p className="eyebrow">Shopify Live Collection</p>
          <h2>
            {audience === "men"
              ? "Men’s Lineup"
              : audience === "women"
              ? "Women’s Lineup"
              : "Kids’ Lineup"}
          </h2>
        </div>
        <Link href={`/collections/${audience}`} className="text-link">
          View all <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
      <div className="product-rail">
        {products.map((product) => {
          const productHref = product.handle ? `/products/${product.handle}` : `/collections/${audience}`;
          return (
            <Link href={productHref} className="product-card" key={product.title}>
              <div
                className={`product-card__art product-card__art--${product.color}`}
                style={
                  product.imageUrl
                    ? { backgroundImage: `url(${product.imageUrl})` }
                    : {}
                }
              >
                {!product.imageUrl && <span>{product.type}</span>}
              </div>
              <h3>{product.title}</h3>
              <p>{product.price}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ActionStrip() {
  return (
    <section className="action-strip-section" aria-label="Tomboy in action">
      <div className="action-strip-container">
        <div className="action-strip-heading">
          <h2>Watch Tomboy in action!</h2>
          <p>
            Follow us{" "}
            <a
              href="https://instagram.com/houseoftomboy"
              target="_blank"
              rel="noopener noreferrer"
              className="action-strip-link"
            >
              @houseoftomboy
            </a>
          </p>
        </div>

        <div className="creator-story-rail">
          {creatorPlaceholders.map((creator) => (
            <a
              href="https://instagram.com/houseoftomboy"
              target="_blank"
              rel="noopener noreferrer"
              className="creator-story-item"
              key={creator.name}
            >
              <div className="creator-story-ring">
                <img
                  src={creator.imageUrl}
                  alt={creator.name}
                  className="creator-story-img"
                  loading="lazy"
                />
              </div>
              <span className="creator-story-name">{creator.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="section brand-story" id="story">
      <div className="section-heading">
        <p className="eyebrow">Get to know us better</p>
        <h2>A closer look at Tomboy.</h2>
      </div>
      <div className="pop-story-grid">
        {brandCards.map((card) => (
          <article
            className="pop-story-card"
            key={card.title}
            style={{ "--card-pop": card.color } as React.CSSProperties}
          >
            <div className="pop-story-card__top">
              <span
                className="pop-story-badge"
                style={{ backgroundColor: card.color, color: card.textColor }}
              >
                {card.num} · {card.tag}
              </span>
            </div>

            <div className="pop-story-card__body">
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>

            <div className="pop-story-card__footer">
              <span className="pop-story-sticker">
                <span className="pop-story-dot" style={{ backgroundColor: card.color }} />
                {card.pill}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReviewTemplates() {
  return (
    <section className="section section--cream" id="reviews">
      <div className="section-heading">
        <p className="eyebrow">Verified Reviews</p>
        <h2>Customer Comfort Reviews</h2>
        <p>Authentic feedback on fit, soft breathable fabric, and durability.</p>
      </div>
      <div className="review-grid">
        {reviewPlaceholders.map((review) => (
          <article className="review-card" key={review.title}>
            <div className="stars" aria-label="Review placeholder stars">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={16} fill="currentColor" />
              ))}
            </div>
            <h3>{review.title}</h3>
            <p>{review.body}</p>
            <small>{review.label}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function StayUpdated() {
  return (
    <section className="stay-updated">
      <h2>Offers, new arrivals, restocks and more.</h2>
      <Link className="button button--green" href="/pages/contact">
        Stay Updated
        <ArrowRight size={18} aria-hidden />
      </Link>
    </section>
  );
}

function Footer({
  openFooter,
  setOpenFooter,
}: {
  openFooter: string;
  setOpenFooter: (value: string) => void;
}) {
  return (
    <footer className="footer">
      {footerGroups.map((group) => {
        const open = openFooter === group.title;
        return (
          <section className="footer-group" key={group.title}>
            <button
              className="footer-group__button"
              onClick={() => setOpenFooter(open ? "" : group.title)}
              aria-expanded={open}
            >
              {group.title}
              {open ? <X size={24} aria-hidden /> : <span aria-hidden>+</span>}
            </button>
            <div className={open ? "footer-group__content is-open" : "footer-group__content"}>
              {group.links.map((link) => (
                <Link href={link.href} key={link.name}>
                  {link.name}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      <div className="footer-brand">
        <img src="/logo.webp" alt="Tomboy India" className="footer-logo" />
      </div>
    </footer>
  );
}
