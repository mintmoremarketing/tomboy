"use client";

// Scout nudges: short, useful messages Scout volunteers while someone shops ("You usually
// wear L in tees, and it's in stock"), each with one-tap replies that open Scout.
//
// Scout stays quiet unless spoken to: at most ONE message per page view, and only the page's
// arrival message (nudge(n, { arrival: true })), i.e. after the shopper clicked through to a
// page. Everything else pages still call (section scrolled into view, colour/size picked,
// low stock, cart tips, "welcome back"…) is dropped here while QUIET is on, so it can all
// be switched back on in one place. The bubble under the Scout orb (scout-nudge.tsx) shows
// it; "×" closes it.

export type NudgeAction =
  | { label: string; ask: string } // open Scout and ask this ("{this}" = the product on screen)
  | { label: string; sheet: "sizes" } // open Scout's "My sizes"
  | { label: string; fit: true } // open the Fit Finder (photo or measurements)
  | { label: string; href: string }; // go to a page

// small product cards Scout can show in the bubble ("goes well with it", "still thinking about…")
export type NudgeProduct = { handle: string; title: string; image: string | null; price: number; compareAt?: number };

export type Nudge = {
  id: string; // the same id is never shown twice on one page view
  text: string;
  actions?: NudgeAction[];
  products?: NudgeProduct[];
};

const EVENT = "tomboy-scout-nudge";

// Messages already shown on THIS page view. Opening a page (or coming back to it) starts
// fresh, so Scout always speaks up on arrival; within one page view nothing repeats.
let seenOnPage = new Set<string>();
let seenPath = "";

/** Only the one arrival message per page; flip to false to bring back the in-page nudges. */
const QUIET = true;

/** Show a nudge now, unless it was already shown on this page view (or QUIET drops it). */
export function nudge(n: Nudge, options?: { urgent?: boolean; arrival?: boolean }) {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  if (path !== seenPath) {
    seenPath = path;
    seenOnPage = new Set();
  }
  if (QUIET && (!options?.arrival || seenOnPage.size > 0)) return false;
  if (seenOnPage.has(n.id)) return false;
  seenOnPage.add(n.id);
  window.dispatchEvent(new CustomEvent<Nudge>(EVENT, { detail: n }));
  return true;
}

export function onNudge(handler: (n: Nudge) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<Nudge>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
