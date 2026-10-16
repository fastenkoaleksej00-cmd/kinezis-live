import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

let client: SupabaseClient | null = null;

/**
 * Anonymous server-side client for public content (published sessions, programmes, authors, shop).
 * No cookies and no session, so its results are the same for everyone and safe to cache across requests;
 * RLS still applies exactly as for a signed-out visitor. Never use it for personal data or drafts.
 */
export function getPublicDb(): SupabaseClient | null {
  const env = getSupabaseEnv();
  if (!env) return null;
  client ??= createClient(env.url, env.key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

/** Cache tags for public content; server actions call revalidatePublicContent() after any change */
export const contentTags = ["workouts", "courses", "authors", "shop"] as const;
