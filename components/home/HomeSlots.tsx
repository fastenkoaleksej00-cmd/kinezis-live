"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { WaterWidget } from "@/components/home/WaterWidget";
import { CheckInCard } from "@/components/mind/Journal";
import { checkinScales, checkinsStore } from "@/lib/store/checkins";
import { homePrefsStore } from "@/lib/store/home";
import { localDay } from "@/lib/store/water";

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/** Water on Home only when the member switched it on (Quick access → Customise). */
export function HomeWaterSlot() {
  const prefs = homePrefsStore.useStore();
  const mounted = useMounted();
  if (!mounted || !prefs.water) return null;
  return <WaterWidget />;
}

/** "How are you today?" at the end of Home: hidden once filled today or snoozed for today. */
export function HomeCheckInSlot() {
  const t = useTranslations("mind.journal");
  const prefs = homePrefsStore.useStore();
  const checkins = checkinsStore.useStore();
  const mounted = useMounted();
  if (!mounted || !prefs.checkin) return null;
  const today = localDay();
  const c = checkins.days[today];
  const done = c ? checkinScales.every((k) => typeof c[k] === "number") : false;
  if (done || prefs.checkinSnoozed === today) return null;
  return (
    <div className="space-y-1">
      <CheckInCard />
      <div className="text-right">
        <button type="button" onClick={() => homePrefsStore.write({ ...prefs, checkinSnoozed: today })} className="text-steel hover:text-ink text-xs font-semibold">
          {t("notToday")}
        </button>
      </div>
    </div>
  );
}
