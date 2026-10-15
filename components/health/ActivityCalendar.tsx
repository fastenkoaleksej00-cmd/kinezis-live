interface ActivityCalendarProps {
  /** YYYY-MM-DD days with activity */
  activeDays: string[];
  weeks: number;
  label: string;
}

/** 12-week dot calendar (Mon–Sun columns), SVG only, no library. */
export function ActivityCalendar({ activeDays, weeks, label }: ActivityCalendarProps) {
  const set = new Set(activeDays);
  const today = new Date();
  const monday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7) - 7 * (weeks - 1));
  const cell = 16;
  const gap = 4;
  const w = weeks * (cell + gap);
  const h = 7 * (cell + gap);
  const cells: Array<{ x: number; y: number; on: boolean; future: boolean; key: string }> = [];
  for (let wk = 0; wk < weeks; wk++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(monday);
      date.setUTCDate(monday.getUTCDate() + wk * 7 + d);
      const key = date.toISOString().slice(0, 10);
      cells.push({ x: wk * (cell + gap), y: d * (cell + gap), on: set.has(key), future: date.getTime() > today.getTime(), key });
    }
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="h-auto w-full max-w-[520px]">
      {cells.map((c) => (
        <rect key={c.key} x={c.x} y={c.y} width={cell} height={cell} rx="5" fill={c.on ? "#2a86b4" : c.future ? "transparent" : "rgba(16,36,43,0.07)"} stroke={c.future ? "rgba(16,36,43,0.08)" : "none"}>
          <title>{c.key}</title>
        </rect>
      ))}
    </svg>
  );
}
