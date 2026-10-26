"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Price } from "@/components/product/price";

// Hero highlight card: one bestseller per lineup (cut-out, name, live price, Shop) plus a row
// of the lineup's selling points. Uses the clothes-line cut-outs in /public/v2/rail.

type Audience = "men" | "women" | "kids";

const FEATURED: Record<Audience, { handle: string; color?: string; img: string; name: string; tag: string; points: string[] }> = {
  men: {
    handle: "tomboy-mens-graphic-print-brief-icon-edition",
    color: "Burgundy Printed",
    img: "/v2/rail/brief.webp",
    name: "Graphic Print Brief",
    tag: "Bestseller",
    points: ["100% super combed cotton", "Anti-pinch waistband", "Zero chafe"],
  },
  women: {
    handle: "women-s-essential-soft-cotton-stretch-bikini-panty-3-pcs-pack",
    color: "Red",
    img: "/v2/rail/w-brief-red.webp",
    name: "Essential Bikini Panty · 3-pack",
    tag: "Bestseller",
    points: ["Soft cotton stretch", "No-dig waistband", "7-day easy returns"],
  },
  kids: {
    handle: "boy-s-printed-briefs",
    color: "B NAVY STAR",
    img: "/v2/rail/k-brief-stars.webp",
    name: "Inner Elastic AOP Brief · 2-pack",
    tag: "India's first 100% bamboo",
    points: ["Label free", "Kind to young skin", "Sizes 1–14 years"],
  },
};

export function FeaturedCard({ audience }: { audience: Audience }) {
  const f = FEATURED[audience];
  const href = `/products/${f.handle}${f.color ? `?color=${encodeURIComponent(f.color)}` : ""}`;
  const [price, setPrice] = useState<{ price: number; compareAt: number } | null>(null);

  useEffect(() => {
    setPrice(null);
    let alive = true;
    fetch(`/api/products?handle=${encodeURIComponent(f.handle)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => alive && p && setPrice({ price: p.price, compareAt: p.compareAt }))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [f.handle]);

  return (
    <Link className="bento-card bento-card--fact featured-card" href={href}>
      <span className="featured-card__media" aria-hidden="true">
        <img src={f.img} alt="" draggable={false} />
      </span>
      <span className="featured-card__info">
        <span className="featured-card__tag">{f.tag}</span>
        <strong className="featured-card__name">{f.name}</strong>
        <span className="featured-card__price">{price ? <Price amount={price.price} compareAt={price.compareAt} size="sm" /> : " "}</span>
        <span className="featured-card__cta">
          Shop now <ArrowRight size={15} aria-hidden />
        </span>
      </span>
      <span className="featured-card__points" aria-label="Why you'll love it">
        {f.points.map((p) => (
          <span key={p}>{p}</span>
        ))}
      </span>
    </Link>
  );
}
