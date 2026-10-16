"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Film, HelpCircle, MessageSquarePlus, Newspaper, Plus } from "lucide-react";
import { useAudio } from "@/components/audio/AudioProvider";
import { cn } from "@/lib/utils";

interface QuickAddMenuProps {
  staff: boolean;
}

/** Screens where a floating "+" would cover the task at hand */
const hiddenOn = [/^\/compose/, /^\/admin/, /^\/auth/, /^\/messages/, /\/watch$/, /^\/profile\/(edit|settings|trainer)/, /^\/mind\/(meditate|break|evening)/, /^\/breathe\/./, /^\/face-fitness\/[^/]+\/[^/]+$/];

/**
 * One floating "+" for the whole app, always in the same place: above the tab bar on phones
 * (lifted when the mini player is showing), bottom-right on larger screens. Opens a small menu:
 * share an experience or ask a question in the community; trainers also get a feed post and a workout video.
 */
export function QuickAddMenu({ staff }: QuickAddMenuProps) {
  const t = useTranslations("quickAdd");
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const { current } = useAudio();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (hiddenOn.some((r) => r.test(pathname))) return null;

  const lifted = Boolean(current);
  const items = [
    { href: "/compose?to=community", icon: MessageSquarePlus, label: t("share"), hint: t("shareHint") },
    { href: "/compose?to=community&type=question", icon: HelpCircle, label: t("ask"), hint: t("askHint") },
    ...(staff
      ? [
          { href: "/compose", icon: Newspaper, label: t("post"), hint: t("postHint") },
          { href: "/compose/workout", icon: Film, label: t("workout"), hint: t("workoutHint") },
        ]
      : []),
  ];

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div key="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }} className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
        ) : null}
      </AnimatePresence>
      <div
        className={cn(
          "fixed right-4 z-50 flex flex-col items-end gap-3 transition-[bottom] duration-300 ease-[var(--ease-out-expo)] md:right-8",
          lifted ? "bottom-[calc(9rem+env(safe-area-inset-bottom))] md:bottom-28" : "bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-8",
        )}
      >
        <AnimatePresence>
          {open ? (
            <motion.ul
              key="menu"
              initial={reduce ? { opacity: 0 } : { y: 12, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { y: 12, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="glass w-[min(18rem,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-3xl p-1.5"
              role="menu"
            >
              {items.map(({ href, icon: Icon, label, hint }) => (
                <li key={href} role="none">
                  <Link href={href} role="menuitem" className="hover:bg-white/60 flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors">
                    <span className="bg-mint-soft text-mint-deep inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="text-ink block text-sm font-bold">{label}</span>
                      <span className="text-steel block truncate text-xs">{hint}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={open ? t("close") : t("add")}
          className="bg-linear-to-b from-ink-2 to-ink inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_14px_30px_-12px_rgba(31,90,81,0.75)] transition-transform duration-300 ease-[var(--ease-out-expo)] active:scale-95"
        >
          <Plus className={cn("h-6 w-6 transition-transform duration-300 ease-[var(--ease-out-expo)]", open && "rotate-45")} strokeWidth={2.2} aria-hidden />
        </button>
      </div>
    </>
  );
}
