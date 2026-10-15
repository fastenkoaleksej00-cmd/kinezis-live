import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Activity, BedDouble, Footprints, HeartPulse, ShieldCheck, Wind } from "lucide-react";
import { HealthConnectStatus } from "@/components/health/HealthConnectStatus";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";

const categories = [
  { key: "steps", icon: Footprints },
  { key: "workouts", icon: Activity },
  { key: "heart", icon: HeartPulse },
  { key: "sleep", icon: BedDouble },
  { key: "breathing", icon: Wind },
] as const;

/** Apple Health: what the app will ask for and why, the permission flow, and the real current status. */
export default async function HealthConnectPage() {
  const t = await getTranslations("connect");
  const th = await getTranslations("health");
  return (
    <Container as="section" className="max-w-[760px] space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/health" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {th("title")}
        </Link>
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      </Reveal>

      <Reveal delay={0.05}>
        <HealthConnectStatus />
      </Reveal>

      <Reveal delay={0.08} as="section" className="space-y-3">
        <h2 className="text-ink text-base font-bold">{t("categoriesTitle")}</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {categories.map(({ key, icon: Icon }) => (
            <li key={key} className="card flex items-start gap-3 p-4">
              <span className="bg-mint-soft text-mint-deep inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
                <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
              </span>
              <span>
                <span className="text-ink block text-sm font-semibold">{t(`categories.${key}.title`)}</span>
                <span className="text-steel block text-xs">{t(`categories.${key}.why`)}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="text-steel text-xs">{t("categoriesNote")}</p>
      </Reveal>

      <Reveal delay={0.12} as="section" className="card space-y-3 p-5">
        <h2 className="text-ink text-base font-bold">{t("flowTitle")}</h2>
        <ol className="space-y-2">
          {([1, 2, 3, 4, 5, 6] as const).map((n) => (
            <li key={n} className="flex gap-3 text-sm">
              <span className="bg-mint-soft text-mint-deep inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">{n}</span>
              <span className="text-text">{t(`flow.${n}`)}</span>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={0.16} as="section" className="card flex items-start gap-4 p-5">
        <span className="bg-accent-soft text-accent inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.8} aria-hidden />
        </span>
        <div className="text-sm">
          <p className="text-ink font-semibold">{t("privacyTitle")}</p>
          <ul className="text-steel mt-1 list-disc space-y-1 pl-4">
            <li>{t("privacy.1")}</li>
            <li>{t("privacy.2")}</li>
            <li>{t("privacy.3")}</li>
            <li>{t("privacy.4")}</li>
          </ul>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <p className="text-steel text-xs">{t("manualNote")}</p>
      </Reveal>
    </Container>
  );
}
