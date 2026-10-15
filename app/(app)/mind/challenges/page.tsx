import { getTranslations } from "next-intl/server";
import { ChallengesBoard } from "@/components/mind/ChallengesBoard";
import { MindPage } from "@/components/mind/MindPage";

export default async function ChallengesPage() {
  const t = await getTranslations("mind.challenges");
  return (
    <MindPage title={t("title")} lead={t("lead")} footer={<p className="text-steel text-xs">{t("note")}</p>}>
      <ChallengesBoard />
    </MindPage>
  );
}
