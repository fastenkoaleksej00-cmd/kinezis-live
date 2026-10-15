import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** 0..100 */
  percent: number;
  color?: string;
  className?: string;
  label?: string;
}

/** Thin bar that grows to its value on mount. */
export function ProgressBar({ percent, color = "bg-mint-deep", className, label }: ProgressBarProps) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className={cn("bg-bone-2 h-1.5 overflow-hidden rounded-full", className)} role={label ? "progressbar" : undefined} aria-label={label} aria-valuenow={label ? p : undefined} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("bar-progress h-full rounded-full", color)} style={{ width: `${p}%` }} />
    </div>
  );
}
