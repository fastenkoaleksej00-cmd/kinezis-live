interface BarChartProps {
  bars: Array<{ label: string; value: number }>;
  ariaLabel: string;
}

/** Sessions per week, SVG bars. */
export function BarChart({ bars, ariaLabel }: BarChartProps) {
  const w = 640;
  const h = 160;
  const pad = { l: 24, r: 8, t: 12, b: 28 };
  const max = Math.max(1, ...bars.map((b) => b.value));
  const bw = (w - pad.l - pad.r) / bars.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={ariaLabel} className="h-auto w-full">
      {bars.map((b, i) => {
        const bh = ((h - pad.t - pad.b) * b.value) / max;
        const x = pad.l + i * bw + bw * 0.2;
        return (
          <g key={b.label}>
            <rect x={x} y={h - pad.b - bh} width={bw * 0.6} height={bh} rx="6" fill={b.value > 0 ? "#2a86b4" : "rgba(16,36,43,0.07)"}>
              <title>
                {b.label}: {b.value}
              </title>
            </rect>
            {b.value > 0 ? (
              <text x={x + bw * 0.3} y={h - pad.b - bh - 6} textAnchor="middle" fontSize="11" fill="currentColor" className="text-ink" fontWeight="600">
                {b.value}
              </text>
            ) : null}
            {i % 2 === 0 ? (
              <text x={x + bw * 0.3} y={h - 8} textAnchor="middle" fontSize="10" fill="currentColor" className="text-steel">
                {b.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
