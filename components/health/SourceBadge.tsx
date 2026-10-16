import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

export type DataSource = "manual" | "calculated" | "app" | "health" | "none";

/** Says where a number comes from. Never mixes manual, calculated and imported values silently. */
export async function SourceBadge({ source, className }: { source: DataSource; className?: string }) {
  const t = await getTranslations("health.sources");
  return (
    <span className={cn("inline-flex h-5 items-center rounded-full px-2 text-[0.6875rem] font-semibold tracking-[0.1em] uppercase", source === "health" ? "bg-[#fde8ea] text-[#b9344a]" : source === "calculated" ? "bg-accent-soft text-accent" : source === "app" ? "bg-mint-soft text-mint-deep" : "bg-bone-2 text-steel", className)}>
      {t(source)}
    </span>
  );
}
