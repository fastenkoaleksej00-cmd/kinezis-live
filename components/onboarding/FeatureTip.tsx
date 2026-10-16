"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ArrowRight, Lightbulb, X } from "lucide-react";
import { dismissTip, tipsStore, type TipId } from "@/lib/store/tips";

/**
 * One-time tip on a screen, part of the same introduction as /welcome. Hidden until the first-launch
 * introduction is done, once dismissed, or when tips are switched off in Settings.
 */
export function FeatureTip({ id, href }: { id: TipId; href?: string }) {
  const t = useTranslations("tips");
  const s = tipsStore.useStore();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let onboarded = true;
    try {
      onboarded = Boolean(window.localStorage.getItem("kl_onboarded"));
    } catch {
      onboarded = true;
    }
    setReady(onboarded);
  }, []);
  if (!ready || s.off || s.seen.includes(id)) return null;

  return (
    <aside className="pop-in card relative flex items-start gap-3 border-[color:var(--color-mint-deep)]/25 p-4 pr-10" role="note" aria-label={t("label")}>
      <span className="bg-mint-soft text-mint-deep inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
        <Lightbulb className="h-4 w-4" strokeWidth={2} aria-hidden />
      </span>
      <div className="min-w-0 text-sm">
        <p className="text-ink font-semibold">{t(`items.${id}.title`)}</p>
        <p className="text-steel mt-0.5">{t(`items.${id}.body`)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <button type="button" onClick={() => dismissTip(id)} className="text-accent text-xs font-semibold hover:underline">
            {t("gotIt")}
          </button>
          {href ? (
            <Link href={href} onClick={() => dismissTip(id)} className="text-accent inline-flex items-center gap-1 text-xs font-semibold hover:underline">
              {t(`items.${id}.action`)}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : null}
          <button type="button" onClick={() => tipsStore.write({ ...s, off: true })} className="text-steel hover:text-ink text-xs">
            {t("turnOff")}
          </button>
        </div>
      </div>
      <button type="button" onClick={() => dismissTip(id)} aria-label={t("close")} className="text-steel hover:text-ink absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full">
        <X className="h-4 w-4" aria-hidden />
      </button>
    </aside>
  );
}

/** Settings: switch screen tips on/off and replay them. */
export function TipsSettings() {
  const t = useTranslations("tips");
  const s = tipsStore.useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const on = mounted ? !s.off : true;
  return (
    <div className="flex flex-wrap items-center gap-4 px-5 py-4">
      <span className="bg-mint-soft text-mint-deep inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
        <Lightbulb className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-ink block font-semibold">{t("settingsTitle")}</span>
        <span className="text-steel block text-sm">{t("settingsBody")}</span>
      </span>
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={on} onChange={(e) => tipsStore.write({ ...s, off: !e.target.checked })} className="accent-[var(--color-mint-deep)] h-4 w-4" />
        {t("show")}
      </label>
      <button type="button" onClick={() => tipsStore.write({ seen: [], off: false })} className="text-accent text-sm font-semibold hover:underline">
        {t("replay")}
      </button>
    </div>
  );
}
