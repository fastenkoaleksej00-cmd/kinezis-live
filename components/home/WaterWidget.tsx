"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { AlertTriangle, Droplets, Minus, Plus, Settings2, Undo2 } from "lucide-react";
import { MAX_DAY, MAX_GOAL, addWater, localDay, recentIntake, removeWater, setTodayTotal, setWaterGoal, setWaterPortion, undoWater, waterPortions, waterStore } from "@/lib/store/water";
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
  const [totalDraft, setTotalDraft] = useState("");
  const today = Math.min(MAX_DAY, s.days[localDay()] ?? 0);
  const events = Array.isArray(s.events) ? s.events : [];
  // Cautions: a lot in a short time is the one that matters; far over the goal gets a gentle note only
  const rapid = recentIntake({ ...s, events }, 60) >= 1500 || recentIntake({ ...s, events }, 120) >= 2200;
  const goal = Math.min(MAX_GOAL, s.goal);
  const pct = Math.min(100, Math.round((today / goal) * 100));
  const atMax = today >= MAX_DAY;
  const overGoal = !rapid && !atMax && today >= Math.min(MAX_DAY, Math.max(goal * 1.5, goal + 1000));
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
            setGoalDraft(String(goal));
            setTotalDraft(String(today));
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
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-[22px] border-2 border-[#bfe3ec] bg-[#f1fafc]" role="img" aria-label={t("progressLabel", { ml: today, goal })}>
          <div className="water-fill absolute inset-x-0 bottom-0" style={{ height: `${pct}%` }} />
          <span className="text-ink absolute inset-0 flex items-center justify-center text-sm font-extrabold drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">{pct}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-ink text-2xl font-extrabold tabular-nums">
            {today} <span className="text-steel text-sm font-semibold">/ {goal} ml</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {waterPortions.map((p) => (
              <button key={p} type="button" aria-pressed={s.portion === p} onClick={() => setWaterPortion(p)} className={cn("inline-flex h-8 items-center rounded-full px-2.5 text-xs font-semibold transition-colors", s.portion === p ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}>
                {p}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button type="button" onClick={() => removeWater(s.portion)} disabled={today === 0} aria-label={t("remove", { ml: s.portion })} className="border-ink/10 text-ink inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/70 transition-transform active:scale-95 disabled:opacity-40">
              <Minus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </button>
            <button type="button" onClick={() => addWater(s.portion)} disabled={atMax} className="bg-linear-to-b from-ink-2 to-ink inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition-transform active:scale-95 disabled:opacity-50">
              <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              {t("add", { ml: s.portion })}
            </button>
            <button type="button" onClick={undoWater} disabled={events.length === 0} aria-label={t("undo")} className="border-ink/10 text-ink inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/70 disabled:opacity-40">
              <Undo2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {rapid ? (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-2xl border border-danger-line bg-danger-soft p-3 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{t("rapidWarning")}</p>
        </div>
      ) : atMax ? (
        <p className="bg-frost/70 text-steel mt-4 rounded-2xl p-3 text-sm">{t("maxReached")}</p>
      ) : overGoal ? (
        <p className="bg-frost/70 text-steel mt-4 rounded-2xl p-3 text-sm">{t("overGoalNote")}</p>
      ) : null}

      {editing ? (
        <form
          className="bg-frost/70 mt-4 grid gap-3 rounded-2xl p-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const g = Number(goalDraft);
            if (Number.isFinite(g) && g > 0) setWaterGoal(g);
            const total = Number(totalDraft);
            if (Number.isFinite(total) && total >= 0) setTodayTotal(total);
            setEditing(false);
          }}
        >
          <label className="block">
            <span className="text-steel mb-1 block text-xs font-semibold">{t("goalLabel")}</span>
            <input type="number" inputMode="numeric" min={200} max={MAX_GOAL} step={50} value={goalDraft} onChange={(e) => setGoalDraft(e.target.value)} className="border-ink/10 text-ink h-10 w-full rounded-xl border bg-white px-3 text-sm" />
          </label>
          <label className="block">
            <span className="text-steel mb-1 block text-xs font-semibold">{t("totalLabel")}</span>
            <input type="number" inputMode="numeric" min={0} max={MAX_DAY} step={10} value={totalDraft} onChange={(e) => setTotalDraft(e.target.value)} className="border-ink/10 text-ink h-10 w-full rounded-xl border bg-white px-3 text-sm" />
          </label>
          <button type="submit" className="bg-linear-to-b from-ink-2 to-ink inline-flex h-10 items-center justify-self-start rounded-full px-4 text-sm font-semibold text-white">
            {t("goalSave")}
          </button>
          <p className="text-steel text-xs sm:col-span-2">{t("goalNote")}</p>
        </form>
      ) : null}

      {variant === "full" ? (
        <div className="mt-5">
          <p className="eyebrow mb-2">{t("week")}</p>
          <div className="flex h-20 items-end gap-1.5">
            {week.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
                <div className="bg-bone-2 flex h-14 w-full items-end overflow-hidden rounded-md">
                  <div className="water-fill w-full" style={{ height: `${Math.min(100, Math.round((Math.min(MAX_DAY, d.ml) / goal) * 100))}%` }} aria-hidden />
                </div>
                <span className="text-steel text-[0.6875rem] font-semibold">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <p className="text-steel mt-3 text-xs">{t("disclaimer")}</p>
    </section>
  );
}
