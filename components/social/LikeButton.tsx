"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleLike } from "@/lib/social/actions";
import type { ReactionTarget } from "@/lib/social/types";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  targetType: ReactionTarget;
  targetId: string;
  likes: number;
  liked: boolean;
  signedIn: boolean;
  look?: "light" | "glass";
}

/** Optimistic like with a count. Signed-out visitors are sent to sign-in. */
export function LikeButton({ targetType, targetId, likes, liked, signedIn, look = "light" }: LikeButtonProps) {
  const t = useTranslations("social");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [state, setOptimistic] = useOptimistic({ likes, liked }, (cur, next: boolean) => ({ liked: next, likes: cur.likes + (next ? 1 : -1) }));

  return (
    <button
      type="button"
      aria-pressed={state.liked}
      aria-label={state.liked ? t("unlike") : t("like")}
      disabled={pending}
      onClick={() => {
        if (!signedIn) {
          router.push("/auth/sign-in");
          return;
        }
        start(async () => {
          setOptimistic(!state.liked);
          const res = await toggleLike(targetType, targetId);
          if (res.signedOut) router.push("/auth/sign-in");
          router.refresh();
        });
      }}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-[background-color,color,transform] duration-300 active:scale-95",
        look === "glass"
          ? "border border-white/40 bg-white/15 text-white backdrop-blur-md hover:bg-white/30"
          : state.liked
            ? "bg-[#fdeef0] text-[#c0394f]"
            : "border-ink/10 text-ink border bg-white/70 hover:bg-white",
      )}
    >
      <Heart className="h-4 w-4" fill={state.liked ? "currentColor" : "none"} strokeWidth={2} aria-hidden />
      <span className="tabular-nums">{state.likes}</span>
    </button>
  );
}
