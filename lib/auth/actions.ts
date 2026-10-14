"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils";

export type AuthErrorCode = "notConfigured" | "invalid" | "unconfirmed" | "exists" | "weakPassword" | "missing" | "generic" | "expired" | "oauth";

export interface AuthState {
  error?: AuthErrorCode;
  /** Sign-up succeeded and a confirmation email was sent */
  checkEmail?: boolean;
}

function mapError(message: string): AuthErrorCode {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "invalid";
  if (m.includes("not confirmed")) return "unconfirmed";
  if (m.includes("already registered") || m.includes("already exists")) return "exists";
  if (m.includes("password") && (m.includes("weak") || m.includes("at least") || m.includes("different"))) return "weakPassword";
  if (m.includes("expired") || m.includes("invalid") && m.includes("token")) return "expired";
  return "generic";
}

async function origin(): Promise<string> {
  const h = await headers();
  return h.get("origin") ?? getSiteUrl();
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "notConfigured" };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "missing" };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: mapError(error.message) };
  redirect("/profile");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "notConfigured" };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!email || !password) return { error: "missing" };
  if (password.length < 8) return { error: "weakPassword" };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { display_name: displayName } : undefined,
      emailRedirectTo: `${await origin()}/auth/callback`,
    },
  });
  if (error) return { error: mapError(error.message) };
  // Supabase returns a user with an empty identities list when the email is already registered
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) return { error: "exists" };
  if (data.session) redirect("/profile");
  return { checkEmail: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  if (supabase) await supabase.auth.signOut();
  redirect("/profile");
}

/* ----------------------------------------------------------------------------
   Password reset and Google
---------------------------------------------------------------------------- */

/** Sends the reset email. Always reports "check your email" so addresses cannot be probed. */
export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "notConfigured" };
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "missing" };
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${await origin()}/auth/callback?next=/auth/reset` });
  return { checkEmail: true };
}

/** Sets a new password for the session created by the recovery link. */
export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "notConfigured" };
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "weakPassword" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "expired" };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: mapError(error.message) };
  redirect("/profile?password=updated");
}

/** Google is shown only when NEXT_PUBLIC_AUTH_GOOGLE=true and the provider is enabled in Supabase (see docs/AUTH.md). */
export async function signInWithGoogle(): Promise<void> {
  const supabase = await createServerSupabase();
  if (!supabase) redirect("/auth/sign-in?error=notConfigured");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await origin()}/auth/callback?next=/profile` },
  });
  if (error || !data.url) redirect("/auth/sign-in?error=oauth");
  redirect(data.url);
}
