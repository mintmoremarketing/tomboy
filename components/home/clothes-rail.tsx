"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Price } from "@/components/product/price";

// Homepage product showcase: the lineup's garments (cut out, no model) on clip hangers along a
// clothes line you can drag or swipe. Hover names a garment; a tap slides it to the centre,
// big, with the rest blurred behind and arrows to step along. Cut-outs live in /public/v2/rail
// and are matched to their Shopify products by handle (price comes from the store).

type RailItem = { handle: string; variant?: string; img: string; name: string; colour: string; /** link when the product has no page yet */ href?: string };

const RAIL: Record<"men" | "women" | "kids", RailItem[]> = {
  men: [
    { handle: "tomboy-men-s-checks-boxer-shorts", variant: "dark burgundy box pattern", img: "/v2/rail/boxer-checks.webp", name: "Checks Boxer Shorts", colour: "Burgundy" },
    { handle: "men-s-modern-formal-ankle-socks-geometric-wolf-edition-1", variant: "Wolf Formal Sage", img: "/v2/rail/m-socks-green.webp", name: "Ankle Socks, Wolf Edition", colour: "Sage" },
    { handle: "tomboy-mens-graphic-print-brief-icon-edition", variant: "Burgundy Printed", img: "/v2/rail/brief.webp", name: "Graphic Print Brief", colour: "Plum" },
    { handle: "tomboy-men-s-sports-short-plain", img: "/v2/rail/m-shorts-olive.webp", name: "Sports Shorts", colour: "Olive" },
    { handle: "tomboy-men-s-printed-boxer-shorts", img: "/v2/rail/boxer-printed.webp", name: "Printed Boxer Shorts", colour: "White" },
    { handle: "men-s-contrast-heel-sport-no-show-socks-geometric-wolf-edition-1", variant: "Black 1", img: "/v2/rail/m-socks-wolf.webp", name: "No Show Sport Socks", colour: "Black" },
    { handle: "men-s-essential-melange-track-pants-charcoal-grey-slim-fit-joggers", img: "/v2/rail/m-trackpant-grey.webp", name: "Melange Track Pants", colour: "Charcoal" },
    { handle: "tomboy-mens-graphic-print-boxer-brief-icon-edition", variant: "Pink Printed", img: "/v2/rail/boxerbrief.webp", name: "Graphic Print Boxer Brief", colour: "Pink" },
  ],
  women: [
    { handle: "women-s-essential-soft-cotton-stretch-bikini-panty-3-pcs-pack", variant: "Red", img: "/v2/rail/w-brief-red.webp", name: "Essential Bikini Panty", colour: "Red" },
    { handle: "women-s-polka-dot-invisible-footie-socks-tomboy-edition", variant: "Tomboy Women Footie Olive White", img: "/v2/rail/w-socks-dots.webp", name: "Polka Dot Footie Socks", colour: "Sage" },
    { handle: "women-s-essential-soft-cotton-stretch-bikini-panty-3-pcs-pack", variant: "Deep Blue", img: "/v2/rail/w-brief-blue.webp", name: "Essential Bikini Panty", colour: "Blue" },
    { handle: "women-s-striped-invisible-footie-socks-tomboy-edition", variant: "Tomboy Women Striped Charcoal Pink", img: "/v2/rail/w-socks-stripe.webp", name: "Striped Footie Socks", colour: "Charcoal" },
  ],
  // Kids: the clean product renders from the Boys InnerWear / Socks catalogues
  kids: [
    { handle: "boy-s-printed-briefs", variant: "B NAVY STAR", img: "/v2/rail/k-brief-stars.webp", name: "Inner Elastic AOP Brief", colour: "Stars" },
    { handle: "", href: "/collections/kids", img: "/v2/rail/k-socks-striper.webp", name: "Striper Socks", colour: "Royal Blue" },
    { handle: "boy-s-all-over-printed-striped-boxers", variant: "B BLACK STRIPE", img: "/v2/rail/k-boxer-blackstripe.webp", name: "Striped Boxer", colour: "Black" },
    { handle: "boys-character-pants-copy", variant: "Black", img: "/v2/rail/k-pants-black.webp", name: "Plain Cuff Pants", colour: "Black" },
    { handle: "boy-s-all-over-printed-performance-striped-boxer-copy", img: "/v2/rail/k-vest-white.webp", name: "White Vest", colour: "White" },
    { handle: "", href: "/collections/kids", img: "/v2/rail/k-socks-maskot.webp", name: "Maskot Socks", colour: "Red" },
    { handle: "boy-s-all-over-print-edition-copy", variant: "B LEMON-YELLOW STRIPE", img: "/v2/rail/k-brief-lime.webp", name: "Inner Elastic Striped Brief", colour: "Lemonade" },
    { handle: "", href: "/collections/kids", img: "/v2/rail/k-socks-striker.webp", name: "Striker Socks", colour: "Black" },
    { handle: "boy-s-comfort-stretch-boxer", variant: "Red", img: "/v2/rail/k-boxer-red.webp", name: "Outer Elastic Boxer", colour: "Red" },
    { handle: "", href: "/collections/kids", img: "/v2/rail/k-socks-star.webp", name: "Star Socks", colour: "Black / White" },
  ],
};

type Prices = Record<string, { price: number; compareAt: number }>;

export function ClothesRail({
  audience,
  viewAllHref,
  embedded = false,
}: {
  audience: "men" | "women" | "kids";
  viewAllHref: string;
  /** inside the hero: no band of its own, no "see the full lineup" pill */
  embedded?: boolean;
}) {
  const items = RAIL[audience];
  const [hover, setHover] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [dir, setDir] = useState(0);
  const [prices, setPrices] = useState<Prices>({});
  const router = useRouter();
  const hrefOf = (it: RailItem) =>
    it.href ?? `/products/${it.handle}${it.variant ? `?color=${encodeURIComponent(it.variant)}` : ""}`;
  // a tap / click on a garment opens its product page
  const line = useClothesLine(items.length);

  useEffect(() => {
    setFocus(null);
    setHover(null);
  }, [audience]);

  // prices from the store, by handle (cached by the API for a minute)
  useEffect(() => {
    const missing = [...new Set(items.map((i) => i.handle))].filter((h) => h && !prices[h]);
    if (!missing.length) return;
    Promise.all(
      missing.map((h) =>
        fetch(`/api/products?handle=${encodeURIComponent(h)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((p) => (p ? [h, { price: p.price, compareAt: p.compareAt }] : null))
          .catch(() => null),
      ),
    ).then((rows) => {
      const found = Object.fromEntries(rows.filter(Boolean) as [string, Prices[string]][]);
      if (Object.keys(found).length) setPrices((prev) => ({ ...prev, ...found }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audience]);

  useEffect(() => {
    if (focus === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocus(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  function go(delta: number) {
    setDir(delta);
    setFocus((f) => (f === null ? f : (f + delta + items.length) % items.length));
  }

  const label = hover !== null ? items[hover] : null;
  const current = focus !== null ? items[focus] : null;
  const priceOf = (h: string) => prices[h];

  return (
    <section
      className={`clothes-rail${embedded ? " clothes-rail--embedded" : " v2-wave"}${focus !== null ? " is-focused" : ""}`}
      id={embedded ? undefined : "live-products"}
      aria-label="Shop the line"
    >
      <div className="clothes-rail__stage">
        <div className="clothes-rail__rack clothes-line" ref={line.stageRef} onMouseLeave={() => setHover(null)}>
          <svg className="clothes-line__rope" width="100%" height="100%" aria-hidden="true">
            <path ref={line.ropeRef} />
          </svg>
          {line.layout.w > 0 &&
            Array.from({ length: line.total }, (_, k) => {
              const it = items[k % items.length];
              return (
                <div
                  key={k}
                  ref={(el) => {
                    line.itemRefs.current[k] = el;
                  }}
                  data-line-index={k}
                  className={`clothes-line__item${hover === k % items.length ? " is-hover" : ""}`}
                  style={{ width: line.layout.itemW, transformOrigin: `${(PIVOT_X / 120) * 100}% ${(PIVOT_Y / HANGER_H) * line.layout.itemW * (HANGER_H / 120)}px` }}
                  onClick={() => {
                    if (!line.wasDrag()) router.push(hrefOf(it));
                  }}
                  onMouseEnter={() => {
                    setHover(k % items.length);
                    router.prefetch(hrefOf(it));
                  }}
                  role="button"
                  tabIndex={k < items.length ? 0 : -1}
                  aria-hidden={k >= items.length || undefined}
                  aria-label={`${it.name}, ${it.colour}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(hrefOf(it));
                    }
                  }}
                >
                  <Hanger />
                  <img src={it.img} alt="" draggable={false} decoding="async" fetchPriority={k < 3 ? "high" : "low"} />
                </div>
              );
            })}
        </div>

        {/* the hovered garment's name, under the rail like Snug */}
        <p className="clothes-rail__label" aria-live="polite">
          {label ? (
            <>
              {label.name} <span>— {label.colour}</span>
            </>
          ) : (
            " "
          )}
        </p>

        <AnimatePresence>
          {current && (
            <motion.div
              className="clothes-rail__focus"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.target === e.currentTarget && setFocus(null)}
            >
              <button type="button" className="clothes-rail__close" onClick={() => setFocus(null)}>
                Close <X size={14} aria-hidden />
              </button>
              {items.length > 1 && (
                <button type="button" className="clothes-rail__arrow" onClick={() => go(-1)} aria-label="Previous">
                  <ArrowLeft size={18} />
                </button>
              )}
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={current.img}
                  className="clothes-rail__hero"
                  initial={{ opacity: 0, x: dir * 120, scale: dir === 0 ? 0.6 : 1 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: dir * -120 }}
                  transition={{ type: "spring", stiffness: 240, damping: 26 }}
                >
                  <Hanger big />
                  <img src={current.img} alt={`${current.name}, ${current.colour}`} draggable={false} />
                </motion.div>
              </AnimatePresence>
              {items.length > 1 && (
                <button type="button" className="clothes-rail__arrow" onClick={() => go(1)} aria-label="Next">
                  <ArrowRight size={18} />
                </button>
              )}
              <div className="clothes-rail__detail">
                <h3>{current.name}</h3>
                <p>
                  {current.colour}
                  {priceOf(current.handle) && (
                    <>
                      {" · "}
                      <Price amount={priceOf(current.handle)!.price} compareAt={priceOf(current.handle)!.compareAt} size="sm" />
                    </>
                  )}
                </p>
                <Link href={current.href ?? `/products/${current.handle}`} className="clothes-rail__cta">
                  View product
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!embedded && (
        <Link href={viewAllHref} className="clothes-rail__all">
          See the full lineup
        </Link>
      )}
    </section>
  );
}

// ---- the clothes line: real hanging physics ----
// The rope is a curve fixed across the whole width (it sags in the middle). Every garment
// hangs from a hook resting ON the rope: the hook's crook sits at the rope's height wherever
// the garment is, and the garment swings like a pendulum around that crook (gravity keeps it
// upright, movement makes it swing the other way and settle). Drag or swipe the line and the
// garments slide along the rope; the line loops, so it keeps going through the whole lineup.

// hanger artwork, viewBox 0 0 120 56: the crook's centre (the pivot that rests on the rope)
const PIVOT_X = 60;
const PIVOT_Y = 5; // inner top of the crook, where the rope sits
const HANGER_H = 56;

type Phys = { angle: number; vel: number };

function useClothesLine(count: number) {
  // how far the last press moved: a click after a real drag must not open a product
  const dragDist = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const ropeRef = useRef<SVGPathElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [layout, setLayout] = useState({ w: 0, h: 0, spacing: 0, copies: 1, itemW: 0 });

  // measure the stage: spacing between hangers, how many copies of the lineup fill the loop
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      // garments sized to the line's height (so they fill it), never more than ~45% of the width;
      // the spacing follows, and the line scrolls through the rest
      const itemW = Math.min(h * 0.5, w * 0.42, 240);
      const spacing = itemW * 1.22;
      const copies = Math.max(1, Math.ceil((w + spacing * 2) / (Math.max(count, 1) * spacing)));
      setLayout({ w, h, spacing, copies, itemW });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [count]);

  const total = count * layout.copies;

  useEffect(() => {
    const stage = stageRef.current;
    const { w, h, spacing, itemW } = layout;
    if (!stage || !w || !total) return;

    const loop = total * spacing;
    const ropeTop = Math.max(34, h * 0.16); // below the card label, not hugging the top
    const sag = Math.min(w * 0.07, 34);
    const ropeY = (x: number) => ropeTop + sag * (1 - Math.pow((2 * x) / w - 1, 2));
    // the rope itself, edge to edge
    ropeRef.current?.setAttribute("d", `M0 ${ropeTop} Q ${w / 2} ${ropeTop + sag * 2} ${w} ${ropeTop}`);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phys: Phys[] = Array.from({ length: total }, () => ({ angle: 0, vel: 0 }));
    let offset = 0;
    let vel = 0; // px per frame along the rope
    let dragging = false;
    let hovering = false;
    let lastX = 0;
    let downX = 0;
    let moved = 0;
    let t = 0;
    let frame = 0;

    const scale = itemW / 120; // hanger artwork -> screen px
    const tick = () => {
      t += 1;
      if (!dragging) {
        vel *= 0.94; // friction after a flick
        if (!hovering && !reduce && Math.abs(vel) < 0.3) vel += (-0.22 - vel) * 0.02; // slow idle drift
        offset += vel;
      }
      for (let i = 0; i < total; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const x = ((((i * spacing + offset) % loop) + loop) % loop) - spacing;
        const y = ropeY(Math.min(Math.max(x, 0), w));
        // pendulum: moving the line pushes the garment back the other way; gravity pulls it
        // upright again, damped so it settles (plus a tiny breeze when idle)
        const p = phys[i];
        const breeze = reduce ? 0 : Math.sin(t / 55 + i * 1.7) * 0.8;
        const target = Math.max(-24, Math.min(24, -vel * 2.2)) + breeze;
        p.vel += (target - p.angle) * 0.06;
        p.vel *= 0.86;
        p.angle += p.vel;
        el.style.transform = `translate(${x - PIVOT_X * scale}px, ${y - PIVOT_Y * scale}px) rotate(${p.angle}deg)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const down = (e: PointerEvent) => {
      dragging = true;
      dragDist.current = 0;
      lastX = downX = e.clientX;
      moved = 0;
      vel = 0;

    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved = Math.max(moved, Math.abs(e.clientX - downX));
      dragDist.current = moved;
      offset += dx;
      vel = vel * 0.5 + dx * 0.5;
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      void e;
      dragging = false;
    };
    const enter = () => (hovering = true);
    const leave = () => (hovering = false);
    stage.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    stage.addEventListener("pointerenter", enter);
    stage.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      stage.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      stage.removeEventListener("pointerenter", enter);
      stage.removeEventListener("pointerleave", leave);
    };
    // onTap is stable enough for this (reads latest via closure on re-run)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, total, count]);

  return { stageRef, ropeRef, itemRefs, layout, total, wasDrag: () => dragDist.current > 6 };
}

// clip hanger, viewBox 0 0 120 56: crook (resting on the rope) at the top centre, then the
// stem, the bar and two clips gripping the waistband
function Hanger({ big = false }: { big?: boolean }) {
  return (
    <svg className={`clothes-rail__hanger${big ? " is-big" : ""}`} viewBox="0 0 120 56" aria-hidden="true">
      <path d="M60 31 V22 C60 17 66 15 66 9 A6 6 0 1 0 54 9" fill="none" stroke="#5A5A5A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="10" y="30" width="100" height="6" rx="3" fill="#2B2B2B" />
      <rect x="18" y="33" width="10" height="20" rx="2" fill="#3A3A3A" />
      <rect x="92" y="33" width="10" height="20" rx="2" fill="#3A3A3A" />
    </svg>
  );
}
