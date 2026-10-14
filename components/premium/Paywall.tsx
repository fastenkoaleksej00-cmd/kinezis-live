import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Lock } from "lucide-react";

/** Replaces the player for premium content when the viewer's plan does not include it. */
export async function Paywall() {
  const t = await getTranslations("premium");
  return (
    <div className="glass-dark flex aspect-video flex-col items-center justify-center rounded-3xl p-6 text-center text-white">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10">
        <Lock className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="text-frost font-semibold">{t("lockedTitle")}</p>
      <p className="text-mist mt-1.5 max-w-sm text-sm">{t("lockedBody")}</p>
      <Link href="/premium" className="text-ink mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold">
        {t("ctaLearn")}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
