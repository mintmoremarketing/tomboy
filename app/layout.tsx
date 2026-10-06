import type { Metadata, Viewport } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";
import "./v2.css";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { ResumePill } from "@/components/cart/resume-pill";
import { FitFinder } from "@/components/fit/fit-finder";
import { ReturnReminder } from "@/components/assistant/return-reminder";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tomboy India | 100% Cotton Innerwear & Essentials for Men, Women & Kids",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "cotton innerwear",
    "men's briefs",
    "men's boxers",
    "women's innerwear",
    "kids innerwear",
    "super combed cotton",
    "anti-pinch waistband",
    "Tomboy India",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: "/",
    title: "Tomboy India | Everyday cotton comfort",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tomboy India | Everyday cotton comfort",
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before the first paint: marks first-time visitors (no lineup saved yet) so the
            welcome screen in the server HTML shows immediately, without waiting for React. */}
        <script
          dangerouslySetInnerHTML={{
            // first visit: also start downloading the welcome photos right away (returning visitors skip them)
            __html: `try{if(!localStorage.getItem("tomboy-audience")){document.documentElement.setAttribute("data-first-visit","");["women","men","kids"].forEach(function(n){var l=document.createElement("link");l.rel="preload";l.as="image";l.href="/v2/gateway-"+n+".webp";l.fetchPriority="high";document.head.appendChild(l)})}}catch(e){}`,
          }}
        />
      </head>
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <body>
          before React loads; this ignores those on <body> only, not on anything inside it. */}
      <body suppressHydrationWarning>
        {children}
        <SiteFooter />
        {/* site-wide: the cart drawer and the "continue with this product" pill */}
        <CartDrawer />
        <ResumePill />
        <FitFinder />
        <ReturnReminder />
      </body>
    </html>
  );
}
