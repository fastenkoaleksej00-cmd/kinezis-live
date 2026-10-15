"use server";

import { createServerSupabase, getSessionUser, isStaff } from "@/lib/supabase/server";

/** Marks the thread read for the current side (member or staff). */
export async function markRead(conversationId: string): Promise<void> {
  const supabase = await createServerSupabase();
  if (!supabase || !conversationId) return;
  const user = await getSessionUser();
  if (!user) return;
  const field = isStaff(user) ? "last_read_by_staff_at" : "last_read_by_user_at";
  await supabase.from("conversations").update({ [field]: new Date().toISOString() }).eq("id", conversationId);
}
