import { FeatureTip } from "@/components/onboarding/FeatureTip";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight, Flag, Headphones, Monitor, Moon, NotebookPen, ScanLine, Sparkles, Wind } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/i18n/config";
import { pick } from "@/lib/content/localize";
import { meditations } from "@/lib/mind/content";

/** Mind & rest hub: meditation, screen break, evening ritual, journal, challenges, focus sounds, link to breathing. */
export default async function MindPage() {
  const t = await getTranslations("mind");
  const locale = (await getLocale()) as Locale;
  const tiles = [
    ...meditations.map((m) => ({ href: `/mind/meditate/${m.id}`, icon: m.id === "body-scan" ? ScanLine : Sparkles, title: pick(m.title, locale), body: pick(m.purpose, locale), tone: "mint" })),
    { href: "/mind/break", icon: Monitor, title: t("break.title"), body: t("break.lead"), tone: "accent" },
    { href: "/mind/evening", icon: Moon, title: t("evening.title"), body: t("evening.lead"), tone: "accent" },
    { href: "/mind/journal", icon: NotebookPen, title: t("journal.title"), body: t("journal.lead"), tone: "mint" },
    { href: "/mind/challenges", icon: Flag, title: t("challenges.title"), body: t("challenges.lead"), tone: "warm" },
    { href: "/mind/sounds", icon: Headphones, title: t("sounds.title"), body: t("sounds.lead"), tone: "sky" },
    { href: "/breathe", icon: Wind, title: t("breatheTitle"), body: t("breatheBody"), tone: "mint" },
  ];
  const tones: Record<string, string> = { mint: "bg-mint-soft text-mint-deep", accent: "bg-accent-soft text-accent", warm: "bg-[#fdf0e1] text-[#c27a2c]", sky: "bg-[#e3f3f8] text-[#2a7ea3]" };

  return (
    <Container as="section" className="max-w-[860px] space-y-6 py-4 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      </Reveal>
      <FeatureTip id="mind" href="/mind/sounds" />
      <div className="grid gap-3 sm:grid-cols-2">
        {tiles.map(({ href, icon: Icon, title, body, tone }, i) => (
          <Reveal key={href} delay={0.04 * (i + 1)}>
            <Link href={href} className="card group flex h-full items-start gap-4 p-4 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5">
              <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}>
                <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-ink block font-bold">{title}</span>
                <span className="text-steel mt-0.5 block text-sm">{body}</span>
              </span>
              <ArrowUpRight className="text-steel group-hover:text-ink h-4 w-4 shrink-0 transition-colors" aria-hidden />
            </Link>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.4}>
        <p className="text-steel text-xs">{t("disclaimer")}</p>
      </Reveal>
    </Container>
  );
}
