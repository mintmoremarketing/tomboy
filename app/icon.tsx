import { ImageResponse } from "next/og";

// Browser tab icon until a proper favicon file is supplied
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0A",
          borderRadius: 14,
          color: "#00F5D4",
          fontSize: 44,
          fontWeight: 900,
          fontFamily: "sans-serif",
        }}
      >
        T
      </div>
    ),
    size,
  );
}
