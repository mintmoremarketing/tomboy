"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { addToCart, openCart, useCart } from "@/lib/cart";

// After leaving a product page, a pill at the bottom brings it back: its photos, price and
// Buy now (adds it to the cart and opens checkout). Remembered for this visit only.

export type ResumeProduct = {
  handle: string;
  title: string;
  variantId: string;
  variantTitle?: string;
  size?: string;
  price: number;
  images: string[];
};

const KEY = "tomboy-resume";

// called by the product page whenever the shopper changes the selected variant
export function rememberProduct(product: ResumeProduct) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(product));
  } catch {
    // storage blocked: no pill, nothing else breaks
  }
}

function forget() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {}
}

export function ResumePill() {
  const pathname = usePathname();
  const cart = useCart();
  const [product, setProduct] = useState<ResumeProduct | null>(null);

  const hidden = pathname.startsWith("/products/") || pathname.startsWith("/welcome");

  // note in-site navigation, so the product page's back arrow knows there's a page to go back to
  // (document.referrer doesn't change on client-side navigation)
  const [firstPath] = useState(pathname);
  useEffect(() => {
    if (pathname === firstPath) return;
    try {
      window.sessionStorage.setItem("tomboy-navigated", "1");
    } catch {}
  }, [pathname, firstPath]);

  useEffect(() => {
    if (hidden) {
      setProduct(null);
      return;
    }
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(KEY) || "null");
      setProduct(saved?.variantId ? saved : null);
    } catch {
      setProduct(null);
    }
  }, [pathname, hidden]);

  // The pill covers the whole checkout: this product (unless it's already in the cart) plus the cart.
  const inCart = !!product && cart.some((i) => i.variantId === product.variantId);
  const lines = [
    ...(product && !inCart ? [{ key: product.variantId, image: product.images[0] ?? null, price: product.price, quantity: 1 }] : []),
    ...cart.map((i) => ({ key: i.variantId, image: i.image ?? null, price: i.price, quantity: i.quantity })),
  ];
  // count products (matches the photos and "+N"); quantities still count toward the total
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const visible = !!product && !hidden && lines.length > 0;

  // the homepage's own sticky "Shop" pill steps aside while this one shows
  useEffect(() => {
    document.body.toggleAttribute("data-resume-pill", visible);
    return () => document.body.removeAttribute("data-resume-pill");
  }, [visible]);

  if (!visible || !product) return null;

  function buyNow() {
    if (!product) return;
    if (!inCart) {
      addToCart({
        variantId: product.variantId,
        handle: product.handle,
        title: product.title,
        variantTitle: product.variantTitle,
        image: product.images[0] ?? null,
        price: product.price,
      });
    }
    forget();
    openCart();
  }

  function dismiss() {
    forget();
    setProduct(null);
  }

  // two photos, then "+N" for the rest
  const shown = lines.slice(0, 2);
  const more = lines.length - shown.length;
  const single = lines.length === 1 && itemCount === 1;

  const summary = (
    <>
      <span className="resume-pill__photos" aria-hidden>
        {shown.map((l, i) => (
          <span className="resume-pill__photo" key={l.key} style={{ zIndex: 3 - i }}>
            {l.image && <img src={l.image} alt="" />}
          </span>
        ))}
        {more > 0 && <span className="resume-pill__photo resume-pill__more">+{more}</span>}
      </span>
      <span className="resume-pill__text">
        <small>{single ? product.title : `${lines.length} products · total`}</small>
        <strong>
          ₹{Math.round(total).toLocaleString("en-IN")}
          {single && product.size && <em> · {product.size}</em>}
        </strong>
      </span>
    </>
  );

  return (
    <div className="resume-pill" role="region" aria-label="Your checkout">
      {single ? (
        <Link href={`/products/${product.handle}`} className="resume-pill__product">
          {summary}
        </Link>
      ) : (
        <button className="resume-pill__product" onClick={openCart} aria-label="View cart">
          {summary}
        </button>
      )}
      <button className="button button--dark resume-pill__buy" onClick={buyNow}>
        Buy Now
      </button>
      <button className="resume-pill__close" onClick={dismiss} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}
