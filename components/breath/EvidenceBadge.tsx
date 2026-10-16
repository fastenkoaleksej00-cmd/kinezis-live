import { getTranslations } from "next-intl/server";
import type { EvidenceLevel } from "@/lib/breath/types";
import { cn } from "@/lib/utils";

export async function EvidenceBadge({ level, className }: { level: EvidenceLevel; className?: string }) {
  const t = await getTranslations("breath.evidence");
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase", level === "established" ? "bg-mint-soft text-mint-deep" : level === "encouraging" ? "bg-accent-soft text-accent" : "bg-bone-2 text-steel", className)}>
      {t(`levels.${level}`)}
    </span>
  );
}
