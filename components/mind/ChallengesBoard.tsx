"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ArrowRight, Flag, PartyPopper, X } from "lucide-react";
import { ActivityRing } from "@/components/health/ActivityRing";
import { Button } from "@/components/ui/Button";
import { challenges, type Challenge, type ChallengeId } from "@/lib/mind/content";
import { createLocalStore } from "@/lib/store/localStore";
import { hasHabit, habitsStore, type HabitsState } from "@/lib/store/habits";
import { localDay, waterStore, type WaterState } from "@/lib/store/water";
import { cn } from "@/lib/utils";

/** Joined challenges: id → local start day. Gentle: missed days are simply not counted, nothing resets. */
const joinedStore = createLocalStore<Partial<Record<ChallengeId, string>>>("kl_challenges", {});

function windowDays(start: string, length: number): string[] {
  const [y, m, d] = start.split("-").map(Number);
  return Array.from({ length }, (_, i) => localDay(new Date(y, m - 1, d + i)));
}

function doneOn(c: Challenge, day: string, habits: HabitsState, water: WaterState): boolean {
  if (c.habit === "water") return (water.days[day] ?? 0) >= water.goal;
  return hasHabit(habits, c.habit, day);
}

export function ChallengesBoard() {
  const t = useTranslations("mind.challenges");
  const joined = joinedStore.useStore();
  const habits = habitsStore.useStore();
  const water = waterStore.useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="skeleton h-48 rounded-3xl" aria-hidden />;
  const today = localDay();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {challenges.map((c) => {
        const start = joined[c.id];
        const days = start ? windowDays(start, c.window) : [];
        const count = days.filter((d) => d <= today && doneOn(c, d, habits, water)).length;
        const finished = start ? days[days.length - 1] < today : false;
        const completed = count >= c.target;
        return (
          <article key={c.id} className="card flex flex-col gap-4 p-4">
            <div className="flex items-start gap-4">
              <ActivityRing
                value={start ? count / c.target : 0}
                size={72}
                stroke={8}
                label={t(`items.${c.id}.title`)}
                center={<span className="text-ink text-sm font-extrabold tabular-nums">{start ? `${count}/${c.target}` : <Flag className="text-steel h-5 w-5" aria-hidden />}</span>}
              />
              <div className="min-w-0 flex-1">
                <p className="text-ink font-bold">{t(`items.${c.id}.title`)}</p>
                <p className="text-steel text-sm">{t(`items.${c.id}.body`, { target: c.target, window: c.window })}</p>
              </div>
            </div>
            {start ? (
              <>
                <div className="flex gap-1.5" aria-label={t("daysLabel")}>
                  {days.map((d) => (
                    <span key={d} title={d} className={cn("h-2.5 flex-1 rounded-full", d > today ? "bg-bone-2/60" : doneOn(c, d, habits, water) ? "bg-mint-deep" : "bg-bone-2")} />
                  ))}
                </div>
                {completed ? (
                  <p className="pop-in bg-mint-soft text-mint-deep inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold">
                    <PartyPopper className="h-4 w-4" aria-hidden />
                    {t("completed")}
                  </p>
                ) : finished ? (
                  <p className="text-steel text-sm">{t("ended", { count })}</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  {!completed && !finished ? (
                    <Link href={c.href} className="text-accent inline-flex items-center gap-1 text-sm font-semibold hover:underline">
                      {t("doToday")}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  ) : null}
                  {completed || finished ? (
                    <Button size="sm" variant="secondary" onClick={() => joinedStore.write({ ...joined, [c.id]: today })}>
                      {t("again")}
                    </Button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...joined };
                      delete next[c.id];
                      joinedStore.write(next);
                    }}
                    className="text-steel hover:text-ink ml-auto inline-flex items-center gap-1 text-xs font-semibold"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                    {t("leave")}
                  </button>
                </div>
              </>
            ) : (
              <Button size="md" onClick={() => joinedStore.write({ ...joined, [c.id]: today })}>
                {t("join")}
              </Button>
            )}
          </article>
        );
      })}
    </div>
  );
}
