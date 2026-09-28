"use client";

import { Feather, Leaf, RefreshCw, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";

// A burst of brand colour right under the hero: five sticker-style tiles with
// the facts shoppers care about. Styles: `.comfort-band*` in globals.css.

const tiles: { big: string; label: string; sub: string; bg: string; fg: string; shadow: string; tilt: number; Icon: LucideIcon }[] = [
  { big: "100%", label: "Super combed cotton", sub: "Soft, breathable, anti-odour", bg: "#00F5D4", fg: "#0A0A0A", shadow: "#0A0A0A", tilt: -2, Icon: Leaf },
  { big: "0", label: "Pinch. Ever.", sub: "Waistbands that don't dig or roll", bg: "#FFE500", fg: "#0A0A0A", shadow: "#FF3399", tilt: 1.5, Icon: Feather },
  { big: "₹899+", label: "Ships free", sub: "Anywhere in India", bg: "#FF3399", fg: "#FFFFFF", shadow: "#0A0A0A", tilt: -1, Icon: Truck },
  { big: "7 days", label: "Easy returns", sub: "Exchanges without the drama", bg: "#52F264", fg: "#0A0A0A", shadow: "#2E7CF6", tilt: 2, Icon: RefreshCw },
  { big: "100+", label: "Washes strong", sub: "Double-stitched to last", bg: "#2E7CF6", fg: "#FFFFFF", shadow: "#FFE500", tilt: -1.5, Icon: ShieldCheck },
];

export function ComfortBand() {
  return (
    <section className="comfort-band" aria-label="Why Tomboy">
      <div className="comfort-band__inner">
        {tiles.map(({ big, label, sub, bg, fg, shadow, tilt, Icon }, i) => (
          <motion.div
            key={label}
            className="comfort-tile"
            style={{ background: bg, color: fg, boxShadow: `6px 6px 0 ${shadow}`, "--tilt": `${tilt}deg` } as React.CSSProperties}
            initial={{ opacity: 0, y: 28, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ type: "spring", stiffness: 320, damping: 18, delay: i * 0.08 }}
          >
            <Icon className="comfort-tile__icon" size={22} strokeWidth={2.5} aria-hidden="true" />
            <span className="comfort-tile__big">{big}</span>
            <span className="comfort-tile__label">{label}</span>
            <span className="comfort-tile__sub">{sub}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
