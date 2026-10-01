"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { loadProfile, loadRecentlyViewed } from "@/components/assistant/client";
import { nudge } from "@/components/assistant/nudges";
import { matchSize, productKind, savedSizeFor } from "@/components/assistant/product-nudges";
import { useCart } from "@/lib/cart";

// "Still thinking about it?": at the start of a new visit, Scout brings back the last product
// they looked at but didn't buy, with its card, only if it's still available (real data).
const VISIT_KEY = "tomboy-visit-started";
let checked = false;

export function ReturnReminder() {
  const pathname = usePathname();
  const cart = useCart();

  useEffect(() => {
    // once per visit, decided once per page load (React may run this effect twice in dev)
    if (checked) return;
    checked = true;
    let isNewVisit = false;
    try {
      isNewVisit = !window.sessionStorage.getItem(VISIT_KEY);
      window.sessionStorage.setItem(VISIT_KEY, "1");
    } catch {}
    if (!isNewVisit) return;

    const last = loadRecentlyViewed()[0];
    // not when they're already on it, or it's already in the cart
    if (!last || pathname === `/products/${last}` || pathname.startsWith("/welcome")) return;
    fetch(`/api/products?handle=${encodeURIComponent(last)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (!p?.available) return;
        if (cart.some((i) => i.handle === p.handle)) return;
        const saved = savedSizeFor(productKind(p.title), loadProfile());
        const sizes: string[] = [...new Set((p.inStock as string[]).flatMap((t) => t.split(" / ")))];
        const mine = saved && matchSize(saved.value, sizes);
        const name = p.title.replace(/^TOMBOY\s+/i, "").split(" – ")[0];
        // after the page's own hello, so this one stays on screen
        window.setTimeout(() => {
          nudge({
            id: `return-${p.handle}`,
            text: mine
              ? `Welcome back! Still thinking about the ${name}? It's still in stock in your size ${mine}.`
              : `Welcome back! Still thinking about the ${name}? It's still available.`,
            products: [{ handle: p.handle, title: p.title, image: p.image, price: p.price, compareAt: p.compareAt }],
          });
        }, 2600);
      })
      .catch(() => {});
    // once, when the visit starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
