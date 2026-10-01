"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { onCartOpen, openCart, setQuantity, useCart } from "@/lib/cart";
import { nudge } from "@/components/assistant/nudges";

const FREE_SHIPPING = 899;
const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

// Slide-in cart: opened by the bag icon or after "Add to cart" (see lib/cart.ts).
export function CartDrawer() {
  const items = useCart();
  const [open, setOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => onCartOpen(() => setOpen(true)), []);

  // Back button / phone back gesture closes the cart instead of leaving the page:
  // opening adds a history step, and going back pops it.
  useEffect(() => {
    if (!open) return;
    if (!window.history.state?.tomboyCart) {
      window.history.pushState({ ...window.history.state, tomboyCart: true }, "");
    }
    const onPop = () => setOpen(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const toFree = FREE_SHIPPING - subtotal;
  // Scout, as the cart closes: how far from free shipping, or that it's unlocked
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current || items.length === 0) return;
    wasOpen.current = false;
    const short = FREE_SHIPPING - subtotal;
    nudge(
      short > 0
        ? {
            id: `cart-free-${Math.ceil(short / 50)}`,
            text: `You're ${rupees(short)} away from free shipping. Want something small that goes with your order?`,
            actions: [{ label: "Suggest something", ask: `Suggest something under ${rupees(short + 100)} that goes with what's in my cart.` }],
          }
        : {
            id: "cart-free-unlocked",
            text: "You've unlocked free shipping. Want me to double-check the sizes in your cart before you check out?",
            actions: [{ label: "Check my sizes", ask: "Can you double-check the sizes of the items in my cart for me?" }],
          },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // closing with X / backdrop / Esc undoes the history step added on open
  const close = () => {
    if (window.history.state?.tomboyCart) window.history.back();
    else setOpen(false);
  };
  // following a link: just hide, the link's navigation replaces the page
  const hide = () => setOpen(false);

  async function checkout() {
    setCheckingOut(true);
    setError("");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: items.map((i) => ({ merchandiseId: i.variantId, quantity: i.quantity })) }),
      });
      const data = await res.json();
      if (!data.checkoutUrl) throw new Error(data.error);
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Couldn't reach checkout. Please try again.");
      setCheckingOut(false);
    }
  }

  if (!open) return null;

  return (
    <div className="cart-drawer" role="dialog" aria-modal="true" aria-label="Your cart">
      <button className="cart-drawer__backdrop" aria-label="Close cart" onClick={close} />
      <aside className="cart-drawer__panel">
        <header className="cart-drawer__head">
          <h2>
            Your cart {count > 0 && <span>({count})</span>}
          </h2>
          <button className="icon-button" aria-label="Close cart" onClick={close}>
            <X size={20} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <ShoppingBag size={36} />
            <p>Your cart is empty.</p>
            <Link className="button button--dark" href="/collections/best-sellers" onClick={hide}>
              Shop best sellers
            </Link>
          </div>
        ) : (
          <>
            <p className={`cart-drawer__ship${toFree <= 0 ? " is-free" : ""}`}>
              {toFree > 0 ? `Add ${rupees(toFree)} more for free shipping` : "You've got free shipping!"}
              <span style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }} />
            </p>
            <ul className="cart-drawer__list">
              {items.map((item) => (
                <li key={item.variantId} className="cart-line">
                  <Link href={`/products/${item.handle}`} onClick={hide} className="cart-line__img">
                    {item.image && <img src={item.image} alt="" />}
                  </Link>
                  <div className="cart-line__info">
                    <Link href={`/products/${item.handle}`} onClick={hide} className="cart-line__title">
                      {item.title}
                    </Link>
                    {item.variantTitle && item.variantTitle !== "Default Title" && <small>{item.variantTitle}</small>}
                    <div className="cart-line__row">
                      <div className="cart-line__qty">
                        <button
                          aria-label={item.quantity === 1 ? "Remove" : "Decrease quantity"}
                          onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                        >
                          {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          aria-label="Increase quantity"
                          disabled={item.quantity >= 10}
                          onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <strong>{rupees(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="cart-drawer__foot">
              <div className="cart-drawer__total">
                <span>Subtotal</span>
                <strong>{rupees(subtotal)}</strong>
              </div>
              <small>Shipping and taxes calculated at checkout.</small>
              {/* the last worry before paying: what if it doesn't fit */}
              <p className="cart-drawer__reassure">
                <span>Scout</span> Wrong size? No stress: exchanges are easy within 7 days.
              </p>
              {error && <p className="cart-drawer__error">{error}</p>}
              <button className="button button--dark button--full" onClick={checkout} disabled={checkingOut}>
                {checkingOut ? "Opening checkout…" : "Checkout"}
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

// Bag icon with the item count, for headers.
export function CartButton({ className = "icon-button" }: { className?: string }) {
  const items = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <button
      className={`${className} cart-button`}
      aria-label={count ? `Cart, ${count} item${count > 1 ? "s" : ""}` : "Cart"}
      title="Cart"
      onClick={openCart}
    >
      <ShoppingBag size={20} />
      {count > 0 && <span className="cart-button__count">{count > 9 ? "9+" : count}</span>}
    </button>
  );
}
