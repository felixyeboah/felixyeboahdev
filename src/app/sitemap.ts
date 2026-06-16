import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const SITE_URL = "https://felixyeboah.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const docsDir = path.join(process.cwd(), "src/content/blog");

  const posts: MetadataRoute.Sitemap = fs.existsSync(docsDir)
    ? fs
        .readdirSync(docsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .flatMap((dir) => {
          const fullPath = path.join(docsDir, dir.name, "page.mdx");
          if (!fs.existsSync(fullPath)) return [];
          const { data } = matter(fs.readFileSync(fullPath, "utf8"));
          if (!data.title) return [];
          return [
            {
              url: `${SITE_URL}/docs/${dir.name}`,
              lastModified: data.date ? new Date(data.date) : new Date(),
              changeFrequency: "monthly" as const,
              priority: 0.7,
            },
          ];
        })
    : [];

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...posts,
  ];
}
