"use client";

import { ChevronDown, CircleUserRound, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LiveOrb } from "@/components/ui/live-orb";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { CartButton } from "@/components/cart/cart-drawer";
import { DesktopNavItem, MobileNavSection } from "@/components/layout/nav-menu";
import { audienceContent } from "@/data/homepage";

// The site header used on every page: logo, Men/Women/Kids menus, audience switch,
// search, account, cart and Scout. Phones get the menu drawer; going back is left to the phone's own back gesture.

type Audience = "men" | "women" | "kids";

export const heroHighlightColor: Record<Audience, string> = {
  men: "#00F5D4",
  women: "#FF8AD8",
  kids: "#52F264",
};

const audienceOptions: Audience[] = ["men", "women", "kids"];

function AudienceMenu({
  audience,
  onSelect,
}: {
  audience: Audience;
  onSelect: (value: Audience) => void;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Small grace period so moving the mouse from the pill into the menu doesn't close it.
  function openNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function closeSoon() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  return (
    <div
      className={`audience-menu ${open ? "is-open" : ""}`}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <button
        className="audience-pill"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Shopping for ${audienceContent[audience].label}. Change lineup`}
      >
        {/* all labels share one grid cell so the pill is always as wide as the
            longest ("Women") and the nav doesn't shift when switching */}
        <span className="audience-pill__label" aria-hidden="true">
          {audienceOptions.map((option) => (
            <span key={option} className={option === audience ? "is-current" : undefined}>
              {audienceContent[option].label}
            </span>
          ))}
        </span>
        <ChevronDown size={14} className="audience-pill__chevron" />
      </button>
      {open && (
        <div className="audience-menu__list" role="menu">
          {audienceOptions.map((option) => (
            <button
              key={option}
              role="menuitemradio"
              aria-checked={option === audience}
              className={`audience-menu__item ${option === audience ? "is-active" : ""}`}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              <span className="audience-menu__dot" style={{ background: heroHighlightColor[option] }} />
              {audienceContent[option].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteHeader({
  audience: audienceProp,
  onSelectAudience,
  products: productsProp,
  currentProduct,
}: {
  /** the homepage controls the audience; other pages leave these out and use the saved one */
  audience?: Audience;
  onSelectAudience?: (value: Audience) => void;
  /** products for search; fetched for the current audience when not given */
  products?: any[];
  /** product page: lets Scout's "This product" attach it */
  currentProduct?: { handle: string };
}) {
  const router = useRouter();
  const [savedAudience, setSavedAudience] = useState<Audience>("men");
  useEffect(() => {
    if (audienceProp) return;
    const saved = window.localStorage.getItem("tomboy-audience");
    if (saved === "men" || saved === "women" || saved === "kids") setSavedAudience(saved);
  }, [audienceProp]);
  const audience = audienceProp ?? savedAudience;
  function selectAudience(value: Audience) {
    if (onSelectAudience) return onSelectAudience(value);
    // away from the homepage: remember the choice and go to that lineup
    window.localStorage.setItem("tomboy-audience", value);
    setSavedAudience(value);
    router.push(`/collections/${value}`);
  }

  // search list for pages that don't pass one in
  const [fetchedProducts, setFetchedProducts] = useState<any[]>([]);
  useEffect(() => {
    if (productsProp) return;
    fetch(`/api/products?collection=${audience}`)
      .then((r) => r.json())
      .then((edges) =>
        Array.isArray(edges) &&
        setFetchedProducts(
          edges.map((e: any) => ({
            title: e.node.title,
            handle: e.node.handle,
            type: e.node.productType || "Product",
            price: `₹${Math.round(Number(e.node.priceRange?.minVariantPrice?.amount) || 0).toLocaleString("en-IN")}`,
            imageUrl: e.node.images?.edges?.[0]?.node?.url,
          })),
        ),
      )
      .catch(() => {});
  }, [audience, productsProp]);
  const products = productsProp ?? fetchedProducts;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [orbDancing, setOrbDancing] = useState(false);

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
          <DesktopNavItem audience="men" />
          <DesktopNavItem audience="women" />
          <DesktopNavItem audience="kids" />
          <Link href="/collections/best-sellers">Best Sellers</Link>
          <Link href="/#story">Story</Link>
          <Link href="/#reviews">Reviews</Link>
        </nav>

        <div className="header-actions">
          <AudienceMenu audience={audience} onSelect={selectAudience} />
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
          <CartButton />
          {/* Scout, the shopping assistant (press / anywhere) */}
          <button
            className="orb-button"
            aria-label="Ask Scout"
            title="Ask Scout (press /)"
            onClick={() => setAssistantOpen(true)}
            onMouseEnter={() => setOrbDancing(true)}
            onMouseLeave={() => setOrbDancing(false)}
          >
            <LiveOrb variant="custom" color="#FF3333" eyeColor="#FAFAFA" size={34} dance={orbDancing} />
          </button>
        </div>
      </header>

      <AssistantPanel
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        audience={audience}
        currentProduct={currentProduct}
      />

      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {/* phones: the audience switch lives here instead of the cramped header */}
          <div className="drawer-audience">
            <p className="drawer-audience__title">Shopping for</p>
            <div className="drawer-audience__options" role="radiogroup" aria-label="Shopping for">
              {audienceOptions.map((option) => (
                <button
                  key={option}
                  role="radio"
                  aria-checked={option === audience}
                  className={`drawer-audience__option ${option === audience ? "is-active" : ""}`}
                  style={{ "--dot": heroHighlightColor[option] } as React.CSSProperties}
                  onClick={() => {
                    selectAudience(option);
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="drawer-audience__dot" />
                  {audienceContent[option].label}
                </button>
              ))}
            </div>
          </div>
          <div className="mobile-nav-links">
            <MobileNavSection audience="men" onNavigate={() => setMobileMenuOpen(false)} />
            <MobileNavSection audience="women" onNavigate={() => setMobileMenuOpen(false)} />
            <MobileNavSection audience="kids" onNavigate={() => setMobileMenuOpen(false)} />
            <Link href="/collections/best-sellers" onClick={() => setMobileMenuOpen(false)}>
              Best Sellers
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
                    key={item.handle ?? item.title}
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

