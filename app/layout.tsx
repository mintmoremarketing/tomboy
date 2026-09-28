import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tomboy India | Homepage Prototype",
  description:
    "A custom-coded Tomboy India homepage prototype with a gender-first shopping entry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <body>
          before React loads; this ignores those on <body> only, not on anything inside it. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
