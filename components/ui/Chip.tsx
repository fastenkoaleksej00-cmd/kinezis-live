import { cn } from "@/lib/utils";

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/** Category filter pill. Active state uses the petrol gradient, inactive is light glass. */
export function Chip({ active = false, className, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-[background-color,color,border-color,box-shadow] duration-300 ease-[var(--ease-out-expo)]",
        active
          ? "bg-linear-to-b from-ink-2 to-ink text-white shadow-[0_10px_24px_-12px_rgba(16,36,43,0.7)]"
          : "border border-ink/10 bg-white/70 text-ink hover:border-accent/40 hover:bg-white",
        className,
      )}
      {...props}
    />
  );
}
