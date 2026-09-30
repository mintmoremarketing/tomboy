"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Price } from "@/components/product/price";
import { ChevronDown } from "lucide-react";

// Men / Women / Kids menus: category groups on the left, best sellers with photos on the right.
// Desktop: dropdown on hover or focus. Phones: expandable sections in the menu drawer.

type Audience = "men" | "women" | "kids";
type Group = { title: string; links: { label: string; href: string }[] };

const c = (handle: string) => `/collections/${handle}`;

export const NAV_MENUS: Record<Audience, { label: string; shopAll: string; groups: Group[] }> = {
  men: {
    label: "Men",
    shopAll: c("men"),
    groups: [
      {
        title: "Innerwear",
        links: [
          { label: "Briefs", href: c("tomboy-brief") },
          { label: "Boxers", href: c("tomboy-boxer") },
          { label: "Trunks", href: c("trunk") },
          { label: "Loose Boxers", href: c("loose") },
          { label: "Vests", href: c("tomboy-vest") },
          { label: "Tank Tops", href: c("tank-top") },
        ],
      },
      {
        title: "Clothing",
        links: [
          { label: "T-Shirts", href: c("t-shirt") },
          { label: "Shorts", href: c("shorts") },
          { label: "Track Pants", href: c("track-pants") },
          { label: "Socks", href: c("men-socks") },
        ],
      },
      {
        title: "Bigmamma (Plus Size)",
        links: [
          { label: "Briefs", href: c("bigmamma-brief") },
          { label: "Boxers", href: c("bigmamma-boxer") },
          { label: "Loose Boxers", href: c("bigmamma-loose-boxer") },
          { label: "Vests", href: c("bigmamma-vest") },
        ],
      },
    ],
  },
  women: {
    label: "Women",
    shopAll: c("women"),
    groups: [
      {
        title: "Innerwear",
        links: [
          { label: "Panties", href: c("panties") },
          { label: "Bras", href: c("bra") },
        ],
      },
      {
        title: "Accessories",
        links: [{ label: "Socks", href: c("womens-socks") }],
      },
    ],
  },
  kids: {
    label: "Kids",
    shopAll: c("kids"),
    groups: [
      {
        title: "Innerwear",
        links: [
          { label: "Briefs", href: c("kids-brief") },
          { label: "Boxers", href: c("kids-boxer") },
          { label: "Vests", href: c("kids-vest") },
        ],
      },
      {
        title: "Clothing",
        links: [
          { label: "Shorts", href: c("kids-shorts") },
          { label: "Pants", href: c("kids-pants") },
          { label: "Socks", href: c("kids-socks") },
        ],
      },
    ],
  },
};

type Pick = { handle: string; title: string; image: string | null; price: number; compareAt: number };

const AUDIENCE_TEST: Record<Audience, RegExp> = {
  kids: /\b(kids?|boy'?s?|girl'?s?|boys|girls)\b|’s\s*(boy|girl)/i,
  women: /\b(women|womens|woman|ladies|bra|bras|panty|panties)\b|women’s/i,
  men: /\b(men|mens)\b|men’s/i,
};

const toPick = (node: any): Pick => ({
  handle: node.handle,
  title: node.title.replace(/^TOMBOY\s+/i, ""),
  image: node.images?.edges?.[0]?.node?.url ?? null,
  price: Number(node.priceRange?.minVariantPrice?.amount) || 0,
  compareAt: Number(node.compareAtPriceRange?.minVariantPrice?.amount) || 0,
});

const picksCache: Partial<Record<Audience, Pick[]>> = {};

// Best sellers for this audience; topped up from the audience's own collection
// (Shopify's Best Sellers collection is small and mostly men's).
async function loadPicks(audience: Audience): Promise<Pick[]> {
  if (picksCache[audience]) return picksCache[audience]!;
  const get = (handle: string) =>
    fetch(`/api/products?collection=${handle}`)
      .then((r) => r.json())
      .then((edges) => (Array.isArray(edges) ? edges.map((e: any) => e.node) : []))
      .catch(() => []);
  const best = (await get("best-sellers")).filter((n: any) => {
    if (audience === "men") return AUDIENCE_TEST.men.test(n.title) && !AUDIENCE_TEST.women.test(n.title) && !AUDIENCE_TEST.kids.test(n.title);
    return AUDIENCE_TEST[audience].test(n.title);
  });
  let picks = best.map(toPick);
  if (picks.length < 3) {
    const more = (await get(audience)).map(toPick).filter((p: Pick) => !picks.some((q) => q.handle === p.handle));
    picks = [...picks, ...more];
  }
  picksCache[audience] = picks.slice(0, 3);
  return picksCache[audience]!;
}

function BestSellers({ audience, onNavigate }: { audience: Audience; onNavigate?: () => void }) {
  const [picks, setPicks] = useState<Pick[] | null>(picksCache[audience] ?? null);
  useEffect(() => {
    let live = true;
    loadPicks(audience).then((p) => live && setPicks(p));
    return () => {
      live = false;
    };
  }, [audience]);

  return (
    <div className="nav-mega__best">
      <p className="nav-mega__title">Best sellers</p>
      <div className="nav-mega__picks">
        {(picks ?? [null, null, null]).map((p, i) =>
          p ? (
            <Link key={p.handle} href={`/products/${p.handle}`} className="nav-pick" onClick={onNavigate}>
              <span className="nav-pick__img">{p.image && <img src={`${p.image}${p.image.includes("?") ? "&" : "?"}width=240`} alt="" loading="lazy" />}</span>
              <span className="nav-pick__title">{p.title}</span>
              <span className="nav-pick__price">
                <Price amount={p.price} compareAt={p.compareAt} size="sm" showBadge={false} />
              </span>
            </Link>
          ) : (
            <span key={i} className="nav-pick nav-pick--loading" aria-hidden>
              <span className="nav-pick__img" />
            </span>
          ),
        )}
      </div>
    </div>
  );
}

function Groups({ audience, onNavigate }: { audience: Audience; onNavigate?: () => void }) {
  const menu = NAV_MENUS[audience];
  return (
    <div className="nav-mega__groups">
      <div className="nav-mega__group">
        <p className="nav-mega__title">Shop</p>
        <Link href={menu.shopAll} onClick={onNavigate}>
          All {menu.label}
        </Link>
        <Link href={c("best-sellers")} onClick={onNavigate}>
          Best Sellers
        </Link>
      </div>
      {menu.groups.map((group) => (
        <div className="nav-mega__group" key={group.title}>
          <p className="nav-mega__title">{group.title}</p>
          {group.links.map((link) => (
            <Link key={link.href} href={link.href} onClick={onNavigate}>
              {link.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

// Desktop: "Men ▾" opens a full-width panel on hover, keyboard focus or click
export function DesktopNavItem({ audience }: { audience: Audience }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const menu = NAV_MENUS[audience];

  const show = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // small delay so moving the mouse from the link down to the panel doesn't close it
  const hide = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="nav-item" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      <Link href={menu.shopAll} className="nav-item__link" aria-expanded={open} aria-haspopup="true">
        {menu.label}
        <ChevronDown size={14} aria-hidden className="nav-item__chevron" />
      </Link>
      {open && (
        <div className="nav-mega" role="region" aria-label={`${menu.label} menu`}>
          <div className="nav-mega__inner">
            <Groups audience={audience} onNavigate={() => setOpen(false)} />
            <BestSellers audience={audience} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

// Phones: each audience is an expandable section inside the menu drawer
export function MobileNavSection({ audience, onNavigate }: { audience: Audience; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const menu = NAV_MENUS[audience];
  return (
    <div className={`mnav-section${open ? " is-open" : ""}`}>
      <button className="mnav-section__head" onClick={() => setOpen(!open)} aria-expanded={open}>
        {menu.label}
        <span className="footer-group__icon" aria-hidden />
      </button>
      <div className="mnav-section__body" inert={!open}>
        <div className="mnav-section__inner">
          <Groups audience={audience} onNavigate={onNavigate} />
          {open && <BestSellers audience={audience} onNavigate={onNavigate} />}
        </div>
      </div>
    </div>
  );
}
