import { getTranslations } from "next-intl/server";
import { MindEvidence } from "@/components/mind/MindEvidence";
import { MindPage } from "@/components/mind/MindPage";
import { EveningRitual } from "@/components/mind/MindPlayers";
import { getSessionUser } from "@/lib/supabase/server";

export default async function EveningPage() {
  const t = await getTranslations("mind.evening");
  const user = await getSessionUser();
  return (
    <MindPage
      title={t("title")}
      lead={t("lead")}
      footer={
        <div className="space-y-4">
          <MindEvidence id="evening" />
          <MindEvidence id="gratitude" />
        </div>
      }
    >
      <div className="card p-5 sm:p-6">
        <EveningRitual signedIn={Boolean(user)} />
      </div>
    </MindPage>
  );
}
