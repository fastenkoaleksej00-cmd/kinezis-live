"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { Check, PartyPopper } from "lucide-react";
import { logWorkoutSession } from "@/lib/profile/actions";
import { progressStore } from "@/lib/store/progress";

/**
 * Appears under the player when the video is watched to the end during this visit and asks to count the
 * session. Nothing is logged automatically, so seeking to the end by accident does not count.
 */
export function CompletePrompt({ workoutId, title, minutes, signedIn }: { workoutId: string; title: string; minutes: number; signedIn: boolean }) {
  const t = useTranslations("player.complete");
  const router = useRouter();
  const all = progressStore.useStore();
  const openedAt = useRef(new Date().toISOString());
  const [state, setState] = useState<"ask" | "done" | "error">("ask");
  const [pending, start] = useTransition();
  const entry = all[workoutId];
  if (!entry?.completed || entry.updatedAt < openedAt.current) return null;

  return (
    <div className="pop-in mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-md" role="status">
      <PartyPopper className="text-mint h-5 w-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">{state === "done" ? t("doneTitle") : t("title")}</p>
        <p className="text-mist text-xs">{state === "done" ? t("doneBody") : signedIn ? t("body") : t("guest")}</p>
      </div>
      {state === "done" ? (
        <Link href="/profile/activity" className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-[#10242b]">
          {t("activity")}
        </Link>
      ) : signedIn ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const ok = await logWorkoutSession(workoutId, title, minutes);
              setState(ok ? "done" : "error");
              if (ok) router.refresh();
            })
          }
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-[#10242b] disabled:opacity-60"
        >
          <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          {t("count")}
        </button>
      ) : (
        <Link href="/auth/sign-in" className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-[#10242b]">
          {t("signIn")}
        </Link>
      )}
      {state === "error" ? <p className="w-full text-xs text-[#ffd1d1]">{t("error")}</p> : null}
    </div>
  );
}
