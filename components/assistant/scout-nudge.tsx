"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Price } from "@/components/product/price";
import { X } from "lucide-react";
import { onNudge, type Nudge, type NudgeAction } from "@/components/assistant/nudges";
import { openFitFinder } from "@/components/fit/fit-finder";

// The speech bubble under the Scout orb. Stays until answered, dismissed or replaced;
// on phones it hides itself after a while so it never blocks the page for long.
export function ScoutNudge({
  onAsk,
  onSheet,
  hidden = false,
}: {
  onAsk: (question: string) => void;
  onSheet: (sheet: "sizes") => void;
  /** e.g. while Scout's panel is open */
  hidden?: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<Nudge | null>(null);

  // newest message wins; a short settle so fast scrolling past several sections doesn't flicker
  useEffect(() => {
    let timer: number | undefined;
    const off = onNudge((n) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCurrent(n), 250);
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, []);

  // fades out if untouched: sooner on phones, where it covers more of the page
  useEffect(() => {
    if (!current) return;
    const t = window.setTimeout(() => setCurrent(null), window.matchMedia("(max-width: 768px)").matches ? 9_000 : 15_000);
    return () => window.clearTimeout(t);
  }, [current]);

  if (!current || hidden) return null;

  function run(action: NudgeAction) {
    setCurrent(null);
    if ("ask" in action) onAsk(action.ask);
    else if ("sheet" in action) onSheet(action.sheet);
    else if ("fit" in action) openFitFinder();
    else router.push(action.href);
  }

  return (
    <div className="scout-nudge" role="status" aria-live="polite" key={current.id}>
      <p className="scout-nudge__from">Scout</p>
      <p className="scout-nudge__text">{current.text}</p>
      {current.products?.length ? (
        <div className="scout-nudge__products">
          {current.products.map((p) => (
            <Link key={p.handle} href={`/products/${p.handle}`} className="scout-nudge__product" onClick={() => setCurrent(null)}>
              <span className="scout-nudge__product-img">
                {p.image && <img src={`${p.image}${p.image.includes("?") ? "&" : "?"}width=200`} alt="" />}
              </span>
              <span className="scout-nudge__product-title">{p.title.replace(/^TOMBOY\s+/i, "")}</span>
              <Price amount={p.price} compareAt={p.compareAt} size="sm" showBadge={false} />
            </Link>
          ))}
        </div>
      ) : null}
      {current.actions?.length ? (
        <div className="scout-nudge__actions">
          {current.actions.map((a) => (
            <button key={a.label} type="button" className="scout-nudge__chip" onClick={() => run(a)}>
              {a.label}
            </button>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        className="scout-nudge__close"
        aria-label="Dismiss"
        title="Dismiss"
        onClick={() => setCurrent(null)}
      >
        <X size={14} />
      </button>
    </div>
  );
}
