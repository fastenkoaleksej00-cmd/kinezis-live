import { cn } from "@/lib/utils";

export type IllustrationKind = "saved" | "sessions" | "messages" | "measurements" | "search" | "community";

interface IllustrationProps {
  kind: IllustrationKind;
  className?: string;
}

/**
 * Brand SVG illustrations for empty states. Drawn with theme tokens so they follow
 * light, mint and dark themes. Decorative: aria-hidden.
 */
export function Illustration({ kind, className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 160" className={cn("h-36 w-auto", className)} aria-hidden>
      <defs>
        <linearGradient id={`ill-bg-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-accent-2)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--color-mint)" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={`ill-deep-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-ink-2)" />
          <stop offset="1" stopColor="var(--color-ink)" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="92" rx="86" ry="54" fill={`url(#ill-bg-${kind})`} />
      <circle cx="152" cy="40" r="10" fill="var(--color-glow)" opacity="0.6" />
      <circle cx="42" cy="118" r="6" fill="var(--color-mint)" opacity="0.8" />
      {kind === "saved" ? (
        <g>
          <path d="M72 36h56a8 8 0 0 1 8 8v84l-36-22-36 22V44a8 8 0 0 1 8-8z" fill={`url(#ill-deep-${kind})`} />
          <path d="M100 58l5.5 11.5 12.5 1.8-9 8.8 2.1 12.4L100 86.6l-11.1 5.9 2.1-12.4-9-8.8 12.5-1.8z" fill="var(--color-glow)" />
          <circle cx="156" cy="110" r="4" fill="var(--color-accent)" />
        </g>
      ) : null}
      {kind === "sessions" ? (
        <g>
          <circle cx="100" cy="84" r="40" fill={`url(#ill-deep-${kind})`} />
          <circle cx="100" cy="84" r="52" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeDasharray="200 127" strokeLinecap="round" transform="rotate(-90 100 84)" />
          <path d="M92 68l24 16-24 16z" fill="var(--color-ice)" />
        </g>
      ) : null}
      {kind === "messages" ? (
        <g>
          <rect x="44" y="46" width="88" height="56" rx="18" fill={`url(#ill-deep-${kind})`} />
          <path d="M66 100l-10 18 24-14z" fill={`url(#ill-deep-${kind})`} />
          <rect x="86" y="78" width="72" height="44" rx="16" fill="var(--color-ice)" stroke="var(--color-accent)" strokeWidth="2.5" />
          <path d="M138 120l10 14-24-10z" fill="var(--color-ice)" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="104" cy="100" r="3.5" fill="var(--color-accent)" />
          <circle cx="118" cy="100" r="3.5" fill="var(--color-accent)" />
          <circle cx="132" cy="100" r="3.5" fill="var(--color-accent)" />
          <rect x="60" y="62" width="44" height="6" rx="3" fill="var(--color-glow)" opacity="0.9" />
          <rect x="60" y="76" width="30" height="6" rx="3" fill="var(--color-glow)" opacity="0.6" />
        </g>
      ) : null}
      {kind === "measurements" ? (
        <g>
          <path d="M40 112c20-40 40-52 60-52s40 12 60 52" fill="none" stroke="var(--color-mist)" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
          <path d="M40 112c20-40 40-52 60-52s40 12 60 52" fill="none" stroke="var(--color-accent)" strokeWidth="10" strokeLinecap="round" strokeDasharray="110 300" />
          <circle cx="100" cy="60" r="12" fill={`url(#ill-deep-${kind})`} />
          <circle cx="100" cy="60" r="5" fill="var(--color-ice)" />
          <rect x="56" y="118" width="88" height="10" rx="5" fill={`url(#ill-deep-${kind})`} />
          {[66, 78, 90, 102, 114, 126].map((x) => (
            <rect key={x} x={x} y="120" width="2" height={x % 24 === 18 ? 6 : 4} fill="var(--color-ice)" />
          ))}
        </g>
      ) : null}
      {kind === "search" ? (
        <g>
          <circle cx="92" cy="80" r="30" fill="var(--color-ice)" stroke={`url(#ill-deep-${kind})`} strokeWidth="8" />
          <path d="M114 102l24 24" stroke={`url(#ill-deep-${kind})`} strokeWidth="10" strokeLinecap="round" />
          <path d="M80 80h24M92 68v24" stroke="var(--color-accent)" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        </g>
      ) : null}
      {kind === "community" ? (
        <g>
          <circle cx="76" cy="70" r="16" fill={`url(#ill-deep-${kind})`} />
          <circle cx="124" cy="70" r="16" fill="var(--color-accent)" />
          <path d="M44 122c0-20 14-32 32-32s32 12 32 32z" fill={`url(#ill-deep-${kind})`} />
          <path d="M92 122c0-20 14-32 32-32s32 12 32 32z" fill="var(--color-accent)" opacity="0.9" />
          <circle cx="100" cy="46" r="6" fill="var(--color-glow)" />
        </g>
      ) : null}
    </svg>
  );
}
