import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { logActivity } from "@/lib/profile/actions";
import { getSessionUser } from "@/lib/supabase/server";

interface LogActivityButtonProps {
  itemType: "workout" | "lesson" | "breath";
  itemId: string;
  title: string;
  durationMin?: number;
  back: string;
  /** Show the "logged" confirmation */
  logged?: boolean;
}

/** "I did this today": writes a row to the user's activity log. Signed-out visitors see nothing. */
export async function LogActivityButton({ itemType, itemId, title, durationMin, back, logged }: LogActivityButtonProps) {
  const user = await getSessionUser();
  if (!user) return null;
  const t = await getTranslations("activity");
  return (
    <form action={logActivity} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="item_type" value={itemType} />
      <input type="hidden" name="item_id" value={itemId} />
      <input type="hidden" name="title" value={title} />
      {durationMin ? <input type="hidden" name="duration_min" value={durationMin} /> : null}
      <input type="hidden" name="back" value={back} />
      <button type="submit" className={buttonStyles("secondary", "md")}>
        <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} aria-hidden />
        {t("markDone")}
      </button>
      {logged ? (
        <span className="pop-in text-mint-deep inline-flex items-center gap-1.5 text-sm font-semibold">
          <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          {t("loggedNotice")}
        </span>
      ) : null}
    </form>
  );
}
