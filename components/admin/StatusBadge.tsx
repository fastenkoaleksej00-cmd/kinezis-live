import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

export async function StatusBadge({ published }: { published: boolean }) {
  const t = await getTranslations("admin.status");
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold tracking-wide uppercase", published ? "bg-mint-soft text-mint-deep" : "bg-bone-2 text-steel")}>
      {published ? t("published") : t("draft")}
    </span>
  );
}
