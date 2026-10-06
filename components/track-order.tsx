"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, PackageSearch } from "lucide-react";

// "Track your order" without an account: order number + email → /api/track-order.
// Used as a homepage section and on /track-order.

type Result = {
  name: string;
  placedAt: string;
  cancelled: boolean;
  status: string;
  statusPageUrl?: string;
  shipments: { status: string | null; updatedAt: string; tracking: { company: string | null; number: string | null; url: string | null }[] }[];
  items: { title: string; quantity: number }[];
};

const STEPS = ["Placed", "Packed", "Shipped", "Out for delivery", "Delivered"];

// Shopify's order + shipment statuses → how far along the 5 steps it is (0-4)
function stepFor(r: Result) {
  const shipment = r.shipments.map((s) => s.status ?? "");
  if (shipment.includes("DELIVERED")) return 4;
  if (shipment.includes("OUT_FOR_DELIVERY") || shipment.includes("ATTEMPTED_DELIVERY")) return 3;
  if (r.shipments.length > 0 || r.status === "FULFILLED" || r.status === "PARTIALLY_FULFILLED") return 2;
  if (r.status === "IN_PROGRESS" || r.status === "PENDING_FULFILLMENT") return 1;
  return 0;
}

const date = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function TrackOrder({ heading = "h2" }: { heading?: "h1" | "h2" }) {
  const [order, setOrder] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const Heading = heading;

  async function lookUp(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
      setState("idle");
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  }

  const step = result ? stepFor(result) : 0;
  const tracking = result?.shipments.flatMap((s) => s.tracking).filter((t) => t.number || t.url) ?? [];

  return (
    <section className="track-order" id="track-order" aria-labelledby="track-order-title">
      <div className="track-order__card">
        <span className="track-order__icon" aria-hidden="true">
          <PackageSearch size={26} strokeWidth={2.2} />
        </span>
        <Heading id="track-order-title">Track your order</Heading>
        <p className="track-order__lead">
          No account needed. Enter your order number (it&apos;s in your confirmation email, like #1024) and the email you ordered with.
        </p>

        <form className="track-order__form" onSubmit={lookUp} noValidate>
          <label>
            <span>Order number</span>
            <input
              inputMode="numeric"
              placeholder="#1024"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              autoComplete="off"
            />
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <button type="submit" disabled={state === "loading"}>
            {state === "loading" ? "Checking…" : "Track order"} <ArrowRight size={18} aria-hidden />
          </button>
        </form>

        {state === "error" && (
          <p className="track-order__error" role="alert">
            {error} <Link href="/info/contact">Contact us</Link>
          </p>
        )}

        {result && (
          <div className="track-order__result" role="status">
            <div className="track-order__result-head">
              <strong>Order {result.name}</strong>
              <span>Placed {date(result.placedAt)}</span>
            </div>

            {result.cancelled ? (
              <p className="track-order__cancelled">This order was cancelled. Questions? <Link href="/info/contact">Contact us</Link>.</p>
            ) : (
              <ol className="track-order__steps" style={{ "--progress": step / (STEPS.length - 1) } as React.CSSProperties}>
                {STEPS.map((label, i) => (
                  <li key={label} className={i <= step ? "is-done" : undefined} aria-current={i === step ? "step" : undefined}>
                    <span className="track-order__dot" />
                    {label}
                  </li>
                ))}
              </ol>
            )}

            {tracking.length > 0 && (
              <ul className="track-order__tracking">
                {tracking.map((t, i) => (
                  <li key={i}>
                    {t.company ?? "Courier"}
                    {t.number && <> · <code>{t.number}</code></>}
                    {t.url && (
                      <a href={t.url} target="_blank" rel="noopener noreferrer">
                        Live tracking <ArrowUpRight size={14} />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {result.items.length > 0 && (
              <p className="track-order__items">
                {result.items.map((it) => `${it.quantity} × ${it.title}`).join(", ")}
              </p>
            )}

            {result.statusPageUrl && (
              <a className="track-order__more" href={result.statusPageUrl} target="_blank" rel="noopener noreferrer">
                Full order details <ArrowUpRight size={15} />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
