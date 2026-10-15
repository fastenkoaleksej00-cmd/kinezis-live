import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Bed, Bell, Droplets, Dumbbell, Leaf, Wind } from "lucide-react";
import type { Reminder, ReminderKind } from "@/lib/profile/types";

const icons: Record<ReminderKind, typeof Bell> = { workout: Dumbbell, water: Droplets, rest: Wind, sleep: Bed, stretch: Leaf };

/** Compact "today" reminder chips chosen by the user in Settings. Shown in-app only; push delivery comes later. */
export async function RemindersCard({ reminders }: { reminders: Reminder[] }) {
  const enabled = reminders.filter((r) => r.enabled).sort((a, b) => a.time.localeCompare(b.time));
  if (enabled.length === 0) return null;
  const t = await getTranslations("settings.reminders");
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{t("todayTitle")}</p>
        <Link href="/profile/settings#notifications" className="text-accent text-xs font-semibold hover:underline">
          {t("edit")}
        </Link>
      </div>
      <ul className="scroll-row -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
        {enabled.map((r) => {
          const Icon = icons[r.kind];
          return (
            <li key={r.kind} className="bg-frost/70 inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm">
              <Icon className="text-accent h-4 w-4" strokeWidth={2} aria-hidden />
              <span className="text-ink font-semibold">{t(`kinds.${r.kind}`)}</span>
              <span className="text-steel tabular-nums">{r.time}</span>
            </li>
          );
        })}
      </ul>
      <p className="text-steel mt-2 text-xs">{t("inAppOnly")}</p>
    </section>
  );
}
