"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Illustration, type IllustrationKind } from "@/components/ui/Illustration";
import { Logo } from "@/components/ui/Logo";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { locales, type Locale } from "@/i18n/config";
import { setLocale } from "@/lib/locale";
import type { PlayableVideo } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { markOnboarded } from "./OnboardingGate";
import { ThemePicker } from "./ThemePicker";

interface OnboardingProps {
  /** Optional intro video from the trainer; when absent the first slide shows an illustration */
  intro: PlayableVideo | null;
}

const slides: Array<{ key: "welcome" | "theme" | "library" | "body" | "care"; illustration: IllustrationKind }> = [
  { key: "welcome", illustration: "sessions" },
  { key: "theme", illustration: "saved" },
  { key: "library", illustration: "search" },
  { key: "body", illustration: "measurements" },
  { key: "care", illustration: "community" },
];

/** Four short slides, shown once per device. Language can be switched on the first one. */
export function Onboarding({ intro }: OnboardingProps) {
  const t = useTranslations("onboarding");
  const ts = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [pending, start] = useTransition();
  const last = i === slides.length - 1;

  const finish = () => {
    markOnboarded();
    router.replace("/");
  };

  const slide = slides[i];

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center justify-between px-5 pt-6">
        <Logo />
        <button type="button" onClick={finish} className="text-steel hover:text-ink text-sm font-semibold">
          {t("skip")}
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-center px-5 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.key}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-[520px] text-center"
          >
            {i === 0 && intro ? (
              <div className="mb-6 text-left">
                <VideoPlayer workoutId="intro" source={intro} title={t("slides.welcome.title")} />
              </div>
            ) : slide.key === "theme" ? (
              <div className="mb-6 text-left">
                <ThemePicker />
              </div>
            ) : (
              <Illustration kind={slide.illustration} className="mx-auto mb-6 h-44" />
            )}
            <p className="eyebrow mb-2 justify-center">{t(`slides.${slide.key}.eyebrow`)}</p>
            <h1 className="text-[1.9rem] leading-[1.05] font-extrabold sm:text-[2.4rem]">{t(`slides.${slide.key}.title`)}</h1>
            <p className="text-steel mx-auto mt-3 max-w-md text-[15px] sm:text-base">{t(`slides.${slide.key}.body`)}</p>

            {i === 0 ? (
              <div className="mt-6 flex flex-wrap justify-center gap-2" role="radiogroup" aria-label={ts("language")}>
                {locales.map((code: Locale) => (
                  <button
                    key={code}
                    type="button"
                    role="radio"
                    aria-checked={locale === code}
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        await setLocale(code);
                        router.refresh();
                      })
                    }
                    className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors", locale === code ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}
                  >
                    {locale === code ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : null}
                    {ts(`languages.${code}`)}
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pb-safe px-5 pb-8">
        <div className="mx-auto flex w-full max-w-[520px] items-center justify-between gap-4">
          <div className="flex gap-1.5" aria-hidden>
            {slides.map((s, j) => (
              <span key={s.key} className={cn("h-1.5 rounded-full transition-all duration-300", j === i ? "bg-accent w-6" : "bg-bone-2 w-1.5")} />
            ))}
          </div>
          <Button size="lg" onClick={() => (last ? finish() : setI(i + 1))}>
            {last ? t("start") : t("next")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <p className="text-steel mx-auto mt-4 max-w-[520px] text-center text-xs">{t("note")}</p>
      </div>
    </div>
  );
}
