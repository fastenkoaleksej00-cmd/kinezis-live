"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Smartphone, Watch } from "lucide-react";

type Platform = "web" | "ios" | "android";

/**
 * Honest status of the Apple Health bridge. Detects the shell at runtime: in a browser or PWA
 * HealthKit cannot be reached; in the iOS shell the plugin is not installed yet. No "connect" button
 * exists until a real bridge is wired, so nothing pretends to sync.
 */
export function HealthConnectStatus() {
  const t = useTranslations("connect.status");
  const [platform, setPlatform] = useState<Platform | null>(null);
  useEffect(() => {
    const p = Capacitor.getPlatform();
    setPlatform(p === "ios" || p === "android" ? p : "web");
  }, []);
  const key = platform ?? "web";
  return (
    <div className="card flex items-start gap-4 p-5" aria-live="polite">
      <span className="bg-bone-2 text-steel inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
        {key === "web" ? <Smartphone className="h-5 w-5" strokeWidth={1.8} aria-hidden /> : <Watch className="h-5 w-5" strokeWidth={1.8} aria-hidden />}
      </span>
      <div className="text-sm">
        <p className="text-ink font-semibold">{t(`${key}.title`)}</p>
        <p className="text-steel mt-1">{t(`${key}.body`)}</p>
        <p className="bg-bone-2 text-steel mt-2 inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold">{t("notConnected")}</p>
      </div>
    </div>
  );
}
