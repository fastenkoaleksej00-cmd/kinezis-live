"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Droplets, Minus, Plus, Settings2 } from "lucide-react";
import { addWater, localDay, setWaterGoal, setWaterPortion, undoWater, waterPortions, waterStore } from "@/lib/store/water";
import { cn } from "@/lib/utils";

interface WaterWidgetProps {
  /** Compact for Home; full shows the 7-day history and goal editor open */
  variant?: "home" | "full";
  id?: string;
}

/** Manual water log. Nothing is measured automatically; the goal is the user's own, not a medical norm. */
export function WaterWidget({ variant = "home", id }: WaterWidgetProps) {
  const t = useTranslations("water");
  const s = waterStore.useStore();
  const [editing, setEditing] = useState(false);
  const [goalDraft, setGoalDraft] = useState("");
  const today = s.days[localDay()] ?? 0;
  const pct = Math.min(100, Math.round((today / s.goal) * 100));
  const now = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const key = localDay(d);
    return { key, ml: s.days[key] ?? 0, label: d.toLocaleDateString(undefined, { weekday: "narrow" }) };
  });

  return (
    <section id={id} className="card relative overflow-hidden p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow mb-1 inline-flex items-center gap-2">
            <Droplets className="h-3.5 w-3.5" aria-hidden />
            {t("eyebrow")}
          </p>
          <h2 className="text-ink text-lg font-bold">{t("title")}</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setGoalDraft(String(s.goal));
            setEditing((e) => !e);
          }}
          aria-expanded={editing}
          aria-label={t("goalEdit")}
          className="border-ink/10 text-ink inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/70"
        >
          <Settings2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-5">
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-[22px] border-2 border-[#bfe3ec] bg-[#f1fafc]" role="img" aria-label={t("progressLabel", { ml: today, goal: s.goal })}>
          <div className="water-fill absolute inset-x-0 bottom-0" style={{ height: `${pct}%` }} />
          <span className="text-ink absolute inset-0 flex items-center justify-center text-sm font-extrabold drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">{pct}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-ink text-2xl font-extrabold tabular-nums">
            {today} <span className="text-steel text-sm font-semibold">/ {s.goal} ml</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {waterPortions.map((p) => (
              <button key={p} type="button" aria-pressed={s.portion === p} onClick={() => setWaterPortion(p)} className={cn("inline-flex h-8 items-center rounded-full px-2.5 text-xs font-semibold transition-colors", s.portion === p ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}>
                {p}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button type="button" onClick={() => addWater(s.portion)} className="bg-linear-to-b from-ink-2 to-ink inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition-transform active:scale-95">
              <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              {t("add", { ml: s.portion })}
            </button>
            <button type="button" onClick={undoWater} disabled={s.lastAdds.length === 0} aria-label={t("undo")} className="border-ink/10 text-ink inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/70 disabled:opacity-40">
              <Minus className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {editing ? (
        <form
          className="bg-frost/70 mt-4 flex flex-wrap items-end gap-3 rounded-2xl p-3"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(goalDraft);
            if (Number.isFinite(n) && n > 0) setWaterGoal(n);
            setEditing(false);
          }}
        >
          <label className="flex-1">
            <span className="text-steel mb-1 block text-xs font-semibold">{t("goalLabel")}</span>
            <input type="number" inputMode="numeric" min={200} max={10000} step={50} value={goalDraft} onChange={(e) => setGoalDraft(e.target.value)} className="border-ink/10 text-ink h-10 w-full rounded-xl border bg-white px-3 text-sm" />
          </label>
          <button type="submit" className="bg-linear-to-b from-ink-2 to-ink inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-white">
            {t("goalSave")}
          </button>
          <p className="text-steel w-full text-xs">{t("goalNote")}</p>
        </form>
      ) : null}

      {variant === "full" ? (
        <div className="mt-5">
          <p className="eyebrow mb-2">{t("week")}</p>
          <div className="flex h-20 items-end gap-1.5">
            {week.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
                <div className="bg-bone-2 flex h-14 w-full items-end overflow-hidden rounded-md">
                  <div className="water-fill w-full" style={{ height: `${Math.min(100, Math.round((d.ml / s.goal) * 100))}%` }} aria-hidden />
                </div>
                <span className="text-steel text-[10px] font-semibold">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <p className="text-steel mt-3 text-xs">{t("disclaimer")}</p>
    </section>
  );
}
