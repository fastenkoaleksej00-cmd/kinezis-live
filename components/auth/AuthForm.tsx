"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { signIn, signUp, type AuthState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";

interface AuthFormProps {
  mode: "signIn" | "signUp";
}

const initial: AuthState = {};

const field =
  "border-ink/10 text-ink placeholder:text-steel/70 focus:border-accent/50 h-12 w-full rounded-2xl border bg-white/80 px-4 text-[15px] outline-none transition-[border-color,box-shadow] focus:shadow-[0_0_0_3px_rgba(42,134,180,0.12)]";

/** Email + password form for both modes, driven by server actions. */
export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState(mode === "signIn" ? signIn : signUp, initial);

  if (state.checkEmail) {
    return (
      <div className="glass flex flex-col items-center rounded-3xl px-6 py-10 text-center">
        <span className="bg-accent-soft text-accent mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
          <MailCheck className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <p className="text-ink font-semibold">{t("checkEmailTitle")}</p>
        <p className="text-steel mt-1.5 max-w-sm text-sm">{t("checkEmailBody")}</p>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-4 p-5" aria-busy={pending}>
      {mode === "signUp" ? (
        <label className="block">
          <span className="eyebrow mb-2 block">{t("displayName")}</span>
          <input name="displayName" type="text" autoComplete="name" maxLength={60} className={field} />
        </label>
      ) : null}
      <label className="block">
        <span className="eyebrow mb-2 block">{t("email")}</span>
        <input name="email" type="email" required autoComplete="email" inputMode="email" className={field} />
      </label>
      <label className="block">
        <span className="eyebrow mb-2 block">{t("password")}</span>
        <input
          name="password"
          type="password"
          required
          minLength={mode === "signUp" ? 8 : 1}
          autoComplete={mode === "signUp" ? "new-password" : "current-password"}
          className={field}
        />
        {mode === "signUp" ? <span className="text-steel mt-1.5 block text-xs">{t("passwordHint")}</span> : null}
      </label>

      {state.error ? (
        <p role="alert" className="rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] px-4 py-3 text-sm text-[#8a2f2f]">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {mode === "signIn" ? t("signIn") : t("createAccount")}
      </Button>

      <p className="text-steel text-center text-sm">
        {mode === "signIn" ? t("noAccount") : t("haveAccount")}{" "}
        <Link href={mode === "signIn" ? "/auth/sign-up" : "/auth/sign-in"} className="text-accent font-semibold hover:underline">
          {mode === "signIn" ? t("createAccount") : t("signIn")}
        </Link>
      </p>
    </form>
  );
}
