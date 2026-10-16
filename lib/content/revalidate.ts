import { revalidateTag } from "next/cache";
import { contentTags } from "@/lib/supabase/public";

/** Drop cached public content after an admin or trainer change, so the library updates immediately. */
export function revalidatePublicContent(): void {
  for (const tag of contentTags) revalidateTag(tag);
}
