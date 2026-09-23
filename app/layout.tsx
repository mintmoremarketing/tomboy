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
      <body>{children}</body>
    </html>
  );
}
