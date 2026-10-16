"use client";

import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdminErrorCode } from "@/lib/admin/shared";

interface SubmitRowProps {
  pending: boolean;
  error?: AdminErrorCode;
  deleteAction?: (fd: FormData) => void | Promise<void>;
  id?: string;
}

/** Save button, optional delete with a confirm, and the error line. Used inside the entity forms. */
export function SubmitRow({ pending, error, deleteAction, id }: SubmitRowProps) {
  const t = useTranslations("admin");
  return (
    <div className="space-y-3">
      {error ? (
        <p role="alert" className="rounded-2xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">
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
