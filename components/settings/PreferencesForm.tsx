"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { updatePreferences, type ProfileState } from "@/lib/profile/actions";
import { notificationTypes, reminderKinds, type UserProfile } from "@/lib/profile/types";

const initial: ProfileState = {};

function Toggle({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="text-ink block text-sm font-semibold">{label}</span>
        {hint ? <span className="text-steel block text-xs">{hint}</span> : null}
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-5 w-5 shrink-0 rounded" />
    </label>
  );
}

/** Notifications, in-app reminders and privacy. Saved to the account; push delivery is a later stage. */
export function PreferencesForm({ profile }: { profile: UserProfile }) {
  const t = useTranslations("settings");
  const [state, action, pending] = useActionState(updatePreferences, initial);
  const [permission, setPermission] = useState<"unknown" | "granted" | "denied" | "default" | "unsupported">("unknown");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  return (
    <form action={action} className="space-y-6" aria-busy={pending}>
      <section id="notifications" className="card p-5">
        <h2 className="text-ink text-base font-bold">{t("notifications.title")}</h2>
        <p className="text-steel mt-1 text-sm">{t("notifications.lead")}</p>
        <div className="divide-ink/8 mt-3 divide-y">
          {notificationTypes.map((n) => (
            <Toggle key={n} name={`notify_${n}`} label={t(`notifications.types.${n}`)} defaultChecked={profile.notificationPrefs[n] ?? true} />
          ))}
        </div>
        <p className="bg-frost/70 text-steel mt-3 rounded-2xl px-4 py-3 text-xs">
          {permission === "granted" ? t("notifications.permissionGranted") : permission === "denied" ? t("notifications.permissionDenied") : permission === "unsupported" ? t("notifications.permissionUnsupported") : t("notifications.permissionDefault")}
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-ink text-base font-bold">{t("reminders.title")}</h2>
        <p className="text-steel mt-1 text-sm">{t("reminders.lead")}</p>
        <div className="divide-ink/8 mt-3 divide-y">
          {reminderKinds.map((kind) => {
            const existing = profile.reminders.find((r) => r.kind === kind);
            return (
              <div key={kind} className="flex items-center justify-between gap-4 py-3">
                <label className="flex min-w-0 flex-1 items-center gap-3">
                  <input type="checkbox" name={`reminder_${kind}`} defaultChecked={existing?.enabled ?? false} className="h-5 w-5 shrink-0 rounded" />
                  <span className="text-ink text-sm font-semibold">{t(`reminders.kinds.${kind}`)}</span>
                </label>
                <input type="time" name={`reminder_${kind}_time`} defaultValue={existing?.time ?? "09:00"} className="border-ink/10 text-ink h-10 rounded-xl border bg-white/80 px-3 text-sm outline-none" aria-label={t("reminders.time")} />
              </div>
            );
          })}
        </div>
      </section>

      <section id="privacy" className="card p-5">
        <h2 className="text-ink text-base font-bold">{t("privacy.title")}</h2>
        <p className="text-steel mt-1 text-sm">{t("privacy.lead")}</p>
        <div className="divide-ink/8 mt-3 divide-y">
          <Toggle name="privacy_profileVisible" label={t("privacy.profileVisible")} hint={t("privacy.profileVisibleHint")} defaultChecked={profile.privacy.profileVisible} />
          <Toggle name="privacy_showActivity" label={t("privacy.showActivity")} hint={t("privacy.showActivityHint")} defaultChecked={profile.privacy.showActivity} />
          <Toggle name="privacy_allowComments" label={t("privacy.allowComments")} hint={t("privacy.allowCommentsHint")} defaultChecked={profile.privacy.allowComments} />
        </div>
        <p className="text-steel mt-3 text-xs">{t("privacy.healthNote")}</p>
      </section>

      {state.ok ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("savedNotice")}</p> : null}
      {state.error ? <p role="alert" className="rounded-2xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">{t(`account.errors.${state.error}`)}</p> : null}
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {t("save")}
      </Button>
    </form>
  );
}
