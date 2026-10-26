"use client";

import { saveAudience } from "@/lib/audience";
import {
  ArrowRight,
  BellRing,
  Tag,
  ChevronDown,
  ChevronLeft,
  CircleUserRound,
  Menu,
  Maximize2,
  RotateCw,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { Price } from "@/components/product/price";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { StretchHeadline, type HeadlineMood } from "@/components/block/stretch-headline";
import { CraftStorySection } from "@/components/block/text-fill-animation";
import { MagneticImageTrail } from "@/components/block/magnetic-image-trail";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { LiveOrb } from "@/components/ui/live-orb";
import { StartingGateway } from "@/components/block/starting-gateway";
import { HeroCharacter } from "@/components/block/hero-character";
import { ComfortBand } from "@/components/block/comfort-band";
import { SwipeDots } from "@/components/block/swipe-dots";
import { CartButton } from "@/components/cart/cart-drawer";
import { SiteHeader, heroHighlightColor } from "@/components/layout/site-header";
import { openFitFinder } from "@/components/fit/fit-finder";
import { nudge, type Nudge } from "@/components/assistant/nudges";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { TrackOrder } from "@/components/track-order";
import { ClothesRail } from "@/components/home/clothes-rail";
import { FeaturedCard } from "@/components/home/featured-card";
import { BambooBand, BambooPill, BambooSeal } from "@/components/kids/bamboo";
import { Mascot } from "@/components/kids/mascot";
import { isBamboo } from "@/lib/bamboo";
import {
  audienceContent,
  brandCards,
  creatorPlaceholders,
  offerTicker,
  productPlaceholders,
  reviewPlaceholders,
  shopEssentials,
} from "@/data/homepage";

type Audience = "men" | "women" | "kids";

// Scout's one message on the homepage: a few seconds after landing, for the chosen lineup
const GREETING: Record<Audience, Nudge> = {
  men: {
    id: "home-hello-men",
    text: "Hey, I'm Scout. Need a hand finding your size?",
    actions: [{ label: "Find my size", fit: true }],
  },
  women: {
    id: "home-hello-women",
    text: "Hi, I'm Scout. Need a hand finding your size?",
    actions: [{ label: "Find my size", fit: true }],
  },
  kids: {
    id: "home-hello-kids",
    text: "Hi, I'm Scout. Tell me their age and I'll pick the right size.",
    actions: [{ label: "Size by age", fit: true }],
  },
};

// Shopify's CDN resizes on the fly: ask for roughly the size we show instead of the original
const sized = (url: string | undefined, width: number) =>
  url ? `${url}${url.includes("?") ? "&" : "?"}width=${width}` : undefined;

export type HomeData = {
  /** live products per lineup (Shopify collection edges), fetched on the server */
  products: Partial<Record<Audience, any[]>>;
  /** Shop Essentials photo per card, per lineup */
  photos: Partial<Record<Audience, Record<string, string | null>>>;
};

export default function Home({ initial, initialAudience }: { initial: HomeData; initialAudience?: Audience | null }) {
  const [audience, setAudience] = useState<Audience>(initialAudience ?? "men");
  // false until the saved audience is read, so the hero doesn't flash Men first
  const [audienceReady, setAudienceReady] = useState(!!initialAudience);
  // null = not known yet (server render / before localStorage is read). The welcome screen is
  // in the server HTML then, shown instantly by CSS for first-time visitors only (see the
  // inline script in app/layout.tsx), instead of popping up after the JavaScript loads.
  const [showGateway, setShowGateway] = useState<boolean | null>(initialAudience ? false : null);
  // Live Shopify products, fetched per audience collection and cached
  const [realProducts, setRealProducts] = useState<Partial<Record<Audience, any[]>>>(initial.products);

  useEffect(() => {
    const saved = window.localStorage.getItem("tomboy-audience") as Audience | null;
    if (saved === "men" || saved === "women" || saved === "kids") {
      setAudience(saved);
      setShowGateway(false);
      // older visits only stored it locally: mirror it into the cookie for next time
      if (saved !== initialAudience) saveAudience(saved);
    } else {
      setShowGateway(true);
    }
    setAudienceReady(true);
  }, []);

  // the page background follows the lineup (Kids: the pink/blue dither wave)
  useEffect(() => {
    document.documentElement.setAttribute("data-lineup", audience);
  }, [audience]);

  useEffect(() => {
    if (!audienceReady || realProducts[audience]) return;
    const collection = audienceContent[audience].collectionHandle;
    fetch(`/api/products?collection=${encodeURIComponent(collection)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRealProducts((prev) => ({ ...prev, [audience]: data }));
        }
      })
      .catch(console.error);
  }, [audience, audienceReady, realProducts]);

  function switchAudience(value: Audience) {
    setAudience(value);
    saveAudience(value);
  }

  // ---- Scout: one short message, a few seconds after landing (not on scroll) ----
  useEffect(() => {
    if (!audienceReady || showGateway) return;
    const t = window.setTimeout(() => nudge(GREETING[audience], { arrival: true }), 4000);
    return () => window.clearTimeout(t);
    // greet once, in the lineup they arrived in
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceReady, showGateway]);


  function handleGatewayChoice(value: Audience) {
    setAudience(value);
    setShowGateway(false);
    saveAudience(value);
  }

  const products = useMemo(() => {
    const live = realProducts[audience];
    if (live && live.length > 0) {
      return live.map((p) => ({
        audience,
        title: p.node.title,
        handle: p.node.handle,
        type: p.node.productType || "Product",
        price: `₹${Math.round(Number(p.node.priceRange.minVariantPrice.amount) || 0).toLocaleString("en-IN")}`,
        amount: p.node.priceRange.minVariantPrice.amount,
        compareAt: p.node.compareAtPriceRange?.minVariantPrice?.amount,
        color: "cream",
        imageUrl: sized(p.node.images.edges[0]?.node.url, 600),
        bamboo: isBamboo(p.node),
      }));
    }
    return productPlaceholders.filter(
      (item) => item.audience === audience || item.audience === "all"
    );
  }, [audience, realProducts]);

  return (
    <main>
      <AnnouncementTicker />
      <SiteHeader audience={audience} onSelectAudience={switchAudience} products={products} />
      <Hero audience={audience} ready={audienceReady} onSelectAudience={switchAudience} />
      <ComfortBand />
      {/* Kids only: the bamboo story */}
      {audience === "kids" && <BambooBand />}
      <Essentials audience={audience} initialPhotos={initial.photos} />
      {/* v2: products stuck on the wavy edges between sections, spinning as you scroll */}
      {audience !== "kids" && <EdgeSticker src={EDGE_STICKERS[audience][0]} place="right" sp={0.11} tilt="10deg" />}
      <CraftStorySection audience={audience} initialPhotos={initial.photos} />
      <ActionStrip />
      {audience === "kids" && <Mascot name="grandparents" place="right" phase={2.2} />}
      <BrandStory />
      {audience === "kids" && <Mascot name="betty" place="left" phase={0.7} />}
      <TrackOrder />
      {audience === "kids" && <Mascot name="fido" place="right" phase={1.4} />}
      <div className="v2-band v2-wave-top">
        <ReviewTemplates />
      </div>
      {audience !== "kids" && (
        <EdgeSticker src={EDGE_STICKERS[audience][2]} place="right" sp={0.14} tilt="12deg" />
      )}
      <StayUpdated />

      <StartingGateway
        isOpen={showGateway !== false}
        pending={showGateway === null}
        onSelectAudience={handleGatewayChoice}
      />
    </main>
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
  /** Position inside the phone-width sticker board (see globals.css). */
  mobileLeft: string;
  mobileTop: string;
  rotation: number;
}

// Desktop: two columns of three framing the hero character (centred at 74%).
const initialStickers: StickerItem[] = [
  {
    id: "og",
    type: "text",
    content: "TOMBOY OG",
    emoji: "🍒",
    bgColor: "#FFFFFF",
    textColor: "#0A0A0A",
    shadowColor: "#FF3344",
    defaultLeft: "50%",
    defaultTop: "14%",
    mobileLeft: "0%",
    mobileTop: "2%",
    rotation: -12,
  },
  {
    id: "softness",
    type: "text",
    content: "TOO SOFT TO TAKE OFF",
    emoji: "💥",
    bgColor: "#2E7CF6",
    textColor: "#FFFFFF",
    shadowColor: "#0A0A0A",
    defaultLeft: "81%",
    defaultTop: "8%",
    mobileLeft: "calc(100% - 196px)",
    mobileTop: "24%",
    rotation: 12,
  },
  {
    id: "cotton",
    type: "text",
    content: "100% COMBED COTTON",
    emoji: "🌿",
    bgColor: "#FF3399",
    textColor: "#FFFFFF",
    shadowColor: "#0A0A0A",
    defaultLeft: "47.5%",
    defaultTop: "46%",
    mobileLeft: "0%",
    mobileTop: "44%",
    rotation: -6,
  },
  {
    id: "waistband",
    type: "text",
    content: "ANTI-PINCH BAND",
    emoji: "☁️",
    bgColor: "#FFE500",
    textColor: "#0A0A0A",
    shadowColor: "#0A0A0A",
    defaultLeft: "49%",
    defaultTop: "86%",
    mobileLeft: "0%",
    mobileTop: "80%",
    rotation: 6,
  },
  {
    id: "chafe",
    type: "text",
    content: "ZERO CHAFE",
    emoji: "🎯",
    bgColor: "#52F264",
    textColor: "#0A0A0A",
    shadowColor: "#0A0A0A",
    defaultLeft: "84%",
    defaultTop: "46%",
    mobileLeft: "calc(100% - 128px)",
    mobileTop: "58%",
    rotation: -3,
  },
  {
    id: "fit",
    type: "text",
    content: "INDIAN BODY FIT",
    emoji: "🇮🇳",
    bgColor: "#FF3344",
    textColor: "#FFFFFF",
    shadowColor: "#00F5D4",
    defaultLeft: "81%",
    defaultTop: "82%",
    mobileLeft: "calc(100% - 156px)",
    mobileTop: "84%",
    rotation: 14,
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
  const [scale, setScale] = useState(1);
  const [isTransforming, setIsTransforming] = useState(false);
  const [zIndex, setZIndex] = useState(15);

  const stickerRef = useRef<HTMLDivElement>(null);
  const dragOriginRef = useRef({ mouseX: 0, mouseY: 0, startDx: 0, startDy: 0 });
  const rotateOriginRef = useRef({ cx: 0, cy: 0 });
  const transformOriginRef = useRef({ cx: 0, cy: 0, startDist: 0, startScale: 1, startAngle: 0, startRotation: 0 });

  // Drag Sticker Body
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".sticker-rotate-handle-wrapper") || (e.target as HTMLElement).closest(".sticker-scale-handle-wrapper")) return;

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

    // Transform Sticker via Handle (Scale & Rotate)
  const onTransformPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(sticker.id);
    setIsTransforming(true);
    setZIndex(100 + (Date.now() % 1000));

    if (stickerRef.current) {
      const rect = stickerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const startDist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
      transformOriginRef.current = { cx, cy, startDist, startScale: scale, startAngle, startRotation: rotation };
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onTransformPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTransforming) return;
    const { cx, cy, startDist, startScale, startAngle, startRotation } = transformOriginRef.current;
    if (startDist === 0) return;
    
    const currentDist = Math.hypot(e.clientX - cx, e.clientY - cy);
    const newScale = startScale * (currentDist / startDist);
    setScale(Math.max(0.3, Math.min(newScale, 3.5)));
    
    const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
    const angleDelta = (currentAngle - startAngle) * (180 / Math.PI);
    setRotation(startRotation + angleDelta);
  };

  const onTransformPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTransforming) {
      setIsTransforming(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  return (
    <div
      ref={stickerRef}
      className={`draggable-sticker ${isDragging ? "is-dragging" : ""} ${isSelected || isTransforming ? "is-selected" : ""}`}
      style={{
        "--x": sticker.defaultLeft,
        "--y": sticker.defaultTop,
        "--mx": sticker.mobileLeft,
        "--my": sticker.mobileTop,
        transform: `translate3d(${delta.x}px, ${delta.y}px, 0) rotate(${rotation}deg) scale(${isDragging ? scale * 1.05 : scale})`,
        backgroundColor: sticker.bgColor,
        color: sticker.textColor,
        boxShadow: `4px 4px 0px ${sticker.shadowColor}`,
        zIndex: isDragging || isTransforming ? 999 : isSelected ? 60 : zIndex,
        touchAction: "none",
      } as React.CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(sticker.id);
      }}
    >
      
      <div
        className="sticker-scale-handle-wrapper"
        onPointerDown={onTransformPointerDown}
        onPointerMove={onTransformPointerMove}
        onPointerUp={onTransformPointerUp}
        onPointerCancel={onTransformPointerUp}
      >
        <div className={`sticker-scale-knob ${isTransforming ? "is-scaling" : ""}`} title="Drag to transform">
          <Maximize2 size={12} strokeWidth={2.5} style={{ transform: "rotate(90deg)" }} />
        </div>
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

// Phone hero poster card: chosen to contrast with each character's outfit
// (the kid's green shirt would vanish on the green accent, so Kids gets yellow).
const heroStageColor: Record<Audience, string> = {
  men: "#00F5D4",
  women: "#FF8AD8",
  kids: "#FFE500",
};


const headlineMood: Record<Audience, HeadlineMood> = {
  men: "snap",
  women: "settle",
  kids: "bounce",
};

// Wraps the first occurrence of `phrase` inside `text` in a PointerHighlight.
function HighlightedText({
  text,
  phrase,
  color,
  delay,
}: {
  text: string;
  phrase?: string;
  color: string;
  delay?: number;
}) {
  const index = phrase ? text.indexOf(phrase) : -1;
  if (!phrase || index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <PointerHighlight color={color} delay={delay} containerClassName="ph-inline">
        {phrase}
      </PointerHighlight>
      {text.slice(index + phrase.length)}
    </>
  );
}

// v2 hero: underwear cut out of the store's product photos, floating around the pixel wordmark,
// matching the chosen lineup (men's / women's / kids')
// (positions per screen size live in app/v2.css)
// sp = how fast (and which way) each one spins as the page scrolls, in degrees per pixel
// Illustrated underwear (flat "men's underwear" pattern, cut into stickers, /public/v2/uw).
// x/y = position in the hero stage (desktop), mx/my = on phones; w = width; r = tilt;
// sp = spin per scrolled pixel.
type Floater = { src: string; x: string; y: string; mx: string; my: string; w: string; r: string; delay: string; sp: number };
const uw = (n: string) => `/v2/uw/${n}.webp`;
const FLOATING_BOXERS: Record<Audience, Floater[]> = {
  men: [
    { src: uw("boxer-lips"), x: "-24%", y: "-6%", mx: "-6%", my: "2%", w: "clamp(92px, 10vw, 170px)", r: "-14deg", delay: "0s", sp: 0.1 },
    { src: uw("brief-blueprint"), x: "24%", y: "-16%", mx: "64%", my: "0%", w: "clamp(78px, 8vw, 130px)", r: "10deg", delay: "-1.2s", sp: -0.14 },
    { src: uw("boxer-triangles"), x: "96%", y: "-10%", mx: "70%", my: "70%", w: "clamp(92px, 10vw, 170px)", r: "12deg", delay: "-2.4s", sp: 0.12 },
    { src: uw("brief-navy"), x: "104%", y: "40%", mx: "-4%", my: "74%", w: "clamp(76px, 8vw, 128px)", r: "-10deg", delay: "-0.6s", sp: -0.1 },
    { src: uw("boxer-chilli"), x: "-26%", y: "58%", mx: "76%", my: "36%", w: "clamp(88px, 9vw, 150px)", r: "8deg", delay: "-3.1s", sp: 0.16 },
    { src: uw("brief-white"), x: "84%", y: "104%", mx: "-8%", my: "40%", w: "clamp(70px, 7vw, 116px)", r: "-6deg", delay: "-1.8s", sp: -0.12 },
  ],
  women: [
    { src: uw("boxer-hearts"), x: "-24%", y: "-6%", mx: "-6%", my: "2%", w: "clamp(92px, 10vw, 170px)", r: "-12deg", delay: "0s", sp: 0.1 },
    { src: uw("brief-pink"), x: "24%", y: "-16%", mx: "64%", my: "0%", w: "clamp(80px, 8vw, 132px)", r: "10deg", delay: "-1.2s", sp: -0.14 },
    { src: uw("thong-orange"), x: "96%", y: "-10%", mx: "70%", my: "70%", w: "clamp(80px, 8.5vw, 140px)", r: "14deg", delay: "-2.4s", sp: 0.12 },
    { src: uw("bikini-green"), x: "104%", y: "40%", mx: "-4%", my: "74%", w: "clamp(76px, 8vw, 128px)", r: "-10deg", delay: "-0.6s", sp: -0.1 },
    { src: uw("brief-cream"), x: "-26%", y: "58%", mx: "76%", my: "36%", w: "clamp(76px, 8vw, 128px)", r: "8deg", delay: "-3.1s", sp: 0.16 },
    { src: uw("brief-grey"), x: "84%", y: "104%", mx: "-8%", my: "40%", w: "clamp(70px, 7vw, 116px)", r: "-6deg", delay: "-1.8s", sp: -0.12 },
  ],
  kids: [
    { src: uw("boxer-triangles"), x: "-24%", y: "-6%", mx: "-6%", my: "2%", w: "clamp(92px, 10vw, 170px)", r: "-12deg", delay: "0s", sp: 0.1 },
    { src: uw("brief-blueprint"), x: "24%", y: "-16%", mx: "68%", my: "2%", w: "clamp(78px, 8vw, 130px)", r: "10deg", delay: "-1.2s", sp: -0.14 },
    { src: uw("boxer-chilli"), x: "104%", y: "40%", mx: "-4%", my: "74%", w: "clamp(88px, 9vw, 150px)", r: "-8deg", delay: "-0.6s", sp: 0.12 },
    { src: uw("brief-white"), x: "-26%", y: "58%", mx: "76%", my: "36%", w: "clamp(70px, 7vw, 116px)", r: "8deg", delay: "-3.1s", sp: -0.1 },
  ],
};

// products stuck on the section edges, per lineup (right edge, centre, right edge)
const EDGE_STICKERS: Record<Audience, [string, string, string]> = {
  men: ["/v2/boxerbrief.webp", "/v2/boxer-checks.webp", "/v2/boxer-grey.webp"],
  women: ["/v2/w-brief-blue.webp", "/v2/w-bra.webp", "/v2/w-brief-red.webp"],
  kids: ["/v2/k-boxer-aqua.webp", "/v2/k-brief-print.webp", "/v2/k-boxer-stripe.webp"],
};

// v2: a product cut-out sitting on the wavy line where two sections meet. Zero-height, so it
// doesn't move the layout; the image straddles the line and spins with the page scroll.
function EdgeSticker({ src, place, sp, tilt }: { src: string; place: "left" | "center" | "right"; sp: number; tilt: string }) {
  return (
    <div className={`edge-sticker edge-sticker--${place}`} aria-hidden="true">
      <img src={src} alt="" draggable={false} style={{ "--sp": sp, "--br": tilt } as React.CSSProperties} />
    </div>
  );
}

// v2 hero: the person for each lineup (same cut-outs as the welcome screen)
const HERO_PEOPLE: Record<Audience, string> = {
  men: "/v2/gateway-men-full.webp",
  women: "/v2/gateway-women-full.webp",
  kids: "/v2/gateway-kids-full.webp",
};

// Phone swipe order matches the welcome lineup: women · men · kids
const swipeOrder: Audience[] = ["women", "men", "kids"];

function Hero({
  audience,
  ready,
  onSelectAudience,
}: {
  audience: Audience;
  ready: boolean;
  onSelectAudience: (value: Audience) => void;
}) {
  const content = audienceContent[audience];
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  // direction of the last swipe/dot tap, remembered with its target so a
  // dropdown switch afterwards falls back to the vertical pop animation
  const [swipe, setSwipe] = useState<{ to: Audience; dir: number } | null>(null);
  const direction = swipe && swipe.to === audience ? swipe.dir : 0;
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const actionsRef = useRef<HTMLDivElement>(null);

  // v2: the floating products (hero + EdgeStickers) spin as the page scrolls, each at its own speed;
  // --scroll on <html> drives them all
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => document.documentElement.style.setProperty("--scroll", String(window.scrollY)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  const [showStickyShop, setShowStickyShop] = useState(false);

  function goTo(target: Audience) {
    if (target === audience) return;
    const dir = Math.sign(swipeOrder.indexOf(target) - swipeOrder.indexOf(audience));
    setSwipe({ to: target, dir });
    onSelectAudience(target);
  }

  function step(delta: number) {
    const index = (swipeOrder.indexOf(audience) + delta + swipeOrder.length) % swipeOrder.length;
    const target = swipeOrder[index];
    setSwipe({ to: target, dir: delta });
    onSelectAudience(target);
  }

  function onStagePointerDown(e: React.PointerEvent) {
    // swiping the clothes line moves the garments, not the lineup
    if ((e.target as HTMLElement).closest(".clothes-line")) {
      pointerStart.current = null;
      return;
    }
    pointerStart.current = { x: e.clientX, y: e.clientY };
  }

  function onStagePointerUp(e: React.PointerEvent) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || !window.matchMedia("(max-width: 768px)").matches) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    // swipe left → next audience, swipe right → previous
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) step(dx < 0 ? 1 : -1);
  }

  // Sticky "Shop …" pill (phones): shows once the hero buttons scroll away,
  // hides again over the sign-up section and the footer (it would cover them).
  useEffect(() => {
    const actions = actionsRef.current;
    if (!actions) return;
    const endZones = [document.querySelector("#stay-updated"), document.querySelector("footer.site-footer")].filter(
      (el): el is Element => !!el,
    );
    let actionsVisible = true;
    const zoneVisible = new Map<Element, boolean>();
    const update = () => setShowStickyShop(!actionsVisible && ![...zoneVisible.values()].some(Boolean));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === actions) {
          // only count it as gone once it has scrolled up past the viewport
          actionsVisible = entry.isIntersecting || entry.boundingClientRect.top > 0;
        } else {
          zoneVisible.set(entry.target, entry.isIntersecting);
        }
      }
      update();
    });
    observer.observe(actions);
    endZones.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      // Kids gets the Tomboy Junior poster colours (cyan over pink) instead of the sky
      className={`hero-section-wrapper${audience === "kids" ? " hero--bamboo" : ` hero--pants hero--pants-${audience}`}`}
    >
      {/* v2 hero: just the giant pixel TOMBOY with products floating around it,
          one line of copy and the two buttons (the busy character + sticker board is gone) */}
      {/* hero: a bento grid on the lineup's pattern. Copy card (tagline, buttons, lineup dots),
          the lineup's person, the clothes line with its products, and one highlight card.
          Swipe left/right (phones) or tap the dots to switch Men / Women / Kids. */}
      <div
        className={`hero v2-hero bento-hero bento-hero--${audience}`}
        ref={stageRef}
        onPointerDown={onStagePointerDown}
        onPointerUp={onStagePointerUp}
        onPointerCancel={() => (pointerStart.current = null)}
      >
        {/* the big tile: the lineup's person on its pattern, with the tagline and buttons inside */}
        <div className="bento-card bento-card--person">
          {/* the copy sits inside the photo tile, the person stands beside it */}
          <div className="bento-person__copy">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={audience}
                className="bento-copy"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="bento-copy__eyebrow">{audience === "kids" ? "Tomboy Junior" : content.kicker}</p>
                <h1 className="bento-copy__tag">
                  {content.headline.split("\n").map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h1>
                <p className="bento-copy__body">{content.body}</p>
              </motion.div>
            </AnimatePresence>

            <div className="hero__actions v2-hero__actions" ref={actionsRef}>
              <Link className="button button--dark" href={`/collections/${content.collectionHandle}`}>
                Shop {content.label} <ArrowRight size={18} />
              </Link>
              {/* opens the Fit Finder: sizes from a photo or measurements, saved for Scout */}
              <button type="button" className="button button--light" onClick={() => openFitFinder(audience)}>
                Know the Fit
              </button>
            </div>

            <div className="hero-swipe-dots v2-hero__dots" role="tablist" aria-label="Choose lineup">
              {swipeOrder.map((option) => (
                <button
                  key={option}
                  role="tab"
                  aria-selected={option === audience}
                  aria-label={`Show ${audienceContent[option].label}`}
                  className={`hero-swipe-dot ${option === audience ? "is-active" : ""}`}
                  style={{ "--dot": heroHighlightColor[option] } as React.CSSProperties}
                  onClick={() => goTo(option)}
                />
              ))}
            </div>
          </div>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.img
              key={audience}
              src={HERO_PEOPLE[audience]}
              alt=""
              aria-hidden="true"
              className="bento-person__img"
              draggable={false}
              fetchPriority="high"
              loading="eager"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
            />
          </AnimatePresence>
        </div>

        {/* the clothes line with this lineup's products */}
        <div className="bento-card bento-card--line">
          <p className="bento-card__label">On the line</p>
          <ClothesRail audience={audience} viewAllHref={`/collections/${content.collectionHandle}`} embedded />
        </div>

        {/* a bestseller from this lineup, with its selling points */}
        <FeaturedCard audience={audience} />
      </div>

      <AnimatePresence>
        {showStickyShop && (
          <motion.div
            className="sticky-shop"
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <Link className="sticky-shop__pill" href={`/collections/${content.collectionHandle}`}>
              Shop {content.label} <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
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

function Essentials({
  audience,
  initialPhotos,
}: {
  audience: Audience;
  initialPhotos: Partial<Record<Audience, Record<string, string | null>>>;
}) {
  const items = shopEssentials[audience];
  // one Shopify product photo per card, keyed by collection handle; cached per audience
  const [photos, setPhotos] = useState<Partial<Record<Audience, Record<string, string | null>>>>(initialPhotos);

  useEffect(() => {
    if (photos[audience]) return;
    fetch(`/api/essentials?audience=${audience}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setPhotos((prev) => ({ ...prev, [audience]: data }));
      })
      .catch(console.error);
  }, [audience, photos]);

  // phones have no hover, so each card lights up in its colour as it scrolls into the middle of the screen
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !window.matchMedia("(max-width: 768px)").matches) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".essential-card"));
    cards.forEach((card) => card.classList.remove("is-lit"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-lit");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -35% 0px", threshold: 0.6 },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [audience]);

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
      <div className="essentials-grid" ref={gridRef}>
        {items.map((item: any) => (
          <Link
            className="essential-card essential-card--photo"
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
            <span
              className={`essential-card__media ${
                photos[audience] && !photos[audience]![item.href.split("/").pop() as string] ? "is-empty" : ""
              }`}
              aria-hidden="true"
            >
              {photos[audience]?.[item.href.split("/").pop() as string] && (
                <img
                  src={photos[audience]![item.href.split("/").pop() as string] as string}
                  alt=""
                  loading="lazy"
                  onLoad={(e) => e.currentTarget.classList.add("is-loaded")}
                />
              )}
            </span>
            <span className="essential-card__text">
              <span className="essential-card__title">{item.title}</span>
              <small>{item.note}</small>
            </span>
          </Link>
        ))}
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

      </div>

      {/* endless strip: the creators repeat so it fills any screen width (even 4K) and loops
          seamlessly; the copies are hidden from screen readers and keyboard */}
      <div className="creator-marquee">
        <div className="creator-marquee__track">
          {Array.from({ length: 4 }).flatMap((_, copy) =>
            creatorPlaceholders.map((creator) => (
              <a
                href="https://instagram.com/houseoftomboy"
                target="_blank"
                rel="noopener noreferrer"
                className="creator-story-item"
                key={`${copy}-${creator.name}`}
                aria-hidden={copy > 0 || undefined}
                tabIndex={copy > 0 ? -1 : undefined}
              >
                <div className="creator-story-ring">
                  <img src={creator.imageUrl} alt={copy > 0 ? "" : creator.name} className="creator-story-img" loading="lazy" />
                </div>
                <span className="creator-story-name">{creator.name}</span>
              </a>
            )),
          )}
        </div>
      </div>
    </section>
  );
}

function BrandStory() {
  const rowRef = useRef<HTMLDivElement>(null);
  return (
    <section className="section brand-story" id="story">
      <div className="section-heading">
        <p className="eyebrow">Get to know us better</p>
        <h2>A closer look at Tomboy.</h2>
      </div>
      <div className="pop-story-grid" ref={rowRef}>
        {brandCards.map((card, index) => (
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
              <p>
                <HighlightedText
                  text={card.body}
                  phrase={card.highlight}
                  color={card.color}
                  delay={index * 0.7}
                />
              </p>
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
      <SwipeDots rowRef={rowRef} count={brandCards.length} />
    </section>
  );
}

function ReviewTemplates() {
  const rowRef = useRef<HTMLDivElement>(null);
  return (
    <section className="section section--cream" id="reviews">
      <div className="section-heading">
        <p className="eyebrow">Verified Reviews</p>
        <h2>Customer Comfort Reviews</h2>
        <p>Authentic feedback on fit, soft breathable fabric, and durability.</p>
      </div>
      <div className="review-grid" ref={rowRef}>
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
      <SwipeDots rowRef={rowRef} count={reviewPlaceholders.length} />
    </section>
  );
}

// Newsletter sign-up: adds the email to the store's Shopify customers as subscribed to marketing
const STAY_PERKS = [
  { icon: Sparkles, label: "New drops first", bg: "#00F5D4", tilt: "-3deg" },
  { icon: BellRing, label: "Your size back in stock", bg: "#FF3399", tilt: "2deg", light: true },
  { icon: Tag, label: "Members-only offers", bg: "#52F264", tilt: "-1.5deg" },
];

// Newsletter sign-up in the site's sticker style; adds the email to the store's Shopify
// customers as subscribed to marketing (/api/subscribe)
function StayUpdated() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "already" | "error">("idle");
  const [error, setError] = useState("");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState(data.status === "already" ? "already" : "done");
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  }

  return (
    <section className="tomboy-list" id="stay-updated" aria-labelledby="tomboy-list-title">
      <motion.div
        className="tomboy-list__inner"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="tomboy-list__eyebrow">The Tomboy list</p>
        <h2 id="tomboy-list-title">Be first in line.</h2>
        <p className="tomboy-list__lead">One email when it matters: new drops, your size back in stock, and offers we don&apos;t post anywhere else.</p>

        <ul className="tomboy-list__perks">
          {STAY_PERKS.map((p) => (
            <li
              key={p.label}
              className={p.light ? "is-light" : undefined}
              style={{ "--sticker": p.bg, "--tilt": p.tilt } as React.CSSProperties}
            >
              <p.icon size={18} strokeWidth={2.4} aria-hidden />
              {p.label}
            </li>
          ))}
        </ul>

        {state === "done" || state === "already" ? (
          <p className="tomboy-list__done" role="status">
            {state === "done" ? "You're on the list! Watch your inbox." : "You're already on the list. Good stuff coming your way."}
          </p>
        ) : (
          <form className="tomboy-list__form" onSubmit={subscribe} noValidate>
            <label htmlFor="stay-email" className="sr-only">
              Email address
            </label>
            <input
              id="stay-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" disabled={state === "sending"}>
              {state === "sending" ? "Joining…" : "Join the list"}
              <ArrowRight size={18} aria-hidden />
            </button>
          </form>
        )}
        {state === "error" && <p className="tomboy-list__error">{error}</p>}
        <p className="tomboy-list__fine">
          No spam, unsubscribe any time. <Link href="/info/privacy-policy">Privacy policy</Link>
        </p>
      </motion.div>
    </section>
  );
}

