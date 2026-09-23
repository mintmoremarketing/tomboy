"use client";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const defaultUndergarmentImages = [
  "https://cdn.shopify.com/s/files/1/0771/0870/7550/files/TOMBOYMen_sClassicBriefs_PremiumComfort_Support-1.webp?v=1769581736",
  "https://cdn.shopify.com/s/files/1/0771/0870/7550/files/TOMBOYMen_sBoxer_ModernFit_SoftTouch_69ffac02-6495-4de8-ae30-a825134a1dbc.webp?v=1769581255",
  "https://cdn.shopify.com/s/files/1/0771/0870/7550/files/TOMBOYMen_sPremiumWhiteCottonVest_ClassicFitUndershirt_d6916a81-768d-4e84-8c83-728f3c49b89e.webp?v=1769581964",
  "https://cdn.shopify.com/s/files/1/0771/0870/7550/files/TOMBOYMen_sNavyComfortBrief_Fabric-EncasedWaistband_FlagDetail5.webp?v=1769580600",
  "https://cdn.shopify.com/s/files/1/0771/0870/7550/files/TOMBOYMen_sStatementBrief_Richbody_SilverWaistband2.webp?v=1769585292",
  "https://cdn.shopify.com/s/files/1/0771/0870/7550/files/TOMBOYMen_sBoxer_SilverWaistband_HeritageCrest4.webp?v=1769577463",
  "https://cdn.shopify.com/s/files/1/0771/0870/7550/files/TOMBOYMen_sPatternedBrief-DiamondGrid-1_89130790-ddd0-4c1c-b863-4e4161a53d30.webp?v=1769575826",
  "https://cdn.shopify.com/s/files/1/0771/0870/7550/files/TOMBOYMen_sPatternedBoxer_DiamondGrid2.webp?v=1769575249",
];

const SLOTS = [
  { y: 0, size: 1.15, w: 135, h: 135 },
  { y: -26, size: 1.05, w: 125, h: 125 },
  { y: 26, size: 1.00, w: 125, h: 125 },
  { y: -52, size: 0.92, w: 115, h: 115 },
  { y: 52, size: 0.88, w: 115, h: 115 },
  { y: -78, size: 0.82, w: 105, h: 105 },
  { y: 78, size: 0.76, w: 105, h: 105 },
  { y: -104, size: 0.70, w: 95, h: 95 },
];

const SPEED = 0.00018;
const MAX_SPEED = 0.0006;
const MOUSE_SPEED_BOOST = 0.00045;
const FOLLOW = 0.08;
const SPREAD_X = 175;
const SCALE_OUT_MIN = 0.80;
const SCALE_OUT_MAX = 1.15;
const FORWARD_PUSH_AMOUNT = 28;
const UPWARD_PUSH_AMOUNT = 16;

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function drawRoundedImage(ctx, img, x, y, width, height, radius) {
  if (!img || !img.complete || img.naturalWidth === 0) return;
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.rect(x, y, width, height);
  }
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0, 0, 0, 0.10)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fill();
  ctx.clip();
  ctx.drawImage(img, x + 4, y + 4, width - 8, height - 8);
  ctx.restore();
}

export function MagneticImageTrail({
  children,
  images = defaultUndergarmentImages,
  height = "100%",
  background = "transparent",
  textColor = "inherit",
  compositionScale = 1,
  className,
  style,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const lastTime = useRef(0);
  const phase = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const lerpedPointer = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const dirRef = useRef({ x: 1, y: 0 });
  const lastMoveAt = useRef(0);
  const imagesRef = useRef([]);

  useEffect(() => {
    imagesRef.current = images.map((src) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      return img;
    });
  }, [images]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (wrap.clientWidth || 300);
    let H = (wrap.clientHeight || 300);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!wrap || !canvas) return;
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    pointer.current = { x: W / 2, y: H / 2 };
    lerpedPointer.current = { x: W / 2, y: H / 2 };
    smooth.current = { x: W / 2, y: H / 2 };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function frame(now) {
      if (!wrap || !canvas || !ctx) return;
      const imgs = imagesRef.current;
      if (!imgs || imgs.length === 0) return;

      const fitScale = Math.min(1, W / 720, H / 520) * Math.max(0, compositionScale);
      ctx.clearRect(0, 0, W, H);

      const dt = Math.min(32, now - (lastTime.current || now));
      lastTime.current = now;

      const LERP_AMOUNT = 0.18;
      lerpedPointer.current.x = lerp(lerpedPointer.current.x, pointer.current.x, LERP_AMOUNT);
      lerpedPointer.current.y = lerp(lerpedPointer.current.y, pointer.current.y, LERP_AMOUNT);

      const prevSX = smooth.current.x;
      const prevSY = smooth.current.y;

      smooth.current.x += (lerpedPointer.current.x - smooth.current.x) * FOLLOW;
      smooth.current.y += (lerpedPointer.current.y - smooth.current.y) * FOLLOW;

      const cx = smooth.current.x;
      const cy = smooth.current.y;

      const vx = cx - prevSX;
      const vy = cy - prevSY;
      const vmag = Math.hypot(vx, vy);
      if (vmag > 0.35) {
        const tx = vx / vmag;
        const ty = vy / vmag;
        dirRef.current.x = dirRef.current.x + (tx - dirRef.current.x) * 0.2;
        dirRef.current.y = dirRef.current.y + (ty - dirRef.current.y) * 0.2;
        const m = Math.hypot(dirRef.current.x, dirRef.current.y) || 1;
        dirRef.current.x /= m;
        dirRef.current.y /= m;
        lastMoveAt.current = now;
      } else if (!lastMoveAt.current) {
        lastMoveAt.current = now;
      }

      const speed01 = clamp(vmag / 18, 0, 1);
      const currentSpeed = clamp(SPEED + speed01 * MOUSE_SPEED_BOOST, SPEED, MAX_SPEED);
      phase.current += dt * currentSpeed;
      const dir = dirRef.current;

      const cards = SLOTS.map((slot, i) => {
        const n = SLOTS.length;
        const t = (phase.current + i / n) % 1;
        const pathNorm = t * 2 - 1;
        const moveX = pathNorm;
        const moveY = -pathNorm;

        const yOffset = clamp(slot.y, -SPREAD_X * 0.82, SPREAD_X * 0.82);
        const circleWidthAtY =
          Math.sqrt(Math.max(0, SPREAD_X * SPREAD_X - yOffset * yOffset)) * 0.74;

        const diagonalPush = SPREAD_X * 0.15;
        const verticalLift = -SPREAD_X * 0.06;

        const x = cx + moveX * circleWidthAtY;
        const y = cy + yOffset + moveY * diagonalPush + verticalLift;

        const rawCenterScale = Math.max(0, 1 - Math.abs(pathNorm));
        const easedCenterScale =
          rawCenterScale * rawCenterScale * (3 - 2 * rawCenterScale);
        const centerScale = lerp(0.06, 0.9, easedCenterScale);

        const dx = x - cx;
        const dy = y - cy;

        const directionalProjection = clamp(
          (dx * dir.x + dy * dir.y) / Math.max(1, SPREAD_X),
          -1,
          1
        );

        const oppositeProjection = -directionalProjection;
        const backwardAmount = (oppositeProjection + 1) * 0.5;

        const movementBoost = lerp(1, 1.15, speed01);
        const directionalScale = lerp(SCALE_OUT_MIN, SCALE_OUT_MAX, backwardAmount) * movementBoost;
        const scale = centerScale * directionalScale * 0.95;

        const forwardPush = Math.max(0, directionalProjection) * speed01 * FORWARD_PUSH_AMOUNT;
        const upwardPush = Math.max(0, oppositeProjection) * speed01 * UPWARD_PUSH_AMOUNT;

        return {
          i,
          img: imgs[i % imgs.length],
          x: x + dir.x * forwardPush,
          y: y + dir.y * forwardPush - upwardPush,
          w: slot.w * slot.size * scale,
          h: slot.h * slot.size * scale,
          rot: 0,
          alpha: 1,
          order: i,
        };
      });

      cards.sort((a, b) => a.i - b.i);

      for (const card of cards) {
        if (card.w < 2 || card.h < 2) continue;

        ctx.save();
        ctx.translate(cx + (card.x - cx) * fitScale, cy + (card.y - cy) * fitScale);
        ctx.globalAlpha = 1;

        const width = card.w * fitScale;
        const height = card.h * fitScale;
        drawRoundedImage(ctx, card.img, -width / 2, -height / 2, width, height, 16);

        ctx.restore();
      }

      if (!reducedMotion.matches) rafRef.current = requestAnimationFrame(frame);
    }

    function syncMotion() {
      cancelAnimationFrame(rafRef.current);
      lastTime.current = 0;
      if (reducedMotion.matches) frame(0);
      else rafRef.current = requestAnimationFrame(frame);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    imagesRef.current.forEach((img) => {
      img.onload = () => { if (reducedMotion.matches) frame(0); };
    });
    resize();
    syncMotion();
    reducedMotion.addEventListener("change", syncMotion);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      reducedMotion.removeEventListener("change", syncMotion);
      imagesRef.current.forEach((img) => { img.onload = null; });
    };
  }, [images, compositionScale]);

  const updatePointer = useCallback((e) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointer.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  return (
    <section
      ref={wrapRef}
      className={cn("isolate relative w-full overflow-hidden", className)}
      onPointerMove={updatePointer}
      onPointerEnter={updatePointer}
      style={{
        position: "relative",
        width: "100%",
        height,
        background,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />
    </section>
  );
}

export { MagneticImageTrail as ImageTrail };
export default MagneticImageTrail;

