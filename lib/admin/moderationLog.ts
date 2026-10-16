import type { SupabaseClient } from "@supabase/supabase-js";

export type ModerationAction =
  | "hide_post"
  | "unhide_post"
  | "hide_comment"
  | "unhide_comment"
  | "approve_content"
  | "reject_content"
  | "suspend_trainer"
  | "activate_trainer"
  | "verify_trainer"
  | "unverify_trainer"
  | "approve_application"
  | "reject_application"
  | "review_application"
  | "resolve_report"
  | "dismiss_report"
  | "clear_review";

/**
 * Records a moderation decision (admin only, enforced by RLS). Never blocks the action itself:
 * if the table is missing (migration 0025 not run) or the caller is not an admin, the insert is skipped.
 */
export async function logModeration(db: SupabaseClient, actorId: string, action: ModerationAction, targetType: string, targetId: string, note?: string | null): Promise<void> {
  try {
    await db.from("moderation_log").insert({ actor_id: actorId, action, target_type: targetType, target_id: targetId.slice(0, 80), note: note ? note.slice(0, 1000) : null });
  } catch {
    // logging must not break moderation
  }
}
