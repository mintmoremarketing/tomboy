"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { LiveOrb } from "@/components/ui/live-orb";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { CartButton } from "@/components/cart/cart-drawer";

// Sticky top bar for inner pages (collections, product, kids): back, logo, cart and Scout.
// Same look as the product page's bar (.pdp-topbar styles in globals.css).
export function PageTopbar({ currentProduct }: { currentProduct?: { handle: string } }) {
  const router = useRouter();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [orbDancing, setOrbDancing] = useState(false);
  const [audience, setAudience] = useState<"men" | "women" | "kids">("men");

  useEffect(() => {
    const saved = window.localStorage.getItem("tomboy-audience");
    if (saved === "men" || saved === "women" || saved === "kids") setAudience(saved);
  }, []);

  // one step back like the phone's back gesture, or home if they landed here directly
  function goBack() {
    let navigated = false;
    try {
      navigated = window.sessionStorage.getItem("tomboy-navigated") === "1";
    } catch {}
    if (navigated || document.referrer.startsWith(window.location.origin)) router.back();
    else router.push("/");
  }

  return (
    <>
      <div className="pdp-topbar">
        <div className="pdp-topbar__start">
          <button className="pdp-back" onClick={goBack} aria-label="Go back">
            <ChevronLeft size={22} />
          </button>
          <Link href="/" className="brand" aria-label="Tomboy homepage">
            <img src="/logo.webp" alt="Tomboy India" className="brand-logo" />
          </Link>
        </div>
        <div className="pdp-topbar__actions">
          <Link href="/" className="back-link hide-mobile">
            <ArrowLeft size={16} /> Back to store
          </Link>
          <CartButton />
          <button
            className="orb-button"
            aria-label="Ask Scout"
            title="Ask Scout (press /)"
            onClick={() => setAssistantOpen(true)}
            onMouseEnter={() => setOrbDancing(true)}
            onMouseLeave={() => setOrbDancing(false)}
          >
            <LiveOrb variant="custom" color="#FF3333" eyeColor="#FAFAFA" size={34} dance={orbDancing} />
          </button>
        </div>
      </div>
      <AssistantPanel
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        audience={audience}
        currentProduct={currentProduct}
      />
    </>
  );
}
