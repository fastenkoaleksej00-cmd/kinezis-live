"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Bookmark, Calculator, Droplets, Headphones, HeartPulse, History, NotebookPen, PersonStanding, Play, Settings2, ShoppingBag, Sparkles, UtensilsCrossed, Watch, Wind, type LucideIcon } from "lucide-react";
import { createLocalStore } from "@/lib/store/localStore";
import { homePrefsStore } from "@/lib/store/home";
import { cn } from "@/lib/utils";

const catalogue = [
  { id: "breathe", href: "/breathe", icon: Wind, tone: "mint" },
  { id: "body", href: "/body", icon: PersonStanding, tone: "accent" },
  { id: "water", href: "/health#water", icon: Droplets, tone: "sky" },
  { id: "goal", href: "/health/calculator", icon: Calculator, tone: "mint" },
  { id: "library", href: "/library", icon: Play, tone: "accent" },
  { id: "activity", href: "/profile/activity", icon: History, tone: "warm" },
  { id: "saved", href: "/saved", icon: Bookmark, tone: "accent" },
  { id: "health", href: "/health", icon: HeartPulse, tone: "mint" },
  { id: "nutrition", href: "/nutrition", icon: UtensilsCrossed, tone: "mint" },
  { id: "appleHealth", href: "/health/connect", icon: Watch, tone: "sky" },
  { id: "mind", href: "/mind", icon: Sparkles, tone: "mint" },
  { id: "shop", href: "/shop", icon: ShoppingBag, tone: "warm" },
  { id: "journal", href: "/mind/journal", icon: NotebookPen, tone: "warm" },
  { id: "sounds", href: "/mind/sounds", icon: Headphones, tone: "sky" },
] as const satisfies ReadonlyArray<{ id: string; href: string; icon: LucideIcon; tone: string }>;

type QuickId = (typeof catalogue)[number]["id"];
const defaults: QuickId[] = ["breathe", "body", "water", "goal", "library", "activity"];
const MAX = 6;
const MIN = 3;
const quickStore = createLocalStore<QuickId[]>("kl_quick", defaults);

const tones: Record<string, string> = {
  mint: "bg-mint-soft text-mint-deep",
  accent: "bg-accent-soft text-accent",
  sky: "bg-[#e3f3f8] text-[#2a7ea3]",
  warm: "bg-[#fdf0e1] text-[#c27a2c]",
};

/** Six one-tap shortcuts under the greeting; the set and order are per device (localStorage `kl_quick`). */
export function QuickAccess() {
  const t = useTranslations("home.quick");
  const raw = quickStore.useStore();
  const ids = raw.filter((id) => catalogue.some((c) => c.id === id));
  const shown = (ids.length >= MIN ? ids : defaults).slice(0, MAX);
  const [open, setOpen] = useState(false);
  const prefs = homePrefsStore.useStore();

  function toggle(id: QuickId) {
    if (shown.includes(id)) {
      if (shown.length > MIN) quickStore.write(shown.filter((x) => x !== id));
    } else if (shown.length < MAX) {
      quickStore.write([...shown, id]);
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {shown.map((id) => {
          const item = catalogue.find((c) => c.id === id)!;
          const Icon = item.icon;
          return (
            <Link key={id} href={item.href} className="card flex flex-col items-center gap-2 px-2 py-3.5 text-center transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 active:scale-95">
              <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-2xl", tones[item.tone])}>
                <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
              </span>
              <span className="text-ink text-xs font-semibold">{t(id)}</span>
            </Link>
          );
        })}
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="text-steel hover:text-ink inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-xs font-semibold transition-colors">
          <Settings2 className="h-3.5 w-3.5" aria-hidden />
          {t("customise")}
        </button>
      </div>
      {open ? (
        <div className="card pop-in space-y-3 p-4">
          <p className="text-steel text-xs">{t("customiseHint", { min: MIN, max: MAX })}</p>
          <div className="flex flex-wrap gap-2">
            {catalogue.map((c) => {
              const on = shown.includes(c.id);
              const Icon = c.icon;
              return (
                <button key={c.id} type="button" aria-pressed={on} onClick={() => toggle(c.id)} className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors", on ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}>
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {t(c.id)}
                </button>
              );
            })}
          </div>
          <div className="border-ink/8 space-y-2 border-t pt-3">
            <p className="text-steel text-xs">{t("homeWidgets")}</p>
            <div className="flex flex-wrap gap-2">
              {(["water", "checkin"] as const).map((k) => (
                <button key={k} type="button" aria-pressed={prefs[k]} onClick={() => homePrefsStore.write({ ...prefs, [k]: !prefs[k] })} className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors", prefs[k] ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}>
                  {k === "water" ? <Droplets className="h-3.5 w-3.5" aria-hidden /> : <NotebookPen className="h-3.5 w-3.5" aria-hidden />}
                  {t(`widget_${k}`)}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => quickStore.write(defaults)} className="text-accent text-xs font-semibold hover:underline">
            {t("reset")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
