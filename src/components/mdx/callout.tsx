import { ReactNode } from "react";

type CalloutTone = "info" | "success" | "warning";

type CalloutProps = {
  children: ReactNode;
  title?: string;
  tone?: CalloutTone;
};

const toneClasses: Record<CalloutTone, string> = {
  info: "border-sky-500/25 bg-sky-500/[0.06]",
  success: "border-emerald-500/25 bg-emerald-500/[0.06]",
  warning: "border-amber-500/30 bg-amber-500/[0.07]",
};

const toneTitleClasses: Record<CalloutTone, string> = {
  info: "text-sky-600 dark:text-sky-400",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
};

export function Callout({
  children,
  title = "Note",
  tone = "info",
}: CalloutProps) {
  return (
    <aside
      role="note"
      className={`my-6 rounded-lg border px-4 py-3.5 ${toneClasses[tone]}`}
    >
      <p
        className={`mb-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.2em] ${toneTitleClasses[tone]}`}
      >
        {title}
      </p>
      <div className="text-[0.95rem] leading-relaxed text-foreground/80 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
