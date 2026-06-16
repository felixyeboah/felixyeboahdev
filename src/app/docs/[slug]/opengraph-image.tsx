import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const alt = "Article by Felix Yeboah";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "src/content/blog", slug, "page.mdx");

  let title = "Writing";
  let date = "";
  if (fs.existsSync(filePath)) {
    const { data } = matter(fs.readFileSync(filePath, "utf8"));
    title = data.title || title;
    if (data.date) {
      date = new Date(data.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

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
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#e6a15e",
            fontFamily: "sans-serif",
          }}
        >
          <span>Felix Yeboah</span>
          <span style={{ color: "#ece7df66" }}>{date}</span>
        </div>
        <div
          style={{
            fontSize: title.length > 60 ? 60 : 72,
            lineHeight: 1.15,
            maxWidth: 1000,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 24, color: "#ece7df99", fontFamily: "sans-serif" }}>
          felixyeboah.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
