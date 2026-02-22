import { ReactNode } from "react";

type CalloutTone = "info" | "success" | "warning";

type CalloutProps = {
  children: ReactNode;
  title?: string;
  tone?: CalloutTone;
};

const toneClasses: Record<CalloutTone, string> = {
  info: "border-blue-300/70 bg-blue-50/80 text-blue-950",
  success: "border-emerald-300/70 bg-emerald-50/80 text-emerald-950",
  warning: "border-amber-300/70 bg-amber-50/80 text-amber-950",
};

const toneTitleClasses: Record<CalloutTone, string> = {
  info: "text-blue-900",
  success: "text-emerald-900",
  warning: "text-amber-900",
};

export function Callout({
  children,
  title = "Note",
  tone = "info",
}: CalloutProps) {
  return (
    <aside
      className={`my-6 rounded-xl border p-4 text-sm leading-6 ${toneClasses[tone]}`}
      role="note"
    >
      <p className={`mb-1 font-semibold ${toneTitleClasses[tone]}`}>{title}</p>
      <div>{children}</div>
    </aside>
  );
}
