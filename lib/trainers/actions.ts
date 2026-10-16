"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { categoryIds } from "@/lib/content/types";
import { createServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { reportReasons, type ReportReason, type ReportTarget } from "./types";

export type TrainerErrorCode = "signedOut" | "notConfigured" | "forbidden" | "nameRequired" | "consentRequired" | "invalid" | "generic";
export interface TrainerState {
  error?: TrainerErrorCode;
  ok?: boolean;
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const lines = (fd: FormData, key: string) =>
  str(fd, key)
    .split(/\r?\n|,/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 10);
const safeUrl = (u: string) => /^https?:\/\/[^\s]{3,200}$/.test(u);

async function me() {
  const user = await getSessionUser();
  if (!user) return { error: "signedOut" as const };
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "notConfigured" as const };
  return { user, supabase };
}

async function admin() {
  const ctx = await me();
  if ("error" in ctx) return ctx;
  if (ctx.user.role !== "admin") return { error: "forbidden" as const };
  return ctx;
}

/* ----------------------------------------------------------------------------
   Member: trainer application (draft or submit)
---------------------------------------------------------------------------- */

export async function saveTrainerApplication(_prev: TrainerState, fd: FormData): Promise<TrainerState> {
  const ctx = await me();
  if ("error" in ctx) return { error: ctx.error };
  const submit = str(fd, "mode") === "submit";
  const fullName = str(fd, "full_name").slice(0, 80);
  const consent = fd.get("consent") === "on";
  if (submit && !fullName) return { error: "nameRequired" };
  if (submit && !consent) return { error: "consentRequired" };
  const years = Number.parseInt(str(fd, "experience_years"), 10);
  const links = lines(fd, "links").filter(safeUrl);
  const documents = lines(fd, "documents").filter((p) => p.startsWith(`${ctx.user.id}/`));
  const row = {
    user_id: ctx.user.id,
    full_name: fullName,
    photo_src: str(fd, "photo_src") || null,
    specialties: categoryIds.filter((c) => fd.get(`spec_${c}`) === "on") as string[],
    bio: str(fd, "bio").slice(0, 1500),
    qualifications: str(fd, "qualifications").slice(0, 1500),
    experience_years: Number.isFinite(years) ? Math.min(70, Math.max(0, years)) : null,
    links,
    documents,
    consent,
    status: submit ? "submitted" : "draft",
    submitted_at: submit ? new Date().toISOString() : null,
    admin_note: null,
  };
  const { error } = await ctx.supabase.from("trainer_applications").upsert(row, { onConflict: "user_id" });
  if (error) return { error: /row-level security/i.test(error.message) ? "forbidden" : "generic" };
  revalidatePath("/profile", "layout");
  revalidatePath("/admin/applications");
  return { ok: true };
}

/* ----------------------------------------------------------------------------
   Admin: decide applications, trainer status, verification, review queue
---------------------------------------------------------------------------- */

export async function decideApplication(fd: FormData): Promise<void> {
  const ctx = await admin();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  const decision = str(fd, "decision");
  if (!id) return;
  if (decision === "approve") {
    await ctx.supabase.rpc("approve_trainer_application", { app_id: id, author_slug: str(fd, "author_slug").slice(0, 40) });
  } else if (decision === "reject") {
    await ctx.supabase.rpc("reject_trainer_application", { app_id: id, note: str(fd, "note").slice(0, 1000) });
  } else if (decision === "review") {
    await ctx.supabase.from("trainer_applications").update({ status: "review" }).eq("id", id);
  }
  revalidatePath("/", "layout");
  redirect("/admin/applications?decided=1");
}

export async function setAuthorStatus(fd: FormData): Promise<void> {
  const ctx = await admin();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  const status = str(fd, "status") === "suspended" ? "suspended" : "active";
  if (id) await ctx.supabase.rpc("set_author_status", { aid: id, new_status: status });
  revalidatePath("/", "layout");
  redirect("/admin/trainers?saved=1");
}

export async function setAuthorVerified(fd: FormData): Promise<void> {
  const ctx = await admin();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.supabase.from("authors").update({ verified: str(fd, "verified") === "true" }).eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/trainers?saved=1");
}

export async function reviewContent(fd: FormData): Promise<void> {
  const ctx = await admin();
  if ("error" in ctx) return;
  const table = str(fd, "table") === "courses" ? "courses" : "workouts";
  const id = str(fd, "id");
  const decision = str(fd, "decision") === "approve" ? "approved" : "rejected";
  if (id) await ctx.supabase.from(table).update({ review_status: decision, review_note: decision === "rejected" ? str(fd, "note").slice(0, 1000) || null : null }).eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/review?decided=1");
}

/* ----------------------------------------------------------------------------
   Trainer: own author card
---------------------------------------------------------------------------- */

export async function updateMyAuthor(_prev: TrainerState, fd: FormData): Promise<TrainerState> {
  const ctx = await me();
  if ("error" in ctx) return { error: ctx.error };
  if (!ctx.user.authorId) return { error: "forbidden" };
  const name = str(fd, "name").slice(0, 80);
  if (!name) return { error: "nameRequired" };
  const bio: Record<string, string> = {};
  for (const l of ["en", "uk", "de", "ru"]) {
    const v = str(fd, `bio_${l}`).slice(0, 1500);
    if (v) bio[l] = v;
  }
  if (!bio.en) bio.en = bio.uk ?? bio.ru ?? bio.de ?? "";
  const years = Number.parseInt(str(fd, "experience_years"), 10);
  const instagram = str(fd, "instagram");
  const preset = str(fd, "cover_preset");
  const { error } = await ctx.supabase
    .from("authors")
    .update({
      name,
      bio: bio.en ? bio : null,
      specialties: categoryIds.filter((c) => fd.get(`spec_${c}`) === "on"),
      avatar_src: str(fd, "avatar_src") || null,
      instagram: instagram && safeUrl(instagram) ? instagram : null,
      qualifications: str(fd, "qualifications").slice(0, 1500) || null,
      experience_years: Number.isFinite(years) ? Math.min(70, Math.max(0, years)) : null,
      links: lines(fd, "links").filter(safeUrl),
      cover_preset: ["mint", "ocean", "lavender", "sunset", "forest", "midnight"].includes(preset) ? preset : "midnight",
      booking_url: /^https:\/\/\S{3,300}$/.test(str(fd, "booking_url")) ? str(fd, "booking_url") : null,
    })
    .eq("id", ctx.user.authorId);
  if (error) return { error: "generic" };
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ----------------------------------------------------------------------------
   Members: reports; admin: resolve
---------------------------------------------------------------------------- */

export async function submitReport(_prev: TrainerState, fd: FormData): Promise<TrainerState> {
  const ctx = await me();
  if ("error" in ctx) return { error: ctx.error };
  const targetType = str(fd, "target_type") as ReportTarget;
  const targetId = str(fd, "target_id").slice(0, 80);
  const reason = str(fd, "reason") as ReportReason;
  if (!["workout", "post", "course", "trainer", "comment"].includes(targetType) || !targetId || !reportReasons.includes(reason)) return { error: "invalid" };
  const { error } = await ctx.supabase.from("content_reports").insert({ reporter_id: ctx.user.id, target_type: targetType, target_id: targetId, reason, details: str(fd, "details").slice(0, 1000) || null });
  if (error) return { error: "generic" };
  return { ok: true };
}

export async function resolveReport(fd: FormData): Promise<void> {
  const ctx = await admin();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  const status = str(fd, "status") === "dismissed" ? "dismissed" : "resolved";
  if (id) await ctx.supabase.from("content_reports").update({ status, resolution: str(fd, "resolution").slice(0, 1000) || null, decided_at: new Date().toISOString() }).eq("id", id);
  // Optional moderation action on the target: hide a post, reject a workout/course
  const action = str(fd, "action");
  const targetType = str(fd, "target_type");
  const targetId = str(fd, "target_id");
  if (action === "hide" && targetId) {
    if (targetType === "post") await ctx.supabase.from("posts").update({ hidden: true }).eq("id", targetId);
    if (targetType === "workout") await ctx.supabase.from("workouts").update({ review_status: "rejected", review_note: "report" }).eq("id", targetId);
    if (targetType === "course") await ctx.supabase.from("courses").update({ review_status: "rejected", review_note: "report" }).eq("id", targetId);
    if (targetType === "comment") await ctx.supabase.from("comments").update({ hidden: true }).eq("id", targetId);
  }
  revalidatePath("/", "layout");
  redirect("/admin/reports?decided=1");
}
