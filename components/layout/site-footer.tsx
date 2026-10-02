"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Mail, Phone } from "lucide-react";
import { STORE } from "@/data/info-pages";
import { openFitFinder } from "@/components/fit/fit-finder";

// Site-wide footer: big shop links, a one-line email sign-up (same Shopify list as
// "The Tomboy list"), help + policy links, contact details and a giant TOMBOY wordmark
// over a glow in the brand colours. Rebuilt in plain CSS from the "Footer 25" layout.

const SHOP = [
  { label: "Men", href: "/collections/men" },
  { label: "Women", href: "/collections/women" },
  { label: "Kids", href: "/collections/kids" },
  { label: "Best Sellers", href: "/collections/best-sellers" },
];

const HELP = [
  { label: "Contact us", href: "/info/contact" },
  { label: "Shipping", href: "/info/shipping-policy" },
  { label: "Refunds & returns", href: "/info/refunds-returns-policy" },
];

const COMPANY = [
  { label: "About Tomboy", href: "/info/about-us" },
  { label: "Privacy policy", href: "/info/privacy-policy" },
  { label: "Terms & conditions", href: "/info/terms-conditions" },
  { label: "Scout & your data", href: "/privacy/ai" },
];

const ease = [0.16, 1, 0.3, 1] as const;
const reveal = (delay = 0, y = 20) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "0px 0px -10% 0px" },
  transition: { duration: 0.8, delay, ease },
});

function FooterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "already" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
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

  if (state === "done" || state === "already") {
    return (
      <p className="site-footer__done" role="status">
        {state === "done" ? "You're on the list. Watch your inbox." : "You're already on the list. Good stuff coming soon."}
      </p>
    );
  }

  return (
    <form className="site-footer__form" onSubmit={submit} noValidate>
      <label htmlFor="footer-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" aria-label="Join the Tomboy list" disabled={state === "sending"}>
        <ArrowRight size={24} />
      </button>
      {state === "error" && <p className="site-footer__error">{error}</p>}
    </form>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/welcome")) return null;

  return (
    <footer className="site-footer">
      {/* glow in the brand colours, rising from the bottom */}
      <div className="site-footer__glow" aria-hidden />

      <div className="site-footer__inner">
        <div className="site-footer__top">
          <motion.nav className="site-footer__shop" aria-label="Shop" {...reveal(0)}>
            {SHOP.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </motion.nav>

          <motion.div className="site-footer__signup" {...reveal(0.1)}>
            {pathname === "/" ? (
              // the homepage already has the full sign-up right above the footer
              <p>
                Soft cotton essentials, made to feel as good at midnight <br className="site-footer__br" />
                as they did in the morning.
              </p>
            ) : (
              <>
                <p>
                  New drops, restocks in your size and members-only offers, <br className="site-footer__br" />
                  straight to your inbox.
                </p>
                <FooterSignup />
              </>
            )}
          </motion.div>
        </div>

        <motion.div className="site-footer__middle" {...reveal(0.2, 0)}>
          <div className="site-footer__rule" aria-hidden />
          <div className="site-footer__columns">
            <nav aria-label="Help">
              <p className="site-footer__heading">Help</p>
              {HELP.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
              <button type="button" onClick={() => openFitFinder()}>
                Find my size
              </button>
            </nav>
            <nav aria-label="Company">
              <p className="site-footer__heading">Company</p>
              {COMPANY.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </nav>
            <div>
              <p className="site-footer__heading">Talk to us</p>
              <a href={`mailto:${STORE.email}`} className="site-footer__contact">
                <Mail size={15} /> {STORE.email}
                <ArrowUpRight size={14} className="site-footer__arrow" />
              </a>
              <a href={STORE.phoneHref} className="site-footer__contact">
                <Phone size={15} /> {STORE.phone}
                <ArrowUpRight size={14} className="site-footer__arrow" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* giant logo */}
        <motion.div className="site-footer__wordmark" {...reveal(0.3, 40)}>
          {/* the real logo (fox mark + wordmark), traced to vector so it stays sharp at full width */}
          <img src="/logo-mark.svg" alt="Tomboy India" />
        </motion.div>

        <motion.div className="site-footer__meta" {...reveal(0.4, 0)}>
          <p>
            © {new Date().getFullYear()} {STORE.name}. Made in Tanuku, Andhra Pradesh.
            <br />
            Soft cotton essentials for men, women and kids.
          </p>
          <div>
            <Link href="/info/privacy-policy">Privacy</Link>
            <Link href="/info/terms-conditions">Terms</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
