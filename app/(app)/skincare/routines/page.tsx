import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ListChecks } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { listRoutines } from "@/lib/content/skincare";

/** Routines list. Items come from the trainer; until then an honest empty state. */
export default async function SkincareRoutinesPage() {
  const t = await getTranslations("skincare");
  const items = listRoutines();

  return (
    <Container as="section" className="space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/skincare" className={buttonStyles("ghost", "sm", "-ml-3 mb-2")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("title")}
        </Link>
        <SectionHeading as="h1" title={t("routines.title")} lead={t("routines.body")} />
      </Reveal>
      <Reveal delay={0.06}>
        {items.length === 0 ? <EmptyState icon={ListChecks} title={t("routines.emptyTitle")} body={t("routines.emptyBody")} /> : null}
      </Reveal>
    </Container>
  );
}
