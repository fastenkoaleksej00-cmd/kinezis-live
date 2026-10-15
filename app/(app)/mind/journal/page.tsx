import { getTranslations } from "next-intl/server";
import { CheckInForm, JournalHistory } from "@/components/mind/Journal";
import { MindPage } from "@/components/mind/MindPage";
import { getSessionUser } from "@/lib/supabase/server";

export default async function JournalPage() {
  const t = await getTranslations("mind.journal");
  const user = await getSessionUser();
  return (
    <MindPage title={t("title")} lead={t("lead")} footer={<p className="text-steel text-xs">{user ? t("privacySigned") : t("privacyGuest")}</p>}>
      <div className="space-y-5">
        <section className="card space-y-3 p-5">
          <h2 className="text-ink text-base font-bold">{t("today")}</h2>
          <CheckInForm />
        </section>
        <section className="space-y-3">
          <h2 className="text-ink text-base font-bold">{t("historyTitle")}</h2>
          <JournalHistory />
        </section>
        <p className="text-steel text-xs">{t("disclaimer")}</p>
      </div>
    </MindPage>
  );
}
