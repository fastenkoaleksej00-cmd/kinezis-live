"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertTriangle, Bookmark, MessageCircle, Play, X } from "lucide-react";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { concernIds, painKinds, painRedFlags, regionKey, type ConcernId, type PainKind, type RegionId } from "@/lib/body/regions";
import { recommend } from "@/lib/body/recommend";
import type { WorkoutCardData } from "@/lib/content/types";
import { useFavorites } from "@/lib/store/favorites";
import { cn } from "@/lib/utils";

interface RegionSheetProps {
  region: RegionId | null;
  concern: ConcernId | null;
  pain: PainKind | null;
  catalogue: WorkoutCardData[];
  signedIn: boolean;
  onConcern: (c: ConcernId | null) => void;
  onPain: (p: PainKind | null) => void;
  onClose: () => void;
}

/** Card for the selected area: what is bothering you, real sessions that fit, save, ask the trainer. */
export function RegionSheet({ region, concern, pain, catalogue, signedIn, onConcern, onPain, onClose }: RegionSheetProps) {
  const t = useTranslations("body");
  const tl = useTranslations("library");
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const { has, toggle } = useFavorites();

  const rec = region ? recommend(region, concern, catalogue) : null;
  const redFlag = pain !== null && painRedFlags.includes(pain);
  const showWorkouts = rec && !redFlag && concern !== "trainer";
  const firstVideo = rec?.workouts.find((w) => w.hasVideo);
  const saved = region ? has(regionKey(region)) : false;

  return (
    <AnimatePresence>
      {region ? (
        <motion.aside
          key={region}
          initial={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="card relative space-y-4 p-5"
          aria-label={t(`regions.${region}`)}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow mb-1">{t("selected")}</p>
              <h2 className="text-ink text-xl font-bold">{t(`regions.${region}`)}</h2>
              <p className="text-steel mt-1.5 text-sm">{t(`info.${region}`)}</p>
            </div>
            <button type="button" onClick={onClose} aria-label={tc("back")} className="text-steel hover:bg-frost hover:text-ink inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div>
            <p className="text-ink mb-2 text-sm font-semibold">{t("whatBothers")}</p>
            <div className="flex flex-wrap gap-2">
              {concernIds.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={concern === c}
                  onClick={() => {
                    onConcern(concern === c ? null : c);
                    if (c !== "pain") onPain(null);
                  }}
                  className={cn("inline-flex h-9 items-center rounded-full px-3.5 text-sm font-semibold transition-colors", concern === c ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70 hover:bg-white")}
                >
                  {t(`concerns.${c}`)}
                </button>
              ))}
            </div>
          </div>

          {concern === "pain" ? (
            <div className="bg-frost/70 space-y-3 rounded-2xl p-4">
              <p className="text-ink text-sm font-semibold">{t("pain.question")}</p>
              <div className="flex flex-wrap gap-2">
                {painKinds.map((p) => (
                  <button key={p} type="button" aria-pressed={pain === p} onClick={() => onPain(pain === p ? null : p)} className={cn("inline-flex h-9 items-center rounded-full px-3.5 text-sm font-semibold transition-colors", pain === p ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}>
                    {t(`pain.kinds.${p}`)}
                  </button>
                ))}
              </div>
              {redFlag ? (
                <div className="flex items-start gap-3 rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] p-3 text-sm text-[#8a2f2f]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <p>{t("pain.redFlag")}</p>
                </div>
              ) : pain ? (
                <p className="text-steel text-sm">{t("pain.mildNote")}</p>
              ) : null}
            </div>
          ) : null}

          {showWorkouts ? (
            <div>
              <p className="text-ink mb-2 text-sm font-semibold">{t("sessionsTitle")}</p>
              {rec.workouts.length === 0 ? (
                <p className="text-steel text-sm">{t("noSessions")}</p>
              ) : (
                <ul className="divide-ink/8 border-ink/8 divide-y rounded-2xl border">
                  {rec.workouts.map((w) => (
                    <li key={w.id}>
                      <Link href={`/library/${w.slug}`} className="hover:bg-frost/60 flex items-center gap-3 px-4 py-3 transition-colors">
                        <span className={cn("cover relative h-11 w-11 shrink-0 rounded-xl", w.coverTone === "mint" && "cover-mint", w.coverTone === "light" && "cover-light")}>
                          <span className="absolute inset-0 z-10 flex items-center justify-center text-white">
                            <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden />
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-ink block truncate text-sm font-semibold">{w.title}</span>
                          <span className="text-steel block text-xs">
                            {tl(`categories.${w.category}`)} · {tc("minutes", { count: w.durationMin })} · {tl(`levels.${w.level}`)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {concern === "trainer" || (concern === "pain" && pain && !redFlag) ? <p className="text-steel text-sm">{t("trainerNote")}</p> : null}

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => toggle(regionKey(region))} aria-pressed={saved} className={buttonStyles(saved ? "secondary" : "primary", "md")}>
              <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden />
              {saved ? t("saved") : t("save")}
            </button>
            {firstVideo && showWorkouts ? (
              <Link href={`/library/${firstVideo.slug}/watch`} className={buttonStyles("secondary", "md")}>
                <Play className="h-4 w-4" fill="currentColor" aria-hidden />
                {t("watch")}
              </Link>
            ) : null}
            <Link href={signedIn ? `/messages?topic=${region}` : "/auth/sign-in"} className={buttonStyles("secondary", "md")}>
              <MessageCircle className="h-4 w-4" aria-hidden />
              {t("askTrainer")}
            </Link>
          </div>
          <p className="text-steel text-xs">{t("disclaimer")}</p>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
