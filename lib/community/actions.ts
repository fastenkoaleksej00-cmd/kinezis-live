"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { logModeration } from "@/lib/admin/moderationLog";

/** Verified trainer marks a member post as checked by a specialist (or removes their own mark). */
export async function endorsePost(fd: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user?.authorId) return;
  const db = await createServerSupabase();
  if (!db) return;
  const id = String(fd.get("id") ?? "");
  const on = String(fd.get("on") ?? "") === "true";
  if (id) await db.rpc("endorse_post", { pid: id, on_off: on });
  revalidatePath(`/posts/${id}`);
  revalidatePath("/community");
}

/** Admin clears the moderation flag after checking the post */
export async function clearReview(fd: FormData): Promise<void> {
  const user = await getSessionUser();
  if (user?.role !== "admin") return;
  const db = await createServerSupabase();
  if (!db) return;
  const id = String(fd.get("id") ?? "");
  if (id) {
    await db.from("posts").update({ needs_review: false, review_reason: null }).eq("id", id);
    await logModeration(db, user.id, "clear_review", "post", id);
  }
  revalidatePath("/admin/community");
}
