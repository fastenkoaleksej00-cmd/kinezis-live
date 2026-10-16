"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Flag, X } from "lucide-react";
import { Select, Textarea } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { useDialogFocus } from "@/lib/useDialogFocus";
import { submitReport, type TrainerState } from "@/lib/trainers/actions";
import { reportReasons, type ReportTarget } from "@/lib/trainers/types";

const initial: TrainerState = {};

/** "Report" for members: reason + details, reviewed by an admin. Signed-out visitors are asked to sign in. */
export function ReportButton({ targetType, targetId, signedIn, className }: { targetType: ReportTarget; targetId: string; signedIn: boolean; className?: string }) {
  const t = useTranslations("report");
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, open);
  const [state, action, pending] = useActionState(submitReport, initial);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className ?? "text-steel hover:text-ink inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors"}>
        <Flag className="h-3.5 w-3.5" aria-hidden />
        {t("button")}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div key="overlay" className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.25 }} onClick={() => setOpen(false)}>
            <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-label={t("title")} className="pb-safe w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-[var(--shadow-card)] md:rounded-3xl" initial={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-ink text-lg font-bold">{t("title")}</h2>
                <button type="button" onClick={() => setOpen(false)} aria-label={t("close")} className="text-ink hover:bg-frost inline-flex h-9 w-9 items-center justify-center rounded-full">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              {!signedIn ? (
                <p className="text-steel text-sm">{t("signIn")}</p>
              ) : state.ok ? (
                <p className="bg-mint-soft text-mint-deep pop-in rounded-2xl px-4 py-3 text-sm font-semibold">{t("thanks")}</p>
              ) : (
                <form action={action} className="space-y-4" aria-busy={pending}>
                  <input type="hidden" name="target_type" value={targetType} />
                  <input type="hidden" name="target_id" value={targetId} />
                  <label className="block">
                    <span className="text-steel mb-1.5 block text-xs font-semibold">{t("reason")}</span>
                    <Select name="reason" defaultValue="unsafe">
                      {reportReasons.map((r) => (
                        <option key={r} value={r}>
                          {t(`reasons.${r}`)}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label className="block">
                    <span className="text-steel mb-1.5 block text-xs font-semibold">{t("details")}</span>
                    <Textarea name="details" rows={3} maxLength={1000} />
                  </label>
                  <p className="text-steel text-xs">{t("note")}</p>
                  {state.error ? <p className="text-sm text-[#8a2f2f]">{t("error")}</p> : null}
                  <Button type="submit" size="md" disabled={pending}>
                    {t("send")}
                  </Button>
                </form>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
