import { ImageResponse } from "next/og";

export const alt = "Felix Yeboah — Software Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0b0a",
          color: "#ece7df",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#e6a15e",
          }}
        >
          Felix Yeboah
        </div>
        <div
          style={{
            fontSize: 68,
            lineHeight: 1.15,
            maxWidth: 900,
            letterSpacing: "-0.02em",
          }}
        >
          I build functional, beautiful interfaces for the web and mobile.
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#ece7df99",
          }}
        >
          <span>Senior Frontend Engineer</span>
          <span>felixyeboah.dev</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
