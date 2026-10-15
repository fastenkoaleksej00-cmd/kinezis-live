interface ActivityRingProps {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label: string;
  center?: React.ReactNode;
  className?: string;
}

/** Apple-style activity ring that fills to the real value on mount (CSS animation, reduce-motion aware). */
export function ActivityRing({ value, size = 120, stroke = 12, color = "var(--color-mint-deep)", track = "var(--color-bone-2)", label, center, className }: ActivityRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={label} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          className="ring-progress ring-live"
          style={{ ["--ring-circumference" as string]: `${c}` }}
        />
      </svg>
      {center ? <div className="pointer-events-none relative -mt-[var(--s)] flex items-center justify-center" style={{ ["--s" as string]: `${size}px`, height: size }}>{center}</div> : null}
    </div>
  );
}
