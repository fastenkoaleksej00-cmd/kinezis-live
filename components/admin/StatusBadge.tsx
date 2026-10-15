import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

type Review = "draft" | "pending" | "approved" | "rejected" | undefined;

/** Published/draft plus the review state when it matters (pending or rejected). */
export async function StatusBadge({ published, review }: { published: boolean; review?: Review }) {
  const t = await getTranslations("admin.status");
  const waiting = published && review === "pending";
  const rejected = review === "rejected";
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold tracking-wide uppercase", rejected ? "bg-[#fde8ea] text-[#b9344a]" : waiting ? "bg-accent-soft text-accent" : published ? "bg-mint-soft text-mint-deep" : "bg-bone-2 text-steel")}>
      {rejected ? t("rejected") : waiting ? t("pending") : published ? t("published") : t("draft")}
    </span>
  );
}
