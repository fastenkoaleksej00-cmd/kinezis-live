"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { useA11y } from "@/components/settings/AccessibilityProvider";
import { regionIds, type ConcernId, type PainKind, type RegionId } from "@/lib/body/regions";
import type { WorkoutCardData } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { BodyScene, type SceneStatus } from "./BodyScene";
import { BodySilhouette } from "./BodySilhouette";
import { RegionSheet } from "./RegionSheet";

interface BodyMapProps {
  modelUrl: string;
  catalogue: WorkoutCardData[];
  signedIn: boolean;
  initialRegion: RegionId | null;
}

/** Orchestrates the 3D scene (or the 2D fallback), the front/back toggle, the region list and the detail card. */
export function BodyMap({ modelUrl, catalogue, signedIn, initialRegion }: BodyMapProps) {
  const t = useTranslations("body");
  const a11y = useA11y();
  const [status, setStatus] = useState<SceneStatus>("loading");
  const [view, setView] = useState<"front" | "back">("front");
  const [selected, setSelected] = useState<RegionId | null>(initialRegion);
  const [concern, setConcern] = useState<ConcernId | null>(null);
  const [pain, setPain] = useState<PainKind | null>(null);
  const [dark, setDark] = useState(false);
  const markerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.documentElement;
    const update = () => setDark(el.dataset.theme === "dark");
    update();
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  const select = (id: RegionId | null) => {
    setSelected(id);
    setConcern(null);
    setPain(null);
    if (id) window.setTimeout(() => sheetRef.current?.scrollIntoView({ behavior: a11y.reduceMotion ? "auto" : "smooth", block: "nearest" }), 50);
  };

  const labels = Object.fromEntries(regionIds.map((id) => [id, t(`regions.${id}`)])) as Record<RegionId, string>;

  return (
    <div className="space-y-4">
      <div className="card relative overflow-hidden">
        <div className="relative h-[62dvh] min-h-[420px] w-full">
          {status !== "error" ? <BodyScene modelUrl={modelUrl} selected={selected} view={view} reduceMotion={a11y.reduceMotion} dark={dark} onSelect={select} onStatus={setStatus} markerRef={markerRef} /> : null}
          {status === "error" ? (
            <div className="absolute inset-0 p-4">
              <BodySilhouette selected={selected} view={view} onSelect={select} labels={labels} />
            </div>
          ) : null}
          {status === "loading" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Loader2 className="text-accent h-7 w-7 animate-spin" aria-hidden />
              <p className="text-steel text-sm">{t("loading")}</p>
            </div>
          ) : null}
          <div ref={markerRef} className="pointer-events-none absolute top-0 left-0 opacity-0 transition-opacity duration-300" aria-hidden>
            <span className="relative block h-5 w-5">
              <span className="bg-accent absolute inset-0 rounded-full opacity-30" />
              <span className="bg-accent absolute inset-1 rounded-full border-2 border-white" />
            </span>
          </div>
          <div className="absolute top-3 left-3 flex gap-1 rounded-full border border-white/70 bg-white/70 p-1 backdrop-blur-md">
            {(["front", "back"] as const).map((v) => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={cn("inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition-colors", view === v ? "bg-linear-to-b from-ink-2 to-ink text-white" : "text-ink")}>
                {t(`views.${v}`)}
              </button>
            ))}
          </div>
          {selected ? (
            <button type="button" onClick={() => select(null)} className="text-ink absolute top-3 right-3 inline-flex h-9 items-center gap-1.5 rounded-full border border-white/70 bg-white/70 px-3 text-xs font-semibold backdrop-blur-md" aria-label={t("reset")}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              {t("reset")}
            </button>
          ) : null}
        </div>
        <p className="text-steel border-ink/8 border-t px-4 py-2.5 text-xs">{status === "error" ? t("fallbackNote") : t("hint")}</p>
      </div>

      <div className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label={t("regionsList")}>
        {regionIds.map((id) => (
          <button key={id} type="button" aria-pressed={selected === id} onClick={() => select(selected === id ? null : id)} className={cn("inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-[background-color,color,transform] duration-300 active:scale-95", selected === id ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70 hover:bg-white")}>
            {labels[id]}
          </button>
        ))}
      </div>

      <div ref={sheetRef}>
        <RegionSheet region={selected} concern={concern} pain={pain} catalogue={catalogue} signedIn={signedIn} onConcern={setConcern} onPain={setPain} onClose={() => select(null)} />
      </div>
    </div>
  );
}
