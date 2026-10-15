import { createServerSupabase } from "@/lib/supabase/server";

export interface PublicMember {
  id: string;
  displayName: string | null;
  avatarSrc: string | null;
  role: "user" | "trainer" | "admin";
}

/** Name and avatar for members, respecting their "profile visible" setting (via the public_profiles view). */
export async function getPublicMembers(ids: string[]): Promise<Record<string, PublicMember>> {
  const out: Record<string, PublicMember> = {};
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return out;
  const supabase = await createServerSupabase();
  if (!supabase) return out;
  const { data } = await supabase.from("public_profiles").select("id, display_name, avatar_src, role").in("id", unique);
  for (const r of (data ?? []) as Array<{ id: string; display_name: string | null; avatar_src: string | null; role: string }>) {
    out[r.id] = { id: r.id, displayName: r.display_name, avatarSrc: r.avatar_src, role: r.role === "trainer" || r.role === "admin" ? r.role : "user" };
  }
  return out;
}

export interface PublicMemberProfile extends PublicMember {
  bio: string | null;
  interests: string[];
  bannerSrc: string | null;
  bannerPreset: string;
  bannerPosition: number;
  showActivity: boolean;
  visible: boolean;
}

/**
 * A member's public page data. Reads the full profile row only through a staff/own session;
 * for everyone else it uses the privacy-filtered view plus the fields the member chose to share.
 */
export async function getPublicMemberProfile(id: string): Promise<PublicMemberProfile | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data: v } = await supabase.from("public_profiles").select("id, display_name, avatar_src, role").eq("id", id).maybeSingle();
  if (!v) return null;
  const view = v as { id: string; display_name: string | null; avatar_src: string | null; role: string };
  const { data: extra } = await supabase.rpc("public_profile_extras", { target: id });
  const e = ((Array.isArray(extra) ? extra[0] : extra) ?? null) as { bio: string | null; interests: string[] | null; banner_src: string | null; banner_preset: string | null; banner_position: number | null; show_activity: boolean | null; visible: boolean | null } | null;
  return {
    id: view.id,
    displayName: view.display_name,
    avatarSrc: view.avatar_src,
    role: view.role === "trainer" || view.role === "admin" ? view.role : "user",
    bio: e?.bio ?? null,
    interests: e?.interests ?? [],
    bannerSrc: e?.banner_src ?? null,
    bannerPreset: e?.banner_preset ?? "deep",
    bannerPosition: e?.banner_position ?? 50,
    showActivity: Boolean(e?.show_activity),
    visible: e?.visible ?? false,
  };
}
