"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { signIn, signInWithGoogle, signUp, type AuthState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";

interface AuthFormProps {
  mode: "signIn" | "signUp";
  /** Google button appears only when the provider is configured (NEXT_PUBLIC_AUTH_GOOGLE=true) */
  googleEnabled?: boolean;
}

const initial: AuthState = {};

const field =
  "border-ink/10 text-ink placeholder:text-steel/70 focus:border-accent/50 h-12 w-full rounded-2xl border bg-white/80 px-4 text-[15px] outline-none transition-[border-color,box-shadow] focus:shadow-[0_0_0_3px_rgba(42,134,180,0.12)]";

/** Email + password form for both modes, driven by server actions. */
export function AuthForm({ mode, googleEnabled = false }: AuthFormProps) {
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
          {state.error === "invalid" && googleEnabled ? ` ${t("errors.invalidHint")}` : ""}
        </p>
      ) : null}

      {mode === "signUp" ? (
        <p className="text-steel text-center text-xs">
          {t.rich("consent", {
            terms: (chunks) => (
              <Link href="/terms" className="text-accent font-semibold hover:underline">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" className="text-accent font-semibold hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? t("working") : mode === "signIn" ? t("signIn") : t("createAccount")}
      </Button>

      {mode === "signIn" ? (
        <p className="text-center text-sm">
          <Link href="/auth/forgot" className="text-accent font-semibold hover:underline">
            {t("forgot")}
          </Link>
        </p>
      ) : null}

      {googleEnabled ? (
        <>
          <div className="flex items-center gap-3">
            <span className="bg-ink/10 h-px flex-1" />
            <span className="text-steel text-xs font-semibold tracking-[0.14em] uppercase">{t("or")}</span>
            <span className="bg-ink/10 h-px flex-1" />
          </div>
          <button type="submit" formAction={signInWithGoogle} formNoValidate className="border-ink/10 text-ink hover:bg-frost inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border bg-white text-[15px] font-semibold transition-colors">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
              <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.4 7.4 24 12 24z" />
              <path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4V6.5H1.4C.5 8.2 0 10 0 12s.5 3.8 1.4 5.5l4-3.1z" />
              <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
            </svg>
            {t("google")}
          </button>
        </>
      ) : null}

      <p className="text-steel text-center text-sm">
        {mode === "signIn" ? t("noAccount") : t("haveAccount")}{" "}
        <Link href={mode === "signIn" ? "/auth/sign-up" : "/auth/sign-in"} className="text-accent font-semibold hover:underline">
          {mode === "signIn" ? t("createAccount") : t("signIn")}
        </Link>
      </p>
    </form>
  );
}
