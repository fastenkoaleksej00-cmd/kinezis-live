"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { useA11y, writeA11y, type Theme } from "@/components/settings/AccessibilityProvider";
import { cn } from "@/lib/utils";

/** Self-contained palettes so each preview shows its own theme regardless of the active one */
const palettes: Record<"mint" | "light" | "dark" | "glass" | "cyber" | "neomint" | "pearl" | "aurora", { page: string; card: string; text: string; muted: string; accent: string; ring: string; nav: string; cover: string }> = {
  mint: { page: "#eef7f4", card: "#ffffff", text: "#10242b", muted: "#4f6f68", accent: "#2f8f7e", ring: "#2f8f7e", nav: "rgba(255,255,255,0.85)", cover: "linear-gradient(160deg,#1f4a45,#6fa89c)" },
  light: { page: "#f5f8f8", card: "#ffffff", text: "#10242b", muted: "#4f6b76", accent: "#2f7d70", ring: "#2f7d70", nav: "rgba(255,255,255,0.85)", cover: "linear-gradient(160deg,#19343d,#769aa8)" },
  dark: { page: "#0d171c", card: "#142127", text: "#e7f4f7", muted: "#97adb6", accent: "#3fa08f", ring: "#8fd3c4", nav: "rgba(26,43,50,0.9)", cover: "linear-gradient(160deg,#19343d,#31525d)" },
  glass: { page: "radial-gradient(120% 80% at 0% 0%,#b9f0ea 0%,transparent 55%),radial-gradient(120% 90% at 100% 100%,#d9c8ff 0%,transparent 55%),#e8edfb", card: "rgba(255,255,255,0.5)", text: "#1a2140", muted: "#5b6488", accent: "#5b74f2", ring: "#14b8a6", nav: "rgba(255,255,255,0.45)", cover: "linear-gradient(135deg,#14b8a6,#5b74f2 55%,#8b5cf6)" },
  cyber: { page: "radial-gradient(90% 60% at 100% 0%,rgba(168,85,247,0.35),transparent 60%),radial-gradient(90% 60% at 0% 100%,rgba(0,229,255,0.25),transparent 60%),#070a12", card: "rgba(16,22,40,0.92)", text: "#eef3ff", muted: "#8a95b8", accent: "#00e5ff", ring: "#c084fc", nav: "rgba(10,14,26,0.9)", cover: "linear-gradient(135deg,#0b1026,#2a0f55 55%,#06343f)" },
  neomint: { page: "radial-gradient(90% 60% at 0% 0%,rgba(61,255,197,0.35),transparent 60%),radial-gradient(90% 60% at 100% 100%,rgba(34,211,238,0.22),transparent 60%),#03110e", card: "rgba(10,34,29,0.72)", text: "#e8fff7", muted: "#86b8aa", accent: "#3dffc5", ring: "#5eead4", nav: "rgba(4,20,17,0.85)", cover: "linear-gradient(135deg,#052e26,#0f766e 55%,#3dffc5)" },
  pearl: { page: "radial-gradient(90% 60% at 0% 0%,#c9f7e8 0%,transparent 60%),radial-gradient(90% 70% at 100% 100%,#e6ddff 0%,transparent 60%),#f1fbf8", card: "rgba(255,255,255,0.6)", text: "#0f2e28", muted: "#55776f", accent: "#0f9f84", ring: "#34d3b0", nav: "rgba(255,255,255,0.55)", cover: "linear-gradient(135deg,#a7f3d0,#5eead4 45%,#c4b5fd)" },
  aurora: { page: "radial-gradient(80% 55% at 0% 0%,rgba(45,226,230,0.4),transparent 60%),radial-gradient(80% 60% at 100% 40%,rgba(139,92,246,0.45),transparent 60%),radial-gradient(70% 50% at 40% 100%,rgba(244,114,182,0.3),transparent 60%),#070b1f", card: "rgba(255,255,255,0.1)", text: "#f2f5ff", muted: "#a9b3d6", accent: "#7aa8ff", ring: "#5eead4", nav: "rgba(255,255,255,0.08)", cover: "linear-gradient(135deg,#22d3ee,#3b82f6 40%,#8b5cf6 75%,#f472b6)" },
};

const order: Array<"mint" | "light" | "dark" | "glass" | "cyber" | "neomint" | "pearl" | "aurora"> = ["mint", "light", "dark", "glass", "cyber", "neomint", "pearl", "aurora"];

/** Three live miniature screens; tapping one applies the theme instantly with a cross-fade. Mint is preselected. */
export function ThemePicker() {
  const t = useTranslations("settings.accessibility");
  const a11y = useA11y();
  const current: Theme = a11y.theme === "system" ? "mint" : a11y.theme;

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4" role="radiogroup" aria-label={t("appearance")}>
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
              <div className="mx-2.5 mt-2 flex items-center gap-2 rounded-xl p-2" style={{ background: p.card, border: key === "aurora" ? "1px solid rgba(255,255,255,0.28)" : key === "pearl" ? "1px solid rgba(255,255,255,0.9)" : key === "neomint" ? "1px solid rgba(61,255,197,0.35)" : key === "cyber" ? "1px solid rgba(0,229,255,0.35)" : key === "glass" ? "1px solid rgba(255,255,255,0.8)" : undefined, boxShadow: key === "aurora" ? "inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 18px -8px rgba(139,92,246,0.5)" : key === "pearl" ? "inset 0 1px 0 #fff, 0 6px 14px -6px rgba(15,159,132,0.35)" : key === "neomint" ? "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 14px rgba(61,255,197,0.3)" : key === "cyber" ? "0 0 12px rgba(0,229,255,0.25)" : undefined }}>
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
