import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { useMDXComponents } from "../../../../mdx-components";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";

export async function generateStaticParams() {
  const docsDir = path.join(process.cwd(), "src/content/blog");
  if (!fs.existsSync(docsDir)) return [];
  const entries = fs.readdirSync(docsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((dir) => ({
      slug: dir.name,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const filePath = path.join(process.cwd(), "src/content/blog", resolvedParams.slug, "page.mdx");

  if (!fs.existsSync(filePath)) {
    return {};
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data: frontmatter } = matter(fileContents);

  const title = frontmatter.title;
  const description = frontmatter.subtitle || frontmatter.description || `Read this article by Felix Yeboah.`;
  const url = `https://felixyeboah.dev/docs/${resolvedParams.slug}`; // Update to your real domain

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url,
      publishedTime: frontmatter.date,
      authors: ["Felix Yeboah"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const filePath = path.join(process.cwd(), "src/content/blog", resolvedParams.slug, "page.mdx");

  if (!fs.existsSync(filePath)) {
    return notFound();
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data: frontmatter, content } = matter(fileContents);

  const date = new Date(frontmatter.date || "1970-01-01");
  const formattedDate = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(words / 200));

  const components = useMDXComponents({});

  return (
    <article className="pb-20">
      <Link
        href="/"
        className="group mb-10 inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-foreground/40 transition-colors hover:text-accent"
      >
        <span className="transition-transform group-hover:-translate-x-0.5">←</span>
        Index
      </Link>
      <header className="mb-12 space-y-5">
        <div className="space-y-3">
          <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground">
            {frontmatter.title}
          </h1>
          <div className="flex items-center gap-2 font-mono text-xs text-foreground/40 tabular-nums">
            <time dateTime={date.toISOString()}>{formattedDate}</time>
            <span className="text-accent">/</span>
            <span>{readingTime} min read</span>
          </div>
        </div>
        {frontmatter.subtitle && (
          <p className="font-serif text-lg italic leading-relaxed text-foreground/60">
            {frontmatter.subtitle}
          </p>
        )}
      </header>

      <div className="prose-custom">
        <MDXRemote
          source={content}
          components={components}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                [
                  rehypePrettyCode,
                  {
                    theme: {
                      dark: "github-dark-default",
                      light: "github-light",
                    },
                    defaultColor: false,
                    keepBackground: false,
                  },
                ],
              ],
            }
          }}
        />
      </div>
    </article>
  );
}
