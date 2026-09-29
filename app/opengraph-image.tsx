import { ImageResponse } from "next/og";

// Link preview image (WhatsApp, Instagram, X, Google): brand colours + the promise.
export const alt = "Tomboy India: 100% super combed cotton essentials for men, women and kids";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TILES: [string, string][] = [
  ["#00F5D4", "100% COTTON"],
  ["#FFE500", "0 PINCH"],
  ["#FF3399", "FREE SHIPPING ₹899+"],
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#FAFAF7",
          color: "#0A0A0A",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 900, letterSpacing: 4 }}>TOMBOY</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 92, fontWeight: 900, lineHeight: 1, letterSpacing: -2 }}>
          <span>EVERYDAY COTTON</span>
          <span>COMFORT.</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {TILES.map(([color, label]) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "16px 26px",
                background: color,
                border: "4px solid #0A0A0A",
                borderRadius: 18,
                boxShadow: "6px 6px 0 #0A0A0A",
                fontSize: 30,
                fontWeight: 900,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
