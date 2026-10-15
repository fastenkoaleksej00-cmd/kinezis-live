"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { useA11y, writeA11y, type Theme } from "@/components/settings/AccessibilityProvider";
import { cn } from "@/lib/utils";

/** Self-contained palettes so each preview shows its own theme regardless of the active one */
const palettes: Record<"mint" | "light" | "dark", { page: string; card: string; text: string; muted: string; accent: string; ring: string; nav: string; cover: string }> = {
  mint: { page: "#eef7f4", card: "#ffffff", text: "#10242b", muted: "#4f6f68", accent: "#2f8f7e", ring: "#2f8f7e", nav: "rgba(255,255,255,0.85)", cover: "linear-gradient(160deg,#1f4a45,#6fa89c)" },
  light: { page: "#f5f8f8", card: "#ffffff", text: "#10242b", muted: "#4f6b76", accent: "#2f7d70", ring: "#2f7d70", nav: "rgba(255,255,255,0.85)", cover: "linear-gradient(160deg,#19343d,#769aa8)" },
  dark: { page: "#0d171c", card: "#142127", text: "#e7f4f7", muted: "#97adb6", accent: "#3fa08f", ring: "#8fd3c4", nav: "rgba(26,43,50,0.9)", cover: "linear-gradient(160deg,#19343d,#31525d)" },
};

const order: Array<"mint" | "light" | "dark"> = ["mint", "light", "dark"];

/** Three live miniature screens; tapping one applies the theme instantly with a cross-fade. Mint is preselected. */
export function ThemePicker() {
  const t = useTranslations("settings.accessibility");
  const a11y = useA11y();
  const current: Theme = a11y.theme === "system" ? "mint" : a11y.theme;

  return (
    <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label={t("appearance")}>
      {order.map((key) => {
        const p = palettes[key];
        const active = current === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => writeA11y({ ...a11y, theme: key })}
            className={cn("group flex flex-col items-center gap-2 rounded-3xl p-1.5 transition-transform duration-300 active:scale-[0.97]", active ? "ring-2 ring-mint-deep" : "ring-1 ring-ink/10")}
          >
            <div className="w-full overflow-hidden rounded-[18px] shadow-[var(--shadow-card)]" style={{ background: p.page, color: p.text }}>
              <div className="flex items-center justify-between px-2.5 pt-2.5">
                <span className="h-1.5 w-8 rounded-full" style={{ background: p.text, opacity: 0.7 }} />
                <span className="h-3 w-3 rounded-full" style={{ background: p.accent, opacity: 0.6 }} />
              </div>
              <div className="mx-2.5 mt-2 flex items-center gap-2 rounded-xl p-2" style={{ background: p.card }}>
                <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0 -rotate-90" aria-hidden>
                  <circle cx="16" cy="16" r="12" fill="none" stroke={p.text} strokeOpacity="0.1" strokeWidth="5" />
                  <circle cx="16" cy="16" r="12" fill="none" stroke={p.ring} strokeWidth="5" strokeLinecap="round" strokeDasharray="75" strokeDashoffset="25" />
                </svg>
                <span className="flex flex-col gap-1">
                  <span className="h-1.5 w-10 rounded-full" style={{ background: p.text, opacity: 0.8 }} />
                  <span className="h-1 w-7 rounded-full" style={{ background: p.muted, opacity: 0.6 }} />
                </span>
              </div>
              <div className="mx-2.5 mt-2 h-10 rounded-xl" style={{ background: p.cover }} />
              <div className="mx-2.5 mt-2 h-4 w-14 rounded-full" style={{ background: `linear-gradient(180deg, ${p.accent}, ${p.ring})` }} />
              <div className="mt-2.5 flex items-center justify-around px-2 py-2" style={{ background: p.nav }}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="h-2 w-2 rounded-full" style={{ background: i === 0 ? p.accent : p.muted, opacity: i === 0 ? 1 : 0.5 }} />
                ))}
              </div>
            </div>
            <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", active ? "text-ink" : "text-steel")}>
              {active ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : null}
              {t(`themes.${key}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
