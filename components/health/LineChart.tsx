interface Point {
  date: string;
  value: number;
}

interface LineChartProps {
  points: Point[];
  unit: string;
  /** Accessible summary */
  label: string;
  color?: string;
}

/**
 * Dependency-free SVG line chart. Renders only real points; with fewer than two it shows nothing
 * (the caller shows an empty state instead).
 */
export function LineChart({ points, unit, label, color = "#2a86b4" }: LineChartProps) {
  if (points.length < 2) return null;
  const w = 640;
  const h = 220;
  const pad = { l: 44, r: 16, t: 16, b: 32 };
  const xs = points.map((p) => new Date(p.date).getTime());
  const ys = points.map((p) => p.value);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.floor(Math.min(...ys) - 1);
  const maxY = Math.ceil(Math.max(...ys) + 1);
  const sx = (x: number) => pad.l + ((x - minX) / Math.max(1, maxX - minX)) * (w - pad.l - pad.r);
  const sy = (y: number) => h - pad.b - ((y - minY) / Math.max(1, maxY - minY)) * (h - pad.t - pad.b);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(new Date(p.date).getTime()).toFixed(1)},${sy(p.value).toFixed(1)}`).join(" ");
  const area = `${path} L${sx(maxX).toFixed(1)},${(h - pad.b).toFixed(1)} L${sx(minX).toFixed(1)},${(h - pad.b).toFixed(1)} Z`;
  const ticks = [minY, (minY + maxY) / 2, maxY];
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.getUTCDate()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  };
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="h-auto w-full">
      <defs>
        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={sy(t)} y2={sy(t)} stroke="currentColor" className="text-ink" strokeOpacity="0.1" />
          <text x={pad.l - 8} y={sy(t) + 4} textAnchor="end" fontSize="11" fill="currentColor" className="text-steel">
            {Number.isInteger(t) ? t : t.toFixed(1)}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#chart-fill)" className="fade-in" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" pathLength={1} className="line-in" />
      {points.map((p) => (
        <circle key={p.date} cx={sx(new Date(p.date).getTime())} cy={sy(p.value)} r="3.5" fill="var(--color-ice)" stroke={color} strokeWidth="2">
          <title>
            {fmt(p.date)}: {p.value} {unit}
          </title>
        </circle>
      ))}
      <text x={pad.l} y={h - 10} fontSize="11" fill="currentColor" className="text-steel">
        {fmt(first.date)}
      </text>
      <text x={w - pad.r} y={h - 10} fontSize="11" fill="currentColor" className="text-steel" textAnchor="end">
        {fmt(last.date)}
      </text>
    </svg>
  );
}
