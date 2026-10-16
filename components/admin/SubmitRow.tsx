"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdminErrorCode } from "@/lib/admin/shared";

interface SubmitRowProps {
  pending: boolean;
  error?: AdminErrorCode;
  deleteAction?: (fd: FormData) => void | Promise<void>;
  id?: string;
}

/** Where each error points: the first matching field in the form gets the red outline and the focus. */
const fieldFor: Partial<Record<AdminErrorCode, string[]>> = {
  titleRequired: ['[name="title_en"]', '[name="name"]', '[name^="title"]'],
  bodyRequired: ['[name="body_en"]', '[name="caption"]', '[name^="steps_en"]', '[name^="body"]', "textarea"],
  slugTaken: ['[name="slug"]'],
};

/** Save button, optional delete with a confirm, and the error line. Used inside the entity forms. */
export function SubmitRow({ pending, error, deleteAction, id }: SubmitRowProps) {
  const t = useTranslations("admin");
  const ref = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);

  // Point at the field that caused the error (U8): outline, describe, focus and scroll; cleared on the next edit
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    form.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
      el.removeAttribute("aria-invalid");
      el.removeAttribute("aria-describedby");
    });
    if (!error) return;
    const field = (fieldFor[error] ?? []).map((sel) => form.querySelector<HTMLElement>(`${sel}:not([type="hidden"])`)).find(Boolean);
    if (!field) {
      alertRef.current?.focus();
      return;
    }
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", "admin-form-error");
    field.focus({ preventScroll: true });
    field.scrollIntoView({ block: "center", behavior: "smooth" });
    const clear = () => {
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
    };
    field.addEventListener("input", clear, { once: true });
    return () => field.removeEventListener("input", clear);
  }, [error]);

  return (
    <div ref={ref} className="space-y-3">
      {error ? (
        <p ref={alertRef} id="admin-form-error" tabIndex={-1} role="alert" className="rounded-2xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">
          {t(`errors.${error}`)}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {t("save")}
        </Button>
        {deleteAction && id ? (
          <button
            type="submit"
            formAction={deleteAction}
            formNoValidate
            onClick={(e) => {
              if (!window.confirm(t("confirmDelete"))) e.preventDefault();
            }}
            className="text-steel inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            {t("delete")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
