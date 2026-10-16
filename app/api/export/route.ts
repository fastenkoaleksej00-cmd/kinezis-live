import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * GDPR right of access / portability: the signed-in member downloads everything stored about them as JSON.
 * Every read goes through RLS with the member's own session, so only their own rows can come back.
 */
export async function GET() {
  const db = await createServerSupabase();
  if (!db) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "sign in first" }, { status: 401 });

  const own = (table: string, column = "user_id") => db.from(table).select("*").eq(column, user.id);
  const tables: Array<[string, ReturnType<typeof own>]> = [
    ["profile", db.from("profiles").select("*").eq("id", user.id)],
    ["measurements", own("measurements")],
    ["activity", own("activity_log")],
    ["favorites", own("favorites")],
    ["watch_progress", own("watch_progress")],
    ["lesson_progress", own("lesson_progress")],
    ["water", own("water_days")],
    ["wellbeing_checkins", own("wellbeing_checkins")],
    ["posts", own("posts")],
    ["comments", own("comments")],
    ["reactions", own("reactions")],
    ["conversations", own("conversations")],
    ["trainer_application", own("trainer_applications")],
    ["reports_sent", own("content_reports", "reporter_id")],
  ];
  const results = await Promise.all(tables.map(([, q]) => q));
  const data: Record<string, unknown> = {};
  tables.forEach(([name], i) => {
    // A table that does not exist yet (migration not run) is reported as empty, not as an error
    data[name] = results[i].error ? [] : (results[i].data ?? []);
  });
  const convIds = ((data.conversations as Array<{ id: string }>) ?? []).map((c) => c.id);
  if (convIds.length > 0) {
    const m = await db.from("messages").select("*").in("conversation_id", convIds).order("created_at");
    data.messages = m.error ? [] : (m.data ?? []);
  }

  const body = JSON.stringify({ exported_at: new Date().toISOString(), account: { id: user.id, email: user.email, created_at: user.created_at }, data }, null, 2);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="kinezis-live-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
