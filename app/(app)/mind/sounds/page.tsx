import { getTranslations } from "next-intl/server";
import { FocusSounds } from "@/components/mind/FocusSounds";
import { MindPage } from "@/components/mind/MindPage";

export default async function SoundsPage() {
  const t = await getTranslations("mind.sounds");
  return (
    <MindPage title={t("title")} lead={t("lead")}>
      <div className="card p-5 sm:p-6">
        <FocusSounds />
      </div>
    </MindPage>
  );
}
