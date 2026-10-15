"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  activityLevels,
  bannerPresets,
  experienceLevels,
  fitnessGoals,
  interestOptions,
  notificationTypes,
  reminderKinds,
  type Reminder,
} from "./types";

export type ProfileErrorCode = "signedOut" | "notConfigured" | "invalid" | "generic" | "weakPassword" | "sameEmail";

export interface ProfileState {
  error?: ProfileErrorCode;
  ok?: boolean;
  /** Email change: a confirmation link was sent to the new address */
  checkEmail?: boolean;
}

async function me() {
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "notConfigured" as const };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "signedOut" as const };
  return { supabase, user };
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string): number | null => {
  const v = str(fd, k).replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const inList = <T extends string>(list: readonly T[], v: string): T | null => ((list as readonly string[]).includes(v) ? (v as T) : null);

function revalidateProfile() {
  revalidatePath("/profile", "layout");
  revalidatePath("/health");
  revalidatePath("/", "layout");
}

/** Name, bio, interests, avatar and banner */
export async function updateProfile(_prev: ProfileState, fd: FormData): Promise<ProfileState> {
  const ctx = await me();
  if ("error" in ctx) return { error: ctx.error };
  const displayName = str(fd, "display_name").slice(0, 60);
  const bio = str(fd, "bio").slice(0, 300);
  const interests = interestOptions.filter((i) => fd.get(`interest_${i}`) === "on");
  const bannerPreset = inList(bannerPresets, str(fd, "banner_preset")) ?? "deep";
  const bannerSrc = str(fd, "banner_src") || null;
  const avatarSrc = str(fd, "avatar_src") || null;
  const pos = Number.parseInt(str(fd, "banner_position"), 10);
  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      bio: bio || null,
      interests,
      banner_preset: bannerPreset,
      banner_src: bannerSrc,
      banner_position: Number.isFinite(pos) ? Math.min(100, Math.max(0, pos)) : 50,
      avatar_src: avatarSrc,
    })
    .eq("id", ctx.user.id);
  if (error) return { error: "generic" };
  revalidateProfile();
  redirect("/profile?saved=1");
}

/** Height, birth date, goal, activity level, experience */
export async function updateHealthProfile(_prev: ProfileState, fd: FormData): Promise<ProfileState> {
  const ctx = await me();
  if ("error" in ctx) return { error: ctx.error };
  const height = num(fd, "height_cm");
  if (height !== null && (height < 80 || height > 250)) return { error: "invalid" };
  const birth = str(fd, "birth_date") || null;
  const sessionsTarget = Number.parseInt(str(fd, "weekly_sessions_target"), 10);
  const minutesTarget = Number.parseInt(str(fd, "weekly_minutes_target"), 10);
  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      height_cm: height,
      birth_date: birth,
      weekly_sessions_target: Number.isFinite(sessionsTarget) ? Math.min(14, Math.max(1, sessionsTarget)) : 3,
      weekly_minutes_target: Number.isFinite(minutesTarget) ? Math.min(1500, Math.max(10, minutesTarget)) : 60,
      fitness_goal: inList(fitnessGoals, str(fd, "fitness_goal")),
      activity_level: inList(activityLevels, str(fd, "activity_level")),
      experience: inList(experienceLevels, str(fd, "experience")),
    })
    .eq("id", ctx.user.id);
  if (error) return { error: "generic" };
  revalidateProfile();
  return { ok: true };
}

/** One measurement per day; saving the same date again overwrites it */
export async function addMeasurement(_prev: ProfileState, fd: FormData): Promise<ProfileState> {
  const ctx = await me();
  if ("error" in ctx) return { error: ctx.error };
  const weight = num(fd, "weight_kg");
  const waist = num(fd, "waist_cm");
  if (weight === null && waist === null) return { error: "invalid" };
  if (weight !== null && (weight < 20 || weight > 400)) return { error: "invalid" };
  if (waist !== null && (waist < 30 || waist > 250)) return { error: "invalid" };
  const date = str(fd, "measured_on") || new Date().toISOString().slice(0, 10);
  const { error } = await ctx.supabase
    .from("measurements")
    .upsert({ user_id: ctx.user.id, measured_on: date, weight_kg: weight, waist_cm: waist, note: str(fd, "note").slice(0, 200) || null }, { onConflict: "user_id,measured_on" });
  if (error) return { error: "generic" };
  revalidateProfile();
  return { ok: true };
}

export async function deleteMeasurement(fd: FormData): Promise<void> {
  const ctx = await me();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.supabase.from("measurements").delete().eq("id", id).eq("user_id", ctx.user.id);
  revalidateProfile();
}

/** Manual "I did this session" mark */
export async function logActivity(fd: FormData): Promise<void> {
  const ctx = await me();
  if ("error" in ctx) return;
  const raw = str(fd, "item_type");
  const itemType = raw === "lesson" ? "lesson" : raw === "breath" ? "breath" : "workout";
  const itemId = str(fd, "item_id");
  if (!itemId) return;
  const duration = Number.parseInt(str(fd, "duration_min"), 10);
  await ctx.supabase.from("activity_log").insert({
    user_id: ctx.user.id,
    item_type: itemType,
    item_id: itemId,
    title: str(fd, "title").slice(0, 120) || null,
    duration_min: Number.isFinite(duration) && duration > 0 ? duration : null,
  });
  revalidateProfile();
  const back = str(fd, "back");
  redirect(back.startsWith("/") ? `${back}?logged=1` : "/profile/activity");
}

/** Finished breathing session: silent insert, no redirect (called from the timer after it ends) */
export async function logBreathSession(practiceId: string, title: string, minutes: number): Promise<boolean> {
  const ctx = await me();
  if ("error" in ctx) return false;
  const id = practiceId.replace(/[^a-z0-9-]/g, "").slice(0, 60);
  if (!id) return false;
  const duration = Math.min(60, Math.max(1, Math.round(minutes)));
  const { error } = await ctx.supabase.from("activity_log").insert({
    user_id: ctx.user.id,
    item_type: "breath",
    item_id: id,
    title: title.slice(0, 120) || null,
    duration_min: duration,
  });
  if (error) return false;
  revalidateProfile();
  return true;
}

export async function deleteActivity(fd: FormData): Promise<void> {
  const ctx = await me();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.supabase.from("activity_log").delete().eq("id", id).eq("user_id", ctx.user.id);
  revalidateProfile();
}

/** Notification toggles, reminders, privacy */
export async function updatePreferences(_prev: ProfileState, fd: FormData): Promise<ProfileState> {
  const ctx = await me();
  if ("error" in ctx) return { error: ctx.error };
  const prefs = Object.fromEntries(notificationTypes.map((t) => [t, fd.get(`notify_${t}`) === "on"]));
  const reminders: Reminder[] = reminderKinds
    .map((kind) => {
      const time = str(fd, `reminder_${kind}_time`);
      return { kind, time: /^\d{2}:\d{2}$/.test(time) ? time : "09:00", enabled: fd.get(`reminder_${kind}`) === "on" };
    })
    .filter((r) => r.enabled);
  const privacy = {
    profileVisible: fd.get("privacy_profileVisible") === "on",
    showActivity: fd.get("privacy_showActivity") === "on",
    allowComments: fd.get("privacy_allowComments") === "on",
  };
  const { error } = await ctx.supabase.from("profiles").update({ notification_prefs: prefs, reminders, privacy }).eq("id", ctx.user.id);
  if (error) return { error: "generic" };
  revalidateProfile();
  return { ok: true };
}

/** Account: email change sends a confirmation to the new address */
export async function changeEmail(_prev: ProfileState, fd: FormData): Promise<ProfileState> {
  const ctx = await me();
  if ("error" in ctx) return { error: ctx.error };
  const email = str(fd, "email");
  if (!email) return { error: "invalid" };
  if (email.toLowerCase() === (ctx.user.email ?? "").toLowerCase()) return { error: "sameEmail" };
  const { error } = await ctx.supabase.auth.updateUser({ email });
  if (error) return { error: "generic" };
  return { checkEmail: true };
}

export async function changePassword(_prev: ProfileState, fd: FormData): Promise<ProfileState> {
  const ctx = await me();
  if ("error" in ctx) return { error: ctx.error };
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "weakPassword" };
  const { error } = await ctx.supabase.auth.updateUser({ password });
  if (error) return { error: "generic" };
  return { ok: true };
}

/** Irreversible. The database function removes the auth user; everything else cascades. */
export async function deleteAccount(fd: FormData): Promise<void> {
  const ctx = await me();
  if ("error" in ctx) return;
  if (str(fd, "confirm") !== "DELETE") redirect("/profile/settings?error=confirm");
  const { error } = await ctx.supabase.rpc("delete_my_account");
  if (error) redirect("/profile/settings?error=delete");
  await ctx.supabase.auth.signOut();
  redirect("/?deleted=1");
}
