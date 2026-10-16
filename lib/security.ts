import { getSupabaseEnv } from "@/lib/supabase/env";

/** In-app path only: blocks "//host", "/\\host" and absolute URLs (open-redirect protection). */
export function safePath(value: string, fallback: string): string {
  return /^\/(?![/\\])[^\s]*$/.test(value) ? value : fallback;
}

/**
 * Image URLs stored from forms must point at our own public Supabase Storage.
 * Anything else (other hosts, data:, javascript:) is dropped; CSP blocks foreign images anyway.
 */
export function ownStorageUrl(value: string): string | null {
  const env = getSupabaseEnv();
  if (!value || !env) return null;
  const prefix = `${env.url.replace(/\/$/, "")}/storage/v1/object/public/`;
  return value.startsWith(prefix) && !/[\s"'<>]/.test(value) ? value : null;
}
