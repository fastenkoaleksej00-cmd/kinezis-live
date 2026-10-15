"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Film, Newspaper, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAddMenuProps {
  staff: boolean;
}

/** Floating "+". Members go straight to the post composer; staff choose between a post and a workout video. */
export function QuickAddMenu({ staff }: QuickAddMenuProps) {
  const t = useTranslations("quickAdd");
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const fab = "fixed right-4 bottom-24 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-b from-ink-2 to-ink text-white shadow-[0_1px_0_rgba(197,224,233,0.25)_inset,0_18px_36px_-14px_rgba(16,36,43,0.8)] transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 active:scale-95 md:right-8 md:bottom-8";

  if (!staff) {
    return (
      <Link href="/compose" aria-label={t("post")} className={fab}>
        <Plus className="h-6 w-6" strokeWidth={2.2} aria-hidden />
      </Link>
    );
  }

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }} className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <motion.div
              initial={reduce ? { opacity: 0 } : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: 16, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-4 bottom-44 flex flex-col gap-2 md:right-8 md:bottom-28"
              onClick={(e) => e.stopPropagation()}
            >
              {[
                { href: "/compose/workout", icon: Film, label: t("workout"), hint: t("workoutHint") },
                { href: "/compose", icon: Newspaper, label: t("post"), hint: t("postHint") },
              ].map(({ href, icon: Icon, label, hint }) => (
                <Link key={href} href={href} className="card flex items-center gap-3 px-4 py-3 transition-transform duration-300 hover:-translate-y-0.5">
                  <span className="bg-accent-soft text-accent inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden />
                  </span>
                  <span>
                    <span className="text-ink block text-sm font-bold">{label}</span>
                    <span className="text-steel block text-xs">{hint}</span>
                  </span>
                </Link>
              ))}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t("add")} className={cn(fab, open && "rotate-45")}>
        <Plus className="h-6 w-6" strokeWidth={2.2} aria-hidden />
      </button>
    </>
  );
}
