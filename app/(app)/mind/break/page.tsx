import { getLocale, getTranslations } from "next-intl/server";
import { MindEvidence } from "@/components/mind/MindEvidence";
import { MindPage } from "@/components/mind/MindPage";
import { BreakPlayer } from "@/components/mind/MindPlayers";
import type { Locale } from "@/i18n/config";
import { pick } from "@/lib/content/localize";
import { screenBreakCautions } from "@/lib/mind/content";
import { getSessionUser } from "@/lib/supabase/server";

export default async function BreakPage() {
  const t = await getTranslations("mind.break");
  const locale = (await getLocale()) as Locale;
  const user = await getSessionUser();
  return (
    <MindPage
      title={t("title")}
      lead={t("lead")}
      footer={
        <div className="space-y-4">
          <p className="bg-frost/70 text-steel rounded-2xl px-4 py-3 text-sm">{pick(screenBreakCautions[0], locale)}</p>
          <MindEvidence id="breaks" />
        </div>
      }
    >
      <div className="card p-5 sm:p-6">
        <BreakPlayer signedIn={Boolean(user)} />
      </div>
    </MindPage>
  );
}
