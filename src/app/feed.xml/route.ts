import fs from "fs";
import path from "path";
import matter from "gray-matter";

const SITE_URL = "https://felixyeboah.dev";
const AUTHOR = "Felix Yeboah";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getPosts() {
  const docsDir = path.join(process.cwd(), "src/content/blog");
  if (!fs.existsSync(docsDir)) return [];

  return fs
    .readdirSync(docsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((dir) => {
      const fullPath = path.join(docsDir, dir.name, "page.mdx");
      if (!fs.existsSync(fullPath)) return [];
      const { data } = matter(fs.readFileSync(fullPath, "utf8"));
      if (!data.title) return [];
      return [
        {
          slug: dir.name,
          title: data.title as string,
          description: (data.subtitle || data.description || "") as string,
          date: new Date(data.date || "1970-01-01"),
        },
      ];
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function GET() {
  const posts = getPosts();
  const updated = posts[0]?.date ?? new Date(0);

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/docs/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/docs/${post.slug}</guid>
      <pubDate>${post.date.toUTCString()}</pubDate>
      ${post.description ? `<description>${escapeXml(post.description)}</description>` : ""}
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${AUTHOR} — Writing</title>
    <link>${SITE_URL}</link>
    <description>Essays and notes on software, engineering, and building for the web.</description>
    <language>en</language>
    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
