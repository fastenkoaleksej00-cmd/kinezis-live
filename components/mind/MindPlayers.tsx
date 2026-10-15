"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Check, Moon, Wind } from "lucide-react";
import { BreathSession } from "@/components/breath/BreathSession";
import { Button } from "@/components/ui/Button";
import { regionIds, type RegionId } from "@/lib/body/regions";
import { practiceById } from "@/lib/breath/practices";
import type { Locale } from "@/i18n/config";
import { pick } from "@/lib/content/localize";
import { eveningStretch, meditationById, scaleSteps, screenBreak } from "@/lib/mind/content";
import { localDay } from "@/lib/store/water";
import { checkinsStore, saveCheckin } from "@/lib/store/checkins";
import { markHabit } from "@/lib/store/habits";
import { cn } from "@/lib/utils";
import { StepTimer } from "./StepTimer";
import { useFinishPractice } from "./useFinishPractice";

function useBodyLabels(): Record<RegionId, string> {
  const t = useTranslations("body.regions");
  return Object.fromEntries(regionIds.map((id) => [id, t(id)])) as Record<RegionId, string>;
}

function Logged({ show, signedIn }: { show: boolean; signedIn: boolean }) {
  const t = useTranslations("mind.timer");
  if (!show) return null;
  return <p className="pop-in bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-center text-sm font-semibold">{signedIn ? t("logged") : t("loggedGuest")}</p>;
}

/** Meditation with duration choice; the body scan lights up each area on the silhouette. */
export function MeditationPlayer({ id, signedIn }: { id: string; signedIn: boolean }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("mind");
  const m = meditationById[id];
  const [minutes, setMinutes] = useState(m.durations[0]);
  const [done, setDone] = useState(false);
  const steps = useMemo(() => scaleSteps(m.steps, minutes * 60), [m.steps, minutes]);
  const labels = useBodyLabels();
  const { finish } = useFinishPractice("meditation", m.id, pick(m.title, locale), signedIn);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-2">
        {m.durations.map((d) => (
          <button key={d} type="button" aria-pressed={minutes === d} onClick={() => setMinutes(d)} className={cn("inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold transition-colors", minutes === d ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}>
            {t("minutes", { count: d })}
          </button>
        ))}
      </div>
      <StepTimer
        key={minutes}
        steps={steps}
        locale={locale}
        bodyLabels={m.id === "body-scan" ? labels : undefined}
        onFinished={(sec) => {
          setDone(true);
          finish(sec);
        }}
      />
      <Logged show={done} signedIn={signedIn} />
    </div>
  );
}

export function BreakPlayer({ signedIn }: { signedIn: boolean }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("mind");
  const [done, setDone] = useState(false);
  const labels = useBodyLabels();
  const { finish } = useFinishPractice("screenBreak", "screen-break", t("break.title"), signedIn);
  return (
    <div className="space-y-4">
      <StepTimer
        steps={screenBreak}
        locale={locale}
        bodyLabels={labels}
        onFinished={(sec) => {
          setDone(true);
          finish(sec);
        }}
      />
      <Logged show={done} signedIn={signedIn} />
    </div>
  );
}

/** Three steps: breathing for sleep, floor stretches, one line of gratitude (saved to today's check-in). */
export function EveningRitual({ signedIn }: { signedIn: boolean }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("mind.evening");
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  const [note, setNote] = useState(() => {
    try {
      return checkinsStore.read().days[localDay()]?.gratitude ?? "";
    } catch {
      return "";
    }
  });
  const { finish } = useFinishPractice("evening", "evening-ritual", t("title"), signedIn);
  const stages = [t("stages.breath"), t("stages.stretch"), t("stages.gratitude")];

  return (
    <div className="space-y-5">
      <ol className="flex items-center justify-center gap-2" aria-label={t("progress")}>
        {stages.map((label, i) => (
          <li key={label} className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold", i < stage ? "bg-mint-soft text-mint-deep" : i === stage ? "bg-linear-to-b from-ink-2 to-ink text-white" : "bg-bone-2 text-steel")}>
            {i < stage ? <Check className="h-3.5 w-3.5" aria-hidden /> : <span>{i + 1}</span>}
            <span className="hidden sm:inline">{label}</span>
          </li>
        ))}
      </ol>

      {stage === 0 ? (
        <div className="space-y-3">
          <p className="text-steel text-center text-sm">{t("breathIntro")}</p>
          <BreathSession practice={practiceById.sleep} minutes={3} signedIn={signedIn} onFinished={() => setStage(1)} />
          <div className="text-center">
            <button type="button" onClick={() => setStage(1)} className="text-accent text-sm font-semibold hover:underline">
              {t("skip")}
            </button>
          </div>
        </div>
      ) : null}

      {stage === 1 ? (
        <div className="space-y-3">
          <p className="text-steel text-center text-sm">{t("stretchIntro")}</p>
          <StepTimer steps={eveningStretch} locale={locale} compact onFinished={() => setStage(2)} />
          <div className="text-center">
            <button type="button" onClick={() => setStage(2)} className="text-accent text-sm font-semibold hover:underline">
              {t("skip")}
            </button>
          </div>
        </div>
      ) : null}

      {stage === 2 ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const clean = note.trim().slice(0, 500);
            if (clean) saveCheckin({ gratitude: clean });
            markHabit("evening");
            finish(420);
            setStage(3);
          }}
        >
          <label className="block">
            <span className="text-ink mb-2 block text-center font-semibold">{t("gratitudeQuestion")}</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} placeholder={t("gratitudePlaceholder")} className="border-ink/10 text-ink w-full rounded-2xl border bg-white/80 p-4 text-[15px]" />
          </label>
          <p className="text-steel text-center text-xs">{t("gratitudeNote")}</p>
          <div className="text-center">
            <Button type="submit" size="lg">
              <Moon className="h-4 w-4" aria-hidden />
              {t("finish")}
            </Button>
          </div>
        </form>
      ) : null}

      {stage === 3 ? (
        <div className="pop-in space-y-3 text-center">
          <p className="text-ink text-lg font-bold">{t("goodNight")}</p>
          <p className="text-steel text-sm">{signedIn ? t("savedSigned") : t("savedGuest")}</p>
          <Link href="/mind/sounds" className="text-accent inline-flex items-center gap-1.5 text-sm font-semibold hover:underline">
            <Wind className="h-4 w-4" aria-hidden />
            {t("toSounds")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
