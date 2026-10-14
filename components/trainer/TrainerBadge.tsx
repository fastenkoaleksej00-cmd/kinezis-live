import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Verified-trainer mark. Shown only when `authors.verified` is true in the database. */
export function TrainerBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)} title={label} aria-label={label}>
      <BadgeCheck className="text-accent h-4 w-4" strokeWidth={2.2} aria-hidden />
    </span>
  );
}
