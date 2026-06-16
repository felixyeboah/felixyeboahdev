import Link from "next/link";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  experience,
  featuredProjects,
  archiveProjects,
  socials,
} from "@/lib/data";

function getPosts() {
  const docsDir = path.join(process.cwd(), "src/content/blog");
  if (!fs.existsSync(docsDir)) return [];

  const entries = fs.readdirSync(docsDir, { withFileTypes: true });

  const posts = entries
    .filter((entry) => entry.isDirectory())
    .map((dir) => {
      const fullPath = path.join(docsDir, dir.name, "page.mdx");
      if (!fs.existsSync(fullPath)) return null;

      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      if (!data.title) return null;

      const dateString = data.date ? data.date : "1970-01-01T00:00:00.000Z";
      const date = new Date(dateString);

      return {
        slug: dir.name,
        title: data.title as string,
        date,
        formattedDate: date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
      };
    })
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return posts;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-foreground/40">
      {children}
    </h2>
  );
}

export default function Home() {
  const posts = getPosts();

  return (
    <main className="pb-20 text-base">
      {/* Hero */}
      <section className="rise mb-20" style={{ animationDelay: "0ms" }}>
        <h1 className="font-serif text-2xl leading-snug tracking-tight sm:text-[1.7rem]">
          I build functional, beautiful interfaces for the web and mobile
          <span className="text-foreground/45"> — and the systems behind them.</span>
        </h1>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-foreground/40">
          Senior Frontend Engineer
          <span className="mx-2 text-accent">/</span>
          Currently building Reevit
        </p>
        <p className="mt-6 font-serif text-[1.05rem] leading-relaxed text-foreground/80">
          A software developer and life-long learner. Over the years I&apos;ve
          built functional, beautiful interfaces and experiences that leave a
          positive impact on people and businesses. I&apos;m currently building{" "}
          <Link
            href="https://reevit.io"
            target="_blank"
            className="text-foreground underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            Reevit
          </Link>
          {" "}— one API for payments with routing, retries, billing, and
          telemetry, so teams can accept payments, automate subscriptions, and
          fail over between providers without rewriting code.
        </p>
      </section>

      {/* Experience */}
      <section className="rise mb-20" style={{ animationDelay: "90ms" }}>
        <SectionLabel>Experience</SectionLabel>
        <div className="flex flex-col gap-4">
          {experience.map((job, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                <span>{job.role}</span>
                <span className="text-sm text-foreground/50">{job.company}</span>
              </div>
              <span className="whitespace-nowrap text-right text-sm tabular-nums text-foreground/50">
                {job.date}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Selected Work */}
      <section className="rise mb-20" style={{ animationDelay: "180ms" }}>
        <SectionLabel>Selected Work</SectionLabel>
        <div className="flex flex-col gap-px">
          {featuredProjects.map((project) => (
            <Link
              key={project.name}
              href={project.url}
              target="_blank"
              className="group flex items-baseline justify-between gap-4 border-b border-foreground/10 py-3 transition-colors first:border-t hover:border-foreground/30"
            >
              <span className="flex items-baseline gap-2 transition-colors group-hover:text-accent">
                {project.name}
                <span
                  aria-hidden="true"
                  className="translate-x-0 text-foreground/30 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-accent"
                >
                  ↗
                </span>
              </span>
              <span className="whitespace-nowrap text-sm text-foreground/50">
                {project.category}
              </span>
            </Link>
          ))}
        </div>

        {/* Archive */}
        <details className="group mt-8">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-foreground/40 transition-colors hover:text-foreground/70">
            <span className="transition-transform group-open:rotate-90">→</span>
            More work ({archiveProjects.length})
          </summary>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground/55">
            {archiveProjects.map((project) => (
              <Link
                key={project.name}
                href={project.url}
                target="_blank"
                className="underline decoration-foreground/20 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                {project.name}
              </Link>
            ))}
          </div>
        </details>
      </section>

      {/* Writing */}
      {posts.length > 0 && (
        <section className="rise mb-20" style={{ animationDelay: "270ms" }}>
          <SectionLabel>Writing</SectionLabel>
          <div className="flex flex-col gap-px">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/docs/${post.slug}`}
                className="group flex items-baseline justify-between gap-4 border-b border-foreground/10 py-3 transition-colors first:border-t hover:border-foreground/30"
              >
                <span className="truncate transition-colors group-hover:text-accent">
                  {post.title}
                </span>
                <span className="hidden whitespace-nowrap text-sm tabular-nums text-foreground/50 sm:inline-block">
                  {post.formattedDate}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Connect */}
      <section className="rise" style={{ animationDelay: "360ms" }}>
        <SectionLabel>Connect</SectionLabel>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {socials.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              target={social.href.startsWith("http") ? "_blank" : undefined}
              className="text-foreground/60 underline decoration-foreground/20 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
            >
              {social.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
