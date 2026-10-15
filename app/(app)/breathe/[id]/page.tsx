import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { BreathSession } from "@/components/breath/BreathSession";
import { EvidenceBadge } from "@/components/breath/EvidenceBadge";
import { SaveButton } from "@/components/library/SaveButton";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { evidenceById, sourceById } from "@/lib/breath/evidence";
import { practiceById } from "@/lib/breath/practices";
import { pick } from "@/lib/content/localize";
import type { Locale } from "@/i18n/config";
import { getSessionUser } from "@/lib/supabase/server";
import { breathKey } from "@/lib/store/keys";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PracticePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const practice = practiceById[id];
  if (!practice) notFound();
  const sp = await searchParams;
  const t = await getTranslations("breath");
  const locale = (await getLocale()) as Locale;
  const user = await getSessionUser();
  const requested = Number(sp.minutes);
  const minutes = practice.durations.includes(requested) ? requested : practice.durations[Math.min(1, practice.durations.length - 1)];
  const ev = evidenceById[practice.evidence];

  return (
    <Container as="article" className="max-w-[760px] space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/breathe" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("title")}
        </Link>
        <div className="flex items-start justify-between gap-3">
          <SectionHeading as="h1" eyebrow={t(`categories.${practice.category}`)} title={pick(practice.title, locale)} lead={pick(practice.purpose, locale)} />
          <SaveButton itemKey={breathKey(practice.id)} look="solid" />
        </div>
      </Reveal>

      <Reveal delay={0.05} className="card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {practice.durations.map((m) => (
            <Link key={m} href={`/breathe/${practice.id}?minutes=${m}`} scroll={false} className={cn("inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold transition-colors", minutes === m ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}>
              {t("minutes", { count: m })}
            </Link>
          ))}
        </div>
        <BreathSession key={`${practice.id}-${minutes}`} practice={practice} minutes={minutes} signedIn={Boolean(user)} autoStart={sp.autostart === "1"} />
      </Reveal>

      <Reveal delay={0.1} as="section" className="card space-y-3 p-5">
        <p className="text-text text-[15px] leading-relaxed">{pick(practice.description, locale)}</p>
        <ol className="space-y-2">
          {practice.steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="bg-mint-soft text-mint-deep inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">{i + 1}</span>
              <span className="text-text">{pick(s, locale)}</span>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={0.14} as="section" className="rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] p-4 text-sm text-[#8a2f2f]">
        <p className="font-semibold">{t("cautionsTitle")}</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-5">
          {practice.cautions.map((c, i) => (
            <li key={i}>{pick(c, locale)}</li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.18} as="section" className="card space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-ink text-base font-bold">{t("evidence.title")}</h2>
          <EvidenceBadge level={ev.level} />
        </div>
        <p className="text-ink text-sm font-semibold">{pick(ev.claim, locale)}</p>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {([
            ["population", ev.population],
            ["intervention", ev.intervention],
            ["outcomes", ev.outcomes],
            ["limitations", ev.limitations],
          ] as const).map(([k, v]) => (
            <div key={k} className="bg-frost/70 rounded-2xl px-3.5 py-2.5">
              <dt className="text-steel text-[11px] font-semibold tracking-[0.12em] uppercase">{t(`evidence.${k}`)}</dt>
              <dd className="text-text mt-0.5">{pick(v, locale)}</dd>
            </div>
          ))}
        </dl>
        <details className="group">
          <summary className="text-accent cursor-pointer text-sm font-semibold">{t("evidence.sources", { count: ev.sources.length })}</summary>
          <ul className="mt-2 space-y-2">
            {ev.sources.map((sid) => {
              const s = sourceById[sid];
              return (
                <li key={sid} className="text-steel text-xs">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent inline-flex items-start gap-1 hover:underline">
                    <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                    <span>{s.citation}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="text-steel mt-2 text-xs">{t("evidence.checked", { date: ev.checked })}</p>
        </details>
      </Reveal>
    </Container>
  );
}
