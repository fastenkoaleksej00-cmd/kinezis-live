import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Check, MessageCircleHeart, Sparkles } from "lucide-react";
import { InterestButton } from "@/components/premium/InterestButton";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { planPrices } from "@/lib/access/plans";
import { getSessionUser } from "@/lib/supabase/server";

/**
 * Premium concept page. Describes what the plan will include, marks everything as
 * "launching soon" and collects interest. No prices are charged and no plan is changed here.
 */
export default async function PremiumPage() {
  const t = await getTranslations("premium");
  const user = await getSessionUser();
  const goals = ["shape", "wellbeing", "skin", "nutrition", "pregnancy", "questions"] as const;
  const includes = ["chat", "questions", "recommendations", "guidance", "motivation", "library"] as const;
  const free = ["freeVideos", "feed", "profiles", "likes", "basics"] as const;

  return (
    <Container as="section" className="max-w-[860px] space-y-8 py-6 sm:py-10">
      <Reveal>
        <section className="section-deep relative overflow-hidden rounded-3xl p-6 text-white shadow-[var(--shadow-dark)] sm:p-9">
          <div className="grid-bg-dark pointer-events-none absolute inset-0" aria-hidden />
          <div className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(169,223,210,0.35)_0%,rgba(169,223,210,0)_70%)] blur-2xl" aria-hidden />
          <div className="relative">
            <p className="text-mint inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.3em] uppercase">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {t("eyebrow")}
            </p>
            <h1 className="text-frost mt-3 max-w-xl text-[2rem] leading-[1.05] font-extrabold sm:text-[2.6rem]">{t("title")}</h1>
            <p className="text-mist mt-3 max-w-xl text-[15px] sm:text-base">{t("lead")}</p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {goals.map((g) => (
                <li key={g} className="text-frost flex items-start gap-2.5 text-sm">
                  <Check className="text-mint mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                  {t(`goals.${g}`)}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <InterestButton signedIn={Boolean(user)} interested={user?.premiumInterest ?? false} />
              <span className="text-mist-2 text-xs">{t("soon")}</span>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.06} as="section" className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <p className="eyebrow mb-2">{t("plans.free")}</p>
          <p className="text-ink text-2xl font-extrabold">{t("plans.freePrice")}</p>
          <ul className="mt-4 space-y-2">
            {free.map((f) => (
              <li key={f} className="text-text flex items-start gap-2.5 text-sm">
                <Check className="text-accent mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                {t(`free.${f}`)}
              </li>
            ))}
          </ul>
        </div>
        <div className="card border-mint-deep/30 relative p-5 sm:p-6">
          <span className="bg-mint-soft text-mint-deep absolute top-4 right-4 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">{t("soonShort")}</span>
          <p className="eyebrow mb-2">{t("plans.premium")}</p>
          <p className="text-ink text-2xl font-extrabold">
            ${planPrices.premium.monthly.toFixed(2)} <span className="text-steel text-sm font-semibold">{t("plans.perMonth")}</span>
          </p>
          <p className="text-steel mt-1 text-xs">{t("plans.plannedPrice")}</p>
          <ul className="mt-4 space-y-2">
            {includes.map((i) => (
              <li key={i} className="text-text flex items-start gap-2.5 text-sm">
                <Check className="text-mint-deep mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                {t(`includes.${i}`)}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal delay={0.1} as="section" className="card flex items-start gap-4 p-5">
        <span className="bg-accent-soft text-accent inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <MessageCircleHeart className="h-5 w-5" strokeWidth={1.8} aria-hidden />
        </span>
        <div className="text-sm">
          <p className="text-ink font-semibold">{t("laterTitle")}</p>
          <p className="text-steel mt-1">{t("laterBody", { plus: `$${planPrices.premium_plus.monthly.toFixed(2)}` })}</p>
        </div>
      </Reveal>

      <Reveal delay={0.14}>
        <p className="text-steel text-center text-xs">{t("disclaimer")}</p>
        <p className="text-steel mt-2 text-center text-xs">
          <Link href="/profile" className="text-accent font-semibold hover:underline">
            {t("backToProfile")}
          </Link>
        </p>
      </Reveal>
    </Container>
  );
}
