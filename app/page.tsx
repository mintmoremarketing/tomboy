"use client";

import {
  ArrowRight,
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
import { useSectionNudges } from "@/components/assistant/section-nudges";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
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

// Scout's hello on the homepage, per lineup
const GREETING: Record<Audience, Nudge> = {
  men: {
    id: "home-hello-men",
    text: "Hey! I'm Scout. Shopping men's today? Tell me your size once and I'll pick the right fit on every product.",
    actions: [
      { label: "Find my size", fit: true },
      { label: "What's popular?", ask: "What are the most popular men's picks right now?" },
    ],
  },
  women: {
    id: "home-hello-women",
    text: "Hi! I'm Scout. Looking for comfy everyday innerwear? I can find your panty and bra size in under a minute.",
    actions: [
      { label: "Find my size", fit: true },
      { label: "What's popular?", ask: "What are the most popular women's picks right now?" },
    ],
  },
  kids: {
    id: "home-hello-kids",
    text: "Hi! I'm Scout. Shopping for a little one? Tell me their age and I'll pick sizes that fit.",
    actions: [
      { label: "Size by age", fit: true },
      { label: "What's popular?", ask: "What are the most popular kids' picks right now?" },
    ],
  },
};

// Scout's reaction to switching Men / Women / Kids
const SWITCH_NUDGE: Record<Audience, Nudge> = {
  men: {
    id: "home-switch-men",
    text: "Men's it is. Briefs, trunks, boxers, tees and joggers: want me to find your size first?",
    actions: [{ label: "Find my size", fit: true }],
  },
  women: {
    id: "home-switch-women",
    text: "Switched to women's. Want help finding your panty or bra size?",
    actions: [{ label: "Find my size", fit: true }],
  },
  kids: {
    id: "home-switch-kids",
    text: "Kids' it is! Tell me their age and I'll suggest the right size.",
    actions: [{ label: "Size by age", fit: true }],
  },
};

export default function Home() {
  const [audience, setAudience] = useState<Audience>("men");
  // false until the saved audience is read, so the hero doesn't flash Men first
  const [audienceReady, setAudienceReady] = useState(false);
  const [showGateway, setShowGateway] = useState<boolean>(false);
  const [openFooter, setOpenFooter] = useState<string>("Shop");
  // Live Shopify products, fetched per audience collection and cached
  const [realProducts, setRealProducts] = useState<Partial<Record<Audience, any[]>>>({});

  useEffect(() => {
    const saved = window.localStorage.getItem("tomboy-audience") as Audience | null;
    if (saved === "men" || saved === "women" || saved === "kids") {
      setAudience(saved);
      setShowGateway(false);
    } else {
      setShowGateway(true);
    }
    setAudienceReady(true);
  }, []);

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
    window.localStorage.setItem("tomboy-audience", value);
    nudge(SWITCH_NUDGE[value]);
  }

  // ---- Scout speaks up: on arrival, and as each section scrolls into view ----
  useEffect(() => {
    if (!audienceReady || showGateway) return;
    const t = window.setTimeout(() => nudge(GREETING[audience]), 1000);
    return () => window.clearTimeout(t);
    // greet once, in the lineup they arrived in
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceReady, showGateway]);

  useSectionNudges(
    [
      {
        selector: ".comfort-band",
        nudge: {
          id: "home-comfort",
          text: "Everything here is soft cotton with waistbands that don't dig in. Ask me how any piece fits before you buy.",
          actions: [{ label: "How does Tomboy fit?", ask: "How does Tomboy sizing fit compared to other brands?" }],
        },
      },
      {
        selector: "#essentials",
        nudge: {
          id: `home-essentials-${audience}`,
          text: `Not sure where to start with ${audience === "kids" ? "kids'" : audience === "women" ? "women's" : "men's"} essentials? Tell me what you wear most and I'll pick the right ones.`,
          actions: [{ label: "Pick for me", ask: `Help me pick everyday ${audience} essentials. Ask me what I need.` }],
        },
      },
      {
        selector: ".scroll-story-section",
        nudge: {
          id: "home-story",
          text: "Want to know what makes the cotton feel different? Ask me anything about the fabric or how to wash it.",
          actions: [{ label: "Tell me about the fabric", ask: "What makes Tomboy's cotton different, and how should I wash it?" }],
        },
      },
      {
        selector: "#live-products",
        nudge: {
          id: `home-products-${audience}`,
          text: "These are live from the store. Want me to show only what's in your size?",
          actions: [
            { label: "Show my size", ask: `Show me ${audience} products available in my size.` },
            { label: "Find my size", fit: true },
          ],
        },
      },
      {
        selector: "#reviews",
        nudge: {
          id: "home-reviews",
          text: "Any questions before you buy? I can help with sizing, delivery or returns.",
          actions: [{ label: "Returns & delivery", ask: "How do returns, exchanges and delivery work?" }],
        },
      },
    ],
    [audience, audienceReady],
  );

  function handleGatewayChoice(value: Audience) {
    setAudience(value);
    setShowGateway(false);
    window.localStorage.setItem("tomboy-audience", value);
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
      <SiteHeader audience={audience} onSelectAudience={switchAudience} products={products} />
      <Hero audience={audience} ready={audienceReady} onSelectAudience={switchAudience} />
      <ComfortBand />
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
  // hides again when the footer comes into view.
  useEffect(() => {
    const actions = actionsRef.current;
    const footer = document.querySelector("footer");
    if (!actions) return;
    let actionsVisible = true;
    let footerVisible = false;
    const update = () => setShowStickyShop(!actionsVisible && !footerVisible);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === actions) {
          // only count it as gone once it has scrolled up past the viewport
          actionsVisible = entry.isIntersecting || entry.boundingClientRect.top > 0;
        } else {
          footerVisible = entry.isIntersecting;
        }
      }
      update();
    });
    observer.observe(actions);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="hero-section-wrapper"
      onClick={() => setSelectedStickerId(null)}
    >
      <div className="hero">
        {/* Free-floating stickers spread across the entire hero (desktop);
            on phones this is the swipeable character stage */}
        <div
          className="hero-stickers-layer"
          aria-label="Draggable Stickers"
          onPointerDown={onStagePointerDown}
          onPointerUp={onStagePointerUp}
          onPointerCancel={() => (pointerStart.current = null)}
          style={{ "--stage-bg": heroStageColor[audience] } as React.CSSProperties}
        >
          {/* phones: big watermark behind the character on the coloured poster card */}
          <span className="hero-stage-word" aria-hidden="true">
            TOMBOY
          </span>
          <HeroCharacter audience={audience} ready={ready} direction={direction} />
          {initialStickers.map((sticker) => (
            <DraggableSticker
              key={sticker.id}
              sticker={sticker}
              isSelected={selectedStickerId === sticker.id}
              onSelect={(id) => setSelectedStickerId(id)}
            />
          ))}
          <div className="hero-swipe-dots" role="tablist" aria-label="Choose lineup">
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

        {/* Phones: the stickers roll by in a strip instead of covering the character */}
        <div className="hero-sticker-strip" aria-hidden="true">
          <div className="hero-sticker-strip__track">
            {[...initialStickers, ...initialStickers].map((sticker, i) => (
              <span
                key={`${sticker.id}-${i}`}
                className="hero-strip-sticker"
                tabIndex={-1}
                style={{
                  background: sticker.bgColor,
                  color: sticker.textColor,
                  boxShadow: `3px 3px 0 ${sticker.shadowColor}`,
                  rotate: `${i % 2 ? 3 : -3}deg`,
                }}
              >
                {sticker.emoji && <span>{sticker.emoji}</span>}
                {sticker.content}
              </span>
            ))}
          </div>
        </div>

        <div className="hero__copy">
          <div className="hero__pill">
            <span aria-hidden="true">⚡</span>
            100% Unisex Energy
          </div>
          <p className="eyebrow">{content.kicker}</p>
          {ready ? (
            <StretchHeadline
              text={content.headline}
              mood={headlineMood[audience]}
              accent={heroHighlightColor[audience]}
            />
          ) : (
            // holds the space (and keeps the heading in the server HTML) until the audience is known
            <h1 className="stretch-headline" style={{ visibility: "hidden" }}>
              {content.headline.split("\n").map((line) => (
                <span className="sh-line" key={line}>{line}</span>
              ))}
              <span className="sh-band" />
            </h1>
          )}
          <div className="hero__body-text">
            {/* key replays the draw + drag when the audience toggles */}
            <HighlightedText
              key={audience}
              text={content.body}
              phrase={content.highlight}
              color={heroHighlightColor[audience]}
            />
          </div>

          <div className="hero__actions" ref={actionsRef}>
            <Link className="button button--dark" href={`/collections/${content.collectionHandle}`}>
              Shop {content.label} <ArrowRight size={18} />
            </Link>
            {/* opens the Fit Finder: sizes from a photo or measurements, saved for Scout */}
            <button type="button" className="button button--light" onClick={() => openFitFinder(audience)}>
              Know the Fit
            </button>
          </div>
        </div>
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

function Essentials({ audience }: { audience: Audience }) {
  const items = shopEssentials[audience];
  // one Shopify product photo per card, keyed by collection handle; cached per audience
  const [photos, setPhotos] = useState<Partial<Record<Audience, Record<string, string | null>>>>({});

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

function ProductCarousel({
  products,
  audience,
}: {
  products: any[];
  audience: Audience;
}) {
  return (
    <section className="section section--cream" id="live-products">
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
            <Link href={productHref} className="product-card" key={product.handle ?? product.title}>
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
              <p>{product.amount ? <Price amount={product.amount} compareAt={product.compareAt} size="sm" /> : product.price}</p>
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
              {/* one + that turns 45° into an × when the group opens */}
              <span className="footer-group__icon" aria-hidden />
            </button>
            <div className={open ? "footer-group__content is-open" : "footer-group__content"} inert={!open}>
              <div className="footer-group__links">
                {group.links.map((link) => (
                  <Link href={link.href} key={link.name}>
                    {link.name}
                  </Link>
                ))}
              </div>
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
