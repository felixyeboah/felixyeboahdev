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
        className="absolute top-2 right-2 z-10 rounded-md border border-neutral-200 bg-[#EAEFEF] backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-foreground opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
        aria-label="Copy code to clipboard"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre
        ref={preRef}
        className={`overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-foreground ${className}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
