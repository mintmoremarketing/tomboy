"use client";

import { useSyncExternalStore } from "react";

// The shopper's cart, kept in this browser (localStorage) until checkout.
// Checkout turns it into a Shopify cart via /api/cart and sends them to Shopify's checkout.

export type CartItem = {
  variantId: string;
  handle: string;
  title: string;
  variantTitle?: string;
  image?: string | null;
  price: number;
  quantity: number;
};

const KEY = "tomboy-cart";
const OPEN_EVENT = "tomboy-cart-open";
const MAX_QTY = 10;
const listeners = new Set<() => void>();
const EMPTY: CartItem[] = [];
let items: CartItem[] = EMPTY;
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    if (Array.isArray(saved)) items = saved;
  } catch {
    items = EMPTY;
  }
}

function save(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage blocked (private mode): the cart still works for this visit
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useCart() {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return items;
    },
    () => EMPTY,
  );
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  load();
  const existing = items.find((i) => i.variantId === item.variantId);
  save(
    existing
      ? items.map((i) => (i.variantId === item.variantId ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_QTY) } : i))
      : [...items, { ...item, quantity }],
  );
}

export function setQuantity(variantId: string, quantity: number) {
  load();
  save(
    quantity <= 0
      ? items.filter((i) => i.variantId !== variantId)
      : items.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(quantity, MAX_QTY) } : i)),
  );
}

export function openCart() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onCartOpen(handler: () => void) {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
