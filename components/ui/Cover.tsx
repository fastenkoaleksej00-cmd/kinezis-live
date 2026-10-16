import { cn } from "@/lib/utils";

type CoverTone = "deep" | "mint" | "light";

interface CoverProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: CoverTone;
  /** Tailwind aspect class, e.g. "aspect-[4/5]" */
  ratio?: string;
  label?: string;
  /** Real photo or poster; the brand gradient stays underneath as the loading fallback */
  imageSrc?: string;
}

const tones: Record<CoverTone, string> = {
  deep: "cover",
  mint: "cover cover-mint",
  light: "cover cover-light",
};

/**
 * Brand-styled cover surface used until real photos and video thumbnails arrive.
 * Deliberately not a stock image: a petrol or mint gradient with a soft glow.
 */
export function Cover({ tone = "deep", ratio = "aspect-[4/5]", label, imageSrc, className, children, ...props }: CoverProps) {
  return (
    <div className={cn(tones[tone], ratio, "rounded-3xl", className)} {...props}>
      {imageSrc ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-transparent" aria-hidden />
        </>
      ) : null}
      {label ? (
        <span className="absolute top-3 left-3 z-10 rounded-full border border-white/40 bg-white/15 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.18em] text-white uppercase backdrop-blur-md">
          {label}
        </span>
      ) : null}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
