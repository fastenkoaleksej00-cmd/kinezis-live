import { Lock } from "lucide-react";

/** Small glass pill with a lock, placed on covers of premium items. */
export function LockBadge({ label }: { label: string }) {
  return (
    <span className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-full border border-white/40 bg-ink/50 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.18em] text-white uppercase backdrop-blur-md">
      <Lock className="h-3 w-3" strokeWidth={2.2} aria-hidden />
      {label}
    </span>
  );
}
