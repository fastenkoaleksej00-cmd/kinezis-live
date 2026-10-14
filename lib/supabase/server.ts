import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/** Server client bound to the request cookies. Returns null when Supabase is not configured. */
export async function createServerSupabase(): Promise<SupabaseClient | null> {
  const env = getSupabaseEnv();
  if (!env) return null;
  const cookieStore = await cookies();

  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: the middleware refreshes the session instead
        }
      },
    },
  });
}

export interface SessionUser {
  id: string;
  email: string | null;
  displayName: string | null;
  role: "user" | "trainer" | "admin";
  plan: "free" | "premium" | "premium_plus";
  planUntil: string | null;
  premiumInterest: boolean;
}

export function isStaff(user: SessionUser | null): boolean {
  return !!user && (user.role === "trainer" || user.role === "admin");
}

/** Current user plus profile row, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("display_name, role, plan, plan_until, premium_interest").eq("id", user.id).maybeSingle();
  const role = profile?.role === "trainer" || profile?.role === "admin" ? profile.role : "user";
  const plan = profile?.plan === "premium" || profile?.plan === "premium_plus" ? profile.plan : "free";
  const metaName = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null;

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: profile?.display_name ?? metaName,
    role,
    plan,
    planUntil: profile?.plan_until ?? null,
    premiumInterest: Boolean(profile?.premium_interest),
  };
}
