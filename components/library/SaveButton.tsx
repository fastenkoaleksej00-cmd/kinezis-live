"use client";

import { useTranslations } from "next-intl";
import { Bookmark } from "lucide-react";
import { useFavorites } from "@/lib/store/favorites";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  /** e.g. workoutKey(id) or postKey(id) */
  itemKey: string;
  /** "glass" sits on covers, "solid" on light surfaces */
  look?: "glass" | "solid";
  size?: "sm" | "md";
  withLabel?: boolean;
  className?: string;
}

/** Bookmark toggle. Stored locally for now, synced to the account later. */
export function SaveButton({ itemKey, look = "glass", size = "sm", withLabel = false, className }: SaveButtonProps) {
  const t = useTranslations("library");
  const { has, toggle } = useFavorites();
  const saved = has(itemKey);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? t("unsave") : t("save")}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(itemKey);
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-95",
        size === "sm" ? "h-9 min-w-9 px-2.5 text-sm" : "h-11 min-w-11 px-4 text-[15px]",
        look === "glass" && "border border-white/40 bg-white/15 text-white backdrop-blur-md hover:bg-white/30",
        look === "solid" && (saved ? "border-accent/50 bg-accent-soft text-accent border" : "border-ink/10 text-ink border bg-white/70 hover:bg-white"),
        className,
      )}
    >
      <Bookmark className={size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]"} fill={saved ? "currentColor" : "none"} strokeWidth={1.9} aria-hidden />
      {withLabel ? (saved ? t("saved") : t("save")) : null}
    </button>
  );
}
