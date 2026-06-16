"use client";

import { HTMLAttributes, useRef, useState } from "react";

type CodeBlockProps = HTMLAttributes<HTMLPreElement>;

export function CodeBlock({
  className = "",
  children,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  async function handleCopy() {
    const text = preRef.current?.innerText ?? "";
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text.trimEnd());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="group relative my-6">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 z-10 rounded-md border border-foreground/15 bg-background/70 px-2.5 py-1 font-mono text-xs font-medium text-foreground/70 backdrop-blur-sm transition hover:text-accent opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        aria-label="Copy code to clipboard"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre
        ref={preRef}
        className={`overflow-x-auto rounded-xl border border-foreground/10 bg-foreground/[0.03] p-4 text-sm leading-6 ${className}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
