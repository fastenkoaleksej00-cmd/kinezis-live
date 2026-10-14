"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

/** Records that a signed-in user wants to hear when Premium launches. No charge, no plan change. */
export async function setPremiumInterest(interested: boolean): Promise<{ ok: boolean }> {
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  const { error } = await supabase.from("profiles").update({ premium_interest: interested }).eq("id", user.id);
  if (error) return { ok: false };
  revalidatePath("/premium");
  revalidatePath("/profile");
  return { ok: true };
}
