"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, getSessionUser, isStaff } from "@/lib/supabase/server";
import type { CommentTarget, ReactionTarget } from "./types";

const reactionTargets: ReactionTarget[] = ["post", "workout", "course", "meal"];
const commentTargets: CommentTarget[] = ["post", "workout"];

async function me() {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

export interface LikeResult {
  liked: boolean;
  signedOut?: boolean;
}

/** Idempotent toggle: inserts or deletes the viewer's like. */
export async function toggleLike(targetType: ReactionTarget, targetId: string): Promise<LikeResult> {
  if (!reactionTargets.includes(targetType) || !targetId) return { liked: false };
  const ctx = await me();
  if (!ctx) return { liked: false, signedOut: true };
  const { data: existing } = await ctx.supabase.from("reactions").select("target_id").eq("user_id", ctx.user.id).eq("target_type", targetType).eq("target_id", targetId).eq("kind", "like").maybeSingle();
  if (existing) {
    await ctx.supabase.from("reactions").delete().eq("user_id", ctx.user.id).eq("target_type", targetType).eq("target_id", targetId).eq("kind", "like");
    return { liked: false };
  }
  await ctx.supabase.from("reactions").insert({ user_id: ctx.user.id, target_type: targetType, target_id: targetId, kind: "like" });
  return { liked: true };
}

export interface CommentState {
  error?: "signedOut" | "empty" | "tooLong" | "disabled" | "generic" | "rateLimit";
  ok?: boolean;
}

export async function addComment(_prev: CommentState, fd: FormData): Promise<CommentState> {
  const targetType = String(fd.get("target_type") ?? "") as CommentTarget;
  const targetId = String(fd.get("target_id") ?? "").trim();
  const body = String(fd.get("body") ?? "").trim();
  const path = String(fd.get("path") ?? "/");
  if (!commentTargets.includes(targetType) || !targetId) return { error: "generic" };
  if (!body) return { error: "empty" };
  if (body.length > 1000) return { error: "tooLong" };
  const ctx = await me();
  if (!ctx) return { error: "signedOut" };
  const { error } = await ctx.supabase.from("comments").insert({ user_id: ctx.user.id, target_type: targetType, target_id: targetId, body });
  if (error) return { error: /rate_limit/.test(error.message) ? "rateLimit" : "generic" };
  revalidatePath(path);
  return { ok: true };
}

/** Own comment: delete. Staff: hide (keeps a record) or delete. */
export async function deleteComment(fd: FormData): Promise<void> {
  const id = String(fd.get("id") ?? "");
  const path = String(fd.get("path") ?? "/");
  const ctx = await me();
  if (!ctx || !id) return;
  await ctx.supabase.from("comments").delete().eq("id", id);
  revalidatePath(path);
}

export async function setCommentHidden(fd: FormData): Promise<void> {
  const id = String(fd.get("id") ?? "");
  const hidden = String(fd.get("hidden") ?? "") === "true";
  const path = String(fd.get("path") ?? "/admin/comments");
  const user = await getSessionUser();
  if (!isStaff(user) || !id) return;
  const supabase = await createServerSupabase();
  if (!supabase) return;
  await supabase.from("comments").update({ hidden }).eq("id", id);
  revalidatePath(path);
  revalidatePath("/", "layout");
}
