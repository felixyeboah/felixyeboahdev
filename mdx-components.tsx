import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { Callout } from "@/components/mdx/callout";
import { CloudinaryImage } from "@/components/mdx/cloudinary-image";
import { CodeBlock } from "@/components/mdx/code-block";
import { Tweet } from "react-tweet";

function isInternalLink(href: string) {
  return href.startsWith("/") || href.startsWith("#");
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <h1
        className="mt-2 mb-6 text-3xl font-bold tracking-tight text-foreground"
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className="mt-12 mb-4 border-b border-foreground/10 pb-2 text-xl font-semibold tracking-tight text-foreground"
        {...props}
      />
    ),
    h3: (props) => (
      <h3
        className="mt-8 mb-3 text-lg font-semibold text-foreground"
        {...props}
      />
    ),
    p: (props) => (
      <p
        className="my-4 leading-8 text-foreground/80"
        {...props}
      />
    ),
    a: ({ href = "", ...props }) =>
      isInternalLink(href) ? (
        <Link
          href={href}
          className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          {...props}
        />
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          {...props}
        />
      ),
    ul: (props) => (
      <ul
        className="my-4 list-disc space-y-2 pl-6 text-foreground/80"
        {...props}
      />
    ),
    ol: (props) => (
      <ol
        className="my-4 list-decimal space-y-2 pl-6 text-foreground/80"
        {...props}
      />
    ),
    li: (props) => <li className="pl-1" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="my-6 border-l-4 border-foreground/20 pl-4 italic text-foreground/80"
        {...props}
      />
    ),
    hr: (props) => (
      <hr className="my-10 border-foreground/10" {...props} />
    ),
    table: (props) => (
      <div className="my-6 overflow-x-auto">
        <table
          className="min-w-full border-collapse text-sm text-foreground/80"
          {...props}
        />
      </div>
    ),
    thead: (props) => (
      <thead
        className="border-b border-foreground/20 text-foreground font-semibold"
        {...props}
      />
    ),
    th: (props) => (
      <th className="px-4 py-2 text-left font-semibold" {...props} />
    ),
    td: (props) => (
      <td className="border-b border-foreground/10 px-4 py-2" {...props} />
    ),
    code: ({ className, ...props }) =>
      className ? (
        <code className={className} {...props} />
      ) : (
        <code
          className="rounded-md bg-foreground/10 px-1.5 py-1 font-mono text-[0.9em] text-foreground"
          {...props}
        />
      ),
    pre: (props) => <CodeBlock {...props} />,
    Callout: ({ variant, label, title, tone, children, ...props }: any) => (
      <Callout
        title={title || label}
        tone={tone || variant || "info"}
        {...props}
      >
        {children}
      </Callout>
    ),
    Info: ({ label, children, ...props }: any) => (
      <Callout title={label || "Note"} tone="info" {...props}>
        {children}
      </Callout>
    ),
    StaticTweet: ({ id }: any) => (
      <div className="my-6 flex justify-center">
        <Tweet id={id} />
      </div>
    ),
    Image: (props: any) => (
      <CloudinaryImage
        src={props.src}
        alt={props.alt}
        width={props.width}
        height={props.height}
      />
    ),
    ...components,
  };
}
