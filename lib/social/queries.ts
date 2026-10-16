import { createServerSupabase, getAuthUser } from "@/lib/supabase/server";
import type { CommentTarget, CommentView, ReactionTarget, SocialCounts } from "./types";

/** Likes, comment counts and the viewer's own like for many targets at once (one query each). */
export async function getSocialCounts(targetType: ReactionTarget, ids: string[]): Promise<Record<string, SocialCounts>> {
  const out: Record<string, SocialCounts> = {};
  for (const id of ids) out[id] = { likes: 0, comments: 0, liked: false };
  if (ids.length === 0) return out;
  const supabase = await createServerSupabase();
  if (!supabase) return out;
  const [{ data: likes }, { data: comments }, authUser] = await Promise.all([
    supabase.from("reaction_counts").select("target_id, likes").eq("target_type", targetType).in("target_id", ids),
    supabase.from("comment_counts").select("target_id, comments").eq("target_type", targetType).in("target_id", ids),
    getAuthUser(),
  ]);
  for (const r of (likes ?? []) as Array<{ target_id: string; likes: number }>) if (out[r.target_id]) out[r.target_id].likes = r.likes;
  for (const r of (comments ?? []) as Array<{ target_id: string; comments: number }>) if (out[r.target_id]) out[r.target_id].comments = r.comments;
  const user = authUser;
  if (user) {
    const { data: mine } = await supabase.from("reactions").select("target_id").eq("target_type", targetType).eq("user_id", user.id).in("target_id", ids);
    for (const r of (mine ?? []) as Array<{ target_id: string }>) if (out[r.target_id]) out[r.target_id].liked = true;
  }
  return out;
}

export async function listComments(targetType: CommentTarget, targetId: string): Promise<CommentView[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const [{ data }, authUser] = await Promise.all([
    supabase.from("comments").select("id, user_id, body, created_at, hidden").eq("target_type", targetType).eq("target_id", targetId).order("created_at", { ascending: true }).limit(200),
    getAuthUser(),
  ]);
  const rows = (data ?? []) as Array<{ id: string; user_id: string; body: string; created_at: string; hidden: boolean }>;
  if (rows.length === 0) return [];
  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await supabase.from("public_profiles").select("id, display_name, avatar_src, role").in("id", userIds);
  const byId = new Map(((profiles ?? []) as Array<{ id: string; display_name: string | null; avatar_src: string | null; role: string }>).map((p) => [p.id, p]));
  const me = authUser?.id;
  return rows.map((r) => {
    const p = byId.get(r.user_id);
    const role = p?.role === "trainer" || p?.role === "admin" ? p.role : "user";
    return { id: r.id, userId: r.user_id, body: r.body, createdAt: r.created_at, hidden: r.hidden, authorName: p?.display_name ?? null, authorAvatar: p?.avatar_src ?? null, authorRole: role, mine: me === r.user_id };
  });
}

export interface ModerationComment extends CommentView {
  targetType: CommentTarget;
  targetId: string;
}

/** Staff: latest comments across the app, including hidden ones. */
export async function listRecentComments(limit = 100): Promise<ModerationComment[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("comments").select("id, user_id, target_type, target_id, body, created_at, hidden").order("created_at", { ascending: false }).limit(limit);
  const rows = (data ?? []) as Array<{ id: string; user_id: string; target_type: CommentTarget; target_id: string; body: string; created_at: string; hidden: boolean }>;
  if (rows.length === 0) return [];
  const { data: profiles } = await supabase.from("public_profiles").select("id, display_name, avatar_src, role").in("id", [...new Set(rows.map((r) => r.user_id))]);
  const byId = new Map(((profiles ?? []) as Array<{ id: string; display_name: string | null; avatar_src: string | null; role: string }>).map((p) => [p.id, p]));
  return rows.map((r) => {
    const p = byId.get(r.user_id);
    const role = p?.role === "trainer" || p?.role === "admin" ? p.role : "user";
    return { id: r.id, userId: r.user_id, targetType: r.target_type, targetId: r.target_id, body: r.body, createdAt: r.created_at, hidden: r.hidden, authorName: p?.display_name ?? null, authorAvatar: p?.avatar_src ?? null, authorRole: role, mine: false };
  });
}
