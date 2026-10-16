import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** "ink" for light surfaces, "white" for petrol surfaces, "auto" follows the theme (ink on light/mint, white on dark) */
  tone?: "ink" | "white" | "auto";
  /** Show the KINEZIS wordmark next to the spine mark */
  withWord?: boolean;
  className?: string;
  markClassName?: string;
}

/**
 * Temporary logo: the spine mark and wordmark extracted from the KINEZIS site's
 * raster logo and recoloured. Replace the PNGs in public/brand when the final
 * SVG/PNG source arrives; this component's API stays the same.
 */
export function Logo({ tone = "auto", withWord = true, className, markClassName }: LogoProps) {
  // "auto" renders both variants; CSS (.logo-ink / .logo-white in globals.css) shows the one matching the theme
  const variants = tone === "auto" ? (["", "-white"] as const) : ([tone === "white" ? "-white" : ""] as const);
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {variants.map((suffix) => (
        <span key={suffix} className={cn("inline-flex items-center gap-2.5", tone === "auto" && (suffix ? "logo-white" : "logo-ink"))}>
          <Image src={`/brand/logo-mark${suffix}.png`} alt="" width={64} height={214} priority className={cn("h-8 w-auto", markClassName)} />
          {withWord ? (
            <span className="inline-flex items-baseline gap-1.5">
              <Image src={`/brand/logo-word${suffix}.png`} alt="KINEZIS" width={840} height={118} priority className="h-[13px] w-auto" />
              <span className={cn("text-xs leading-none font-semibold tracking-[0.3em]", suffix ? "text-glow" : "text-accent")}>LIVE</span>
            </span>
          ) : null}
        </span>
      ))}
    </span>
  );
}
