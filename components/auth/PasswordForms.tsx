"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { requestPasswordReset, updatePassword, type AuthState } from "@/lib/auth/actions";

const initial: AuthState = {};
const field =
  "border-ink/10 text-ink placeholder:text-steel/70 focus:border-accent/50 h-12 w-full rounded-2xl border bg-white/80 px-4 text-[15px] outline-none transition-[border-color,box-shadow] focus:shadow-[0_0_0_3px_rgba(42,134,180,0.12)]";

export function ForgotForm() {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState(requestPasswordReset, initial);

  if (state.checkEmail) {
    return (
      <div className="glass flex flex-col items-center rounded-3xl px-6 py-10 text-center">
        <span className="bg-accent-soft text-accent mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
          <MailCheck className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <p className="text-ink font-semibold">{t("checkEmailTitle")}</p>
        <p className="text-steel mt-1.5 max-w-sm text-sm">{t("resetEmailBody")}</p>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-4 p-5" aria-busy={pending}>
      <label className="block">
        <span className="eyebrow mb-2 block">{t("email")}</span>
        <input name="email" type="email" required autoComplete="email" inputMode="email" className={field} />
      </label>
      {state.error ? (
        <p role="alert" className="rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] px-4 py-3 text-sm text-[#8a2f2f]">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? t("working") : t("forgotCta")}
      </Button>
      <p className="text-steel text-center text-sm">
        <Link href="/auth/sign-in" className="text-accent font-semibold hover:underline">
          {t("backToSignIn")}
        </Link>
      </p>
    </form>
  );
}

export function ResetForm() {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState(updatePassword, initial);

  return (
    <form action={action} className="card space-y-4 p-5" aria-busy={pending}>
      <label className="block">
        <span className="eyebrow mb-2 block">{t("newPassword")}</span>
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className={field} />
        <span className="text-steel mt-1.5 block text-xs">{t("passwordHint")}</span>
      </label>
      {state.error ? (
        <p role="alert" className="rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] px-4 py-3 text-sm text-[#8a2f2f]">
          {t(`errors.${state.error}`)}
          {state.error === "expired" ? (
            <>
              {" "}
              <Link href="/auth/forgot" className="font-semibold underline">
                {t("requestNew")}
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? t("working") : t("resetCta")}
      </Button>
    </form>
  );
}
