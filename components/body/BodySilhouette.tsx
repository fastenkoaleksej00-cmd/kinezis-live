"use client";

import { regions, type RegionId } from "@/lib/body/regions";
import { cn } from "@/lib/utils";

interface BodySilhouetteProps {
  selected: RegionId | null;
  view: "front" | "back";
  onSelect: (id: RegionId) => void;
  labels: Record<RegionId, string>;
}

/**
 * Lightweight fallback when WebGL or the model is unavailable: a simple figure with tappable hotspots.
 * Hotspot positions are projected from the same region anchors (x, y) used by the 3D scene.
 */
export function BodySilhouette({ selected, view, onSelect, labels }: BodySilhouetteProps) {
  const W = 240;
  const H = 440;
  const toXY = (x: number, y: number) => ({ cx: W / 2 + (view === "front" ? x : -x) * 230, cy: H - 20 - y * 230 });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-full w-auto max-w-full" role="group">
      <g fill="currentColor" className="text-mist" opacity="0.5">
        <circle cx={W / 2} cy={62} r={24} />
        <rect x={W / 2 - 34} y={92} width={68} height={120} rx={24} />
        <rect x={W / 2 - 62} y={100} width={22} height={118} rx={11} />
        <rect x={W / 2 + 40} y={100} width={22} height={118} rx={11} />
        <rect x={W / 2 - 32} y={214} width={28} height={190} rx={14} />
        <rect x={W / 2 + 4} y={214} width={28} height={190} rx={14} />
      </g>
      {regions
        .filter((r) => r.view === "both" || r.view === view)
        .map((r) => {
          const { cx, cy } = toXY(r.anchor[0], r.anchor[1]);
          const active = selected === r.id;
          return (
            <g key={r.id} onClick={() => onSelect(r.id)} className="cursor-pointer" role="button" aria-label={labels[r.id]} aria-pressed={active}>
              <circle cx={cx} cy={cy} r={active ? 15 : 11} className={cn("transition-all duration-300", active ? "fill-accent" : "fill-white stroke-accent")} strokeWidth={2} fillOpacity={active ? 0.9 : 0.85} />
              <circle cx={cx} cy={cy} r={4} className="fill-white" />
            </g>
          );
        })}
    </svg>
  );
}
