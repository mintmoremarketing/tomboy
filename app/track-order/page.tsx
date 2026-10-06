import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { TrackOrder } from "@/components/track-order";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check where your Tomboy order is with your order number and email. No account needed.",
  alternates: { canonical: "/track-order" },
};

export default function TrackOrderPage() {
  return (
    <>
      <SiteHeader />
      <main className="track-order-page">
        <TrackOrder heading="h1" />
      </main>
    </>
  );
}
