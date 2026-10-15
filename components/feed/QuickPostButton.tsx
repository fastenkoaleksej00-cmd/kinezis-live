import { getSessionUser, isStaff } from "@/lib/supabase/server";
import { QuickAddMenu } from "./QuickAddMenu";

/** Server wrapper: decides who sees the "+" and whether it offers the workout option. */
export async function QuickPostButton() {
  const user = await getSessionUser();
  if (!user) return null;
  return <QuickAddMenu staff={isStaff(user)} />;
}
