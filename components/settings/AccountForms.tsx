"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Field, Input } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { changeEmail, changePassword, deleteAccount, type ProfileState } from "@/lib/profile/actions";

const initial: ProfileState = {};

export function AccountForms({ email }: { email: string | null }) {
  const t = useTranslations("settings.account");
  const [emailState, emailAction, emailPending] = useActionState(changeEmail, initial);
  const [passState, passAction, passPending] = useActionState(changePassword, initial);
  const [confirm, setConfirm] = useState("");

  return (
    <div className="space-y-4">
      <form action={emailAction} className="card space-y-4 p-5" aria-busy={emailPending}>
        <h2 className="text-ink text-base font-bold">{t("emailTitle")}</h2>
        <Field label={t("emailLabel")} hint={email ? t("emailCurrent", { email }) : undefined}>
          <Input name="email" type="email" required autoComplete="email" />
        </Field>
        {emailState.checkEmail ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("emailSent")}</p> : null}
        {emailState.error ? <p role="alert" className="rounded-2xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">{t(`errors.${emailState.error}`)}</p> : null}
        <Button type="submit" variant="secondary" disabled={emailPending}>
          {t("emailCta")}
        </Button>
      </form>

      <form action={passAction} className="card space-y-4 p-5" aria-busy={passPending}>
        <h2 className="text-ink text-base font-bold">{t("passwordTitle")}</h2>
        <Field label={t("passwordLabel")} hint={t("passwordHint")}>
          <Input name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        {passState.ok ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("passwordSaved")}</p> : null}
        {passState.error ? <p role="alert" className="rounded-2xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">{t(`errors.${passState.error}`)}</p> : null}
        <Button type="submit" variant="secondary" disabled={passPending}>
          {t("passwordCta")}
        </Button>
      </form>

      <form action={deleteAccount} className="card space-y-4 border-danger-line/60 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
          <div>
            <h2 className="text-ink text-base font-bold">{t("deleteTitle")}</h2>
            <p className="text-steel mt-1 text-sm">{t("deleteBody")}</p>
          </div>
        </div>
        <Field label={t("deleteConfirmLabel")}>
          <Input name="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" autoComplete="off" />
        </Field>
        <button type="submit" disabled={confirm !== "DELETE"} className="inline-flex h-11 items-center rounded-full bg-[#8a2f2f] px-5 text-[15px] font-semibold text-white disabled:opacity-40">
          {t("deleteCta")}
        </button>
      </form>
    </div>
  );
}
