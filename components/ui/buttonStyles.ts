import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "light";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-linear-to-b from-ink-2 to-ink text-white shadow-[0_1px_0_rgba(197,224,233,0.25)_inset,0_14px_32px_-14px_rgba(16,36,43,0.75)] hover:from-ink-3 hover:to-ink-2 hover:shadow-[0_1px_0_rgba(142,220,240,0.4)_inset,0_18px_36px_-14px_rgba(16,36,43,0.8)]",
  secondary:
    "border border-white/80 bg-white/55 text-ink shadow-[0_1px_0_rgba(255,255,255,0.7)_inset] backdrop-blur-md hover:border-accent/40 hover:bg-white/85",
  ghost: "text-ink hover:bg-ink/5",
  light: "bg-white text-ink hover:bg-frost",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

export function buttonStyles(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}
