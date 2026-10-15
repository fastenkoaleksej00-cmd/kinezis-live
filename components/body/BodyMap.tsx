"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ChevronDown, Hand, Loader2, Minus, Plus, RotateCcw, RotateCw, Undo2 } from "lucide-react";
import { useA11y } from "@/components/settings/AccessibilityProvider";
import { regionIds, type ConcernId, type PainKind, type RegionId } from "@/lib/body/regions";
import type { WorkoutCardData } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { BodyScene, type BodySceneApi, type SceneStatus } from "./BodyScene";
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
  const [restored, setRestored] = useState(false);

  // Remember the last area and view for this session so switching tabs does not reset the map
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("kl_body_state");
      if (raw && !initialRegion) {
        const saved = JSON.parse(raw) as { selected?: RegionId | null; view?: "front" | "back" };
        if (saved.view === "front" || saved.view === "back") setView(saved.view);
        if (saved.selected && (regionIds as readonly string[]).includes(saved.selected)) setSelected(saved.selected);
      }
    } catch {
      // ignore
    }
    setRestored(true);
  }, [initialRegion]);

  useEffect(() => {
    if (!restored) return;
    try {
      window.sessionStorage.setItem("kl_body_state", JSON.stringify({ selected, view }));
    } catch {
      // ignore
    }
  }, [selected, view, restored]);
  const [concern, setConcern] = useState<ConcernId | null>(null);
  const [pain, setPain] = useState<PainKind | null>(null);
  const [dark, setDark] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [api, setApi] = useState<BodySceneApi | null>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    const update = () => setDark(el.dataset.theme === "dark");
    update();
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  // No auto-scroll on select: the card appears under the scene without moving the page
  const select = (id: RegionId | null) => {
    setSelected(id);
    setConcern(null);
    setPain(null);
  };

  const labels = Object.fromEntries(regionIds.map((id) => [id, t(`regions.${id}`)])) as Record<RegionId, string>;

  return (
    <div className="space-y-4">
      <div className="card relative overflow-hidden">
        <div className="relative h-[62dvh] min-h-[420px] w-full">
          {status !== "error" ? <BodyScene modelUrl={modelUrl} selected={selected} view={view} reduceMotion={a11y.reduceMotion} dark={dark} onSelect={select} onStatus={setStatus} labels={labels} onApi={setApi} /> : null}
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
        {status === "ready" && api ? (
          <div className="border-ink/8 flex items-center justify-between gap-2 border-t px-3 py-2">
            <div className="flex gap-1">
              <button type="button" onClick={() => api.rotateBy(-45)} aria-label={t("controls.rotateLeft")} className="border-ink/10 text-ink hover:bg-white inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/70 active:scale-95">
                <Undo2 className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
              <button type="button" onClick={() => api.rotateBy(45)} aria-label={t("controls.rotateRight")} className="border-ink/10 text-ink hover:bg-white inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/70 active:scale-95">
                <RotateCw className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => api.zoomBy(0.8)} aria-label={t("controls.zoomIn")} className="border-ink/10 text-ink hover:bg-white inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/70 active:scale-95">
                <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden />
              </button>
              <button type="button" onClick={() => api.zoomBy(1.25)} aria-label={t("controls.zoomOut")} className="border-ink/10 text-ink hover:bg-white inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/70 active:scale-95">
                <Minus className="h-4 w-4" strokeWidth={2.2} aria-hidden />
              </button>
            </div>
            <button
              type="button"
              aria-pressed={drag}
              onClick={() => {
                const next = !drag;
                setDrag(next);
                api.setDrag(next);
              }}
              className={cn("inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors", drag ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}
            >
              <Hand className="h-4 w-4" strokeWidth={2} aria-hidden />
              {t("controls.drag")}
            </button>
          </div>
        ) : null}
        <p className="text-steel border-ink/8 border-t px-4 py-2.5 text-xs">{status === "error" ? t("fallbackNote") : drag ? t("hintDrag") : t("hint")}</p>
      </div>

      <div>
        <button type="button" onClick={() => setListOpen((o) => !o)} aria-expanded={listOpen} className="text-steel hover:text-ink inline-flex items-center gap-1.5 text-sm font-semibold">
          {t("regionsList")}
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", listOpen && "rotate-180")} aria-hidden />
        </button>
        {listOpen ? (
          <div className="scroll-row -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label={t("regionsList")}>
            {regionIds.map((id) => (
              <button key={id} type="button" aria-pressed={selected === id} onClick={() => select(selected === id ? null : id)} className={cn("inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-[background-color,color,transform] duration-300 active:scale-95", selected === id ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70 hover:bg-white")}>
                {labels[id]}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <RegionSheet region={selected} concern={concern} pain={pain} catalogue={catalogue} signedIn={signedIn} onConcern={setConcern} onPain={setPain} onClose={() => select(null)} />
      </div>
    </div>
  );
}
