import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Sparkles } from "lucide-react";
import type { SessionUser } from "@/lib/supabase/server";

interface PremiumBannerProps {
  user: SessionUser | null;
}

/**
 * Home banner: the value of Premium is a trainer by your side. Shown to everyone on the free plan.
 * The small line under the button says it is launching soon; nothing pretends to work.
 */
export async function PremiumBanner({ user }: PremiumBannerProps) {
  if (user && user.plan !== "free") return null;
  const t = await getTranslations("premium");
  const goals = ["shape", "wellbeing", "skin", "nutrition", "questions"] as const;

  return (
    <Link href="/premium" className="group block">
      <section className="section-deep relative overflow-hidden rounded-3xl p-6 text-white shadow-[var(--shadow-dark)] sm:p-8">
        <div className="grid-bg-dark pointer-events-none absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(169,223,210,0.35)_0%,rgba(169,223,210,0)_70%)] blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(142,220,240,0.3)_0%,rgba(142,220,240,0)_70%)] blur-2xl" aria-hidden />

        <div className="relative">
          <p className="text-mint inline-flex items-center gap-2 text-xs font-semibold tracking-[0.3em] uppercase">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t("eyebrow")}
          </p>
          <h2 className="text-frost mt-3 max-w-md text-[1.6rem] leading-[1.08] font-extrabold sm:text-[2.1rem]">{t("bannerTitle")}</h2>
          <p className="text-mist mt-2 max-w-lg text-sm sm:text-[15px]">{t("bannerBody")}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {goals.map((g) => (
              <li key={g} className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
                {t(`goals.${g}`)}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="text-ink inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold shadow-[0_14px_32px_-14px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5">
              {t("ctaTry")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-mist-2 text-xs">{t("soon")}</span>
          </div>
        </div>
      </section>
    </Link>
  );
}
