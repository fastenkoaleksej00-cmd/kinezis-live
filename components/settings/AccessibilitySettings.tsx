"use client";

import { useTranslations } from "next-intl";
import { useA11y, writeA11y, type TextSize, type Theme } from "./AccessibilityProvider";
import { Gem, Leaf, Monitor, Moon, Sun, Zap } from "lucide-react";
import { ThemePicker } from "@/components/onboarding/ThemePicker";
import { cn } from "@/lib/utils";

const sizes: TextSize[] = ["normal", "large", "xl"];
const themes: Array<{ key: Theme; icon: typeof Sun }> = [
  { key: "mint", icon: Leaf },
  { key: "light", icon: Sun },
  { key: "dark", icon: Moon },
  { key: "glass", icon: Gem },
  { key: "cyber", icon: Zap },
  { key: "system", icon: Monitor },
];

/** Text size and reduced motion, per device. Applied immediately, remembered on this device. */
export function AccessibilitySettings() {
  const t = useTranslations("settings.accessibility");
  const a11y = useA11y();
  return (
    <section id="accessibility" className="card space-y-4 p-5">
      <div>
        <h2 className="text-ink text-base font-bold">{t("title")}</h2>
        <p className="text-steel mt-1 text-sm">{t("lead")}</p>
      </div>
      <div className="space-y-3">
        <p className="eyebrow">{t("appearance")}</p>
        <ThemePicker />
        <p className="text-steel text-xs">{t("mintNote")}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label={t("appearance")}>
          {themes.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={a11y.theme === key}
              onClick={() => writeA11y({ ...a11y, theme: key })}
              className={cn("inline-flex h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors", a11y.theme === key ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}
            >
              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
              {t(`themes.${key}`)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-2">{t("textSize")}</p>
        <div className="flex gap-2" role="radiogroup" aria-label={t("textSize")}>
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={a11y.textSize === s}
              onClick={() => writeA11y({ ...a11y, textSize: s })}
              className={cn("inline-flex h-10 flex-1 items-center justify-center rounded-full text-sm font-semibold transition-colors", a11y.textSize === s ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}
            >
              {t(`sizes.${s}`)}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center justify-between gap-4">
        <span>
          <span className="text-ink block text-sm font-semibold">{t("reduceMotion")}</span>
          <span className="text-steel block text-xs">{t("reduceMotionHint")}</span>
        </span>
        <input type="checkbox" checked={a11y.reduceMotion} onChange={(e) => writeA11y({ ...a11y, reduceMotion: e.target.checked })} className="h-5 w-5 shrink-0 rounded" />
      </label>
    </section>
  );
}
