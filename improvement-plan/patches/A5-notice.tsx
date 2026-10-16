// PROPOSED (not applied). Target path: components/ui/Notice.tsx
// Replaces 33 copies of the pink error box and the yellow/mint notices with theme tokens.
// Add to app/globals.css @theme:
//   --color-danger: #8a2f2f; --color-danger-soft: #fdf2f2; --color-danger-line: #e3b4b4;
//   --color-warning: #7a5418; --color-warning-soft: #fdf6ea; --color-warning-line: #e8c48a;
// and dark/cyber overrides, e.g. html[data-theme="dark"] { --color-danger: #ffb4b4; --color-danger-soft: #3a1f24; --color-danger-line: #6b3038; }
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  danger: { box: "border-[var(--color-danger-line)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]", icon: AlertTriangle },
  warning: { box: "border-[var(--color-warning-line)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]", icon: AlertTriangle },
  success: { box: "border-transparent bg-mint-soft text-mint-deep", icon: CheckCircle2 },
  info: { box: "border-transparent bg-accent-soft text-accent", icon: Info },
} as const;

export function Notice({ tone = "info", title, children, className }: { tone?: keyof typeof tones; title?: string; children: React.ReactNode; className?: string }) {
  const { box, icon: Icon } = tones[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex items-start gap-3 rounded-2xl border p-3 text-sm", box, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-0.5" : undefined}>{children}</div>
      </div>
    </div>
  );
}
