"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { locales, type Locale } from "@/i18n/config";
import { setLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

/** Interface-language picker. Saves a cookie via a server action and re-renders the app. */
export function LanguageSwitcher() {
  const current = useLocale();
  const t = useTranslations("settings");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [chosen, setChosen] = useState<Locale>(current);

  function choose(next: Locale) {
    if (next === chosen) return;
    setChosen(next);
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div role="radiogroup" aria-label={t("language")} aria-busy={pending} className="space-y-2">
      {locales.map((code) => {
        const active = code === chosen;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            lang={code}
            onClick={() => choose(code)}
            className={cn(
              "flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-[15px] font-semibold transition-[background-color,border-color,box-shadow] duration-300 ease-[var(--ease-out-expo)]",
              active
                ? "border-accent/50 bg-white shadow-[0_0_0_3px_rgba(42,134,180,0.12)]"
                : "border-ink/8 bg-white/60 hover:border-accent/30 hover:bg-white",
            )}
          >
            <span className="text-ink">{t(`languages.${code}`)}</span>
            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-300",
                active ? "border-accent bg-accent text-white" : "border-mist text-transparent",
              )}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
            </span>
          </button>
        );
      })}
    </div>
  );
}
