"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ArrowRight, Check, NotebookPen } from "lucide-react";
import { checkinScales, checkinsStore, saveCheckin, type CheckinScale } from "@/lib/store/checkins";
import { localDay } from "@/lib/store/water";
import { cn } from "@/lib/utils";

const faces = ["😣", "🙁", "😐", "🙂", "😄"];
/** For tension a high number is worse, so its colour scale is reversed */
const tone = (scale: CheckinScale, v: number) => {
  const good = scale === "tension" ? 6 - v : v;
  return good >= 4 ? "bg-mint-soft text-mint-deep" : good === 3 ? "bg-accent-soft text-accent" : "bg-[#fdf0e1] text-[#c27a2c]";
};

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/** Four one-tap scales; every tap saves immediately. */
export function CheckInForm({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("mind.journal");
  const s = checkinsStore.useStore();
  const mounted = useMounted();
  const today = mounted ? s.days[localDay()] : undefined;

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {checkinScales.map((scale) => (
        <fieldset key={scale}>
          <legend className="text-steel mb-1.5 text-xs font-semibold">{t(`scales.${scale}`)}</legend>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((v) => {
              const on = today?.[scale] === v;
              return (
                <button
                  key={v}
                  type="button"
                  aria-pressed={on}
                  aria-label={`${t(`scales.${scale}`)}: ${t(`levels.${scale}.${v}` as "levels.mood.1")}`}
                  onClick={() => saveCheckin({ [scale]: v })}
                  className={cn("flex h-11 items-center justify-center rounded-2xl text-lg transition-[transform,background-color] duration-200 active:scale-95", on ? cn(tone(scale, v), "ring-2 ring-current") : "border-ink/10 border bg-white/70")}
                >
                  <span aria-hidden>{scale === "tension" ? faces[5 - v] : faces[v - 1]}</span>
                </button>
              );
            })}
          </div>
          {today?.[scale] ? <p className="text-steel mt-1 text-[11px]">{t(`levels.${scale}.${today[scale]}` as "levels.mood.1")}</p> : null}
        </fieldset>
      ))}
    </div>
  );
}

/** Home card: asks once a day, then shows a short thank-you with today's marks. */
export function CheckInCard() {
  const t = useTranslations("mind.journal");
  const s = checkinsStore.useStore();
  const mounted = useMounted();
  const today = mounted ? s.days[localDay()] : undefined;
  const filled = today ? checkinScales.filter((k) => typeof today[k] === "number").length : 0;
  const [open, setOpen] = useState(false);

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow mb-1 inline-flex items-center gap-2">
            <NotebookPen className="h-3.5 w-3.5" aria-hidden />
            {t("eyebrow")}
          </p>
          <h2 className="text-ink text-lg font-bold">{filled === 4 ? t("doneTitle") : t("cardTitle")}</h2>
          {filled === 4 ? <p className="text-steel mt-1 text-sm">{t("doneBody")}</p> : null}
        </div>
        {filled === 4 ? (
          <span className="bg-mint-soft text-mint-deep inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </span>
        ) : null}
      </div>
      {filled < 4 || open ? (
        <div className="mt-3">
          <CheckInForm compact />
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="text-accent mt-2 text-sm font-semibold hover:underline">
          {t("edit")}
        </button>
      )}
      <Link href="/mind/journal" className="text-accent mt-3 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        {t("history")}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}

/** Last 14 days as rows of small coloured cells, plus gratitude notes. */
export function JournalHistory() {
  const t = useTranslations("mind.journal");
  const s = checkinsStore.useStore();
  const mounted = useMounted();
  if (!mounted) return <div className="skeleton h-40 rounded-3xl" aria-hidden />;
  const now = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (13 - i));
    return { key: localDay(d), label: d.toLocaleDateString(undefined, { day: "numeric" }), weekday: d.toLocaleDateString(undefined, { weekday: "narrow" }) };
  });
  const notes = Object.entries(s.days)
    .filter(([, c]) => c.gratitude)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 7);
  const any = days.some((d) => s.days[d.key]);

  return (
    <div className="space-y-4">
      <div className="card overflow-x-auto p-4">
        {!any ? <p className="text-steel text-sm">{t("empty")}</p> : null}
        <table className="w-full min-w-[420px] border-separate border-spacing-1 text-center">
          <thead>
            <tr>
              <th className="w-20" />
              {days.map((d) => (
                <th key={d.key} className="text-steel text-[10px] font-semibold">
                  <span className="block">{d.weekday}</span>
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {checkinScales.map((scale) => (
              <tr key={scale}>
                <th className="text-steel pr-1 text-left text-[11px] font-semibold">{t(`scales.${scale}`)}</th>
                {days.map((d) => {
                  const v = s.days[d.key]?.[scale];
                  return (
                    <td key={d.key} className={cn("h-7 rounded-md text-[11px] font-bold", v ? tone(scale, v) : "bg-bone-2/60")} title={v ? t(`levels.${scale}.${v}` as "levels.mood.1") : undefined}>
                      {v ?? ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {notes.length > 0 ? (
        <div className="card space-y-2 p-4">
          <p className="eyebrow">{t("gratitudeTitle")}</p>
          <ul className="space-y-2">
            {notes.map(([day, c]) => (
              <li key={day} className="text-sm">
                <span className="text-steel mr-2 text-xs">{day.slice(5).split("-").reverse().join(".")}</span>
                <span className="text-text">{c.gratitude}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
