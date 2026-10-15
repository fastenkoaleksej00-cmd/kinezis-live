import { normalizeBanner } from "./banner";
import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  activityLevels,
  primaryGoals,
  defaultNotificationPrefs,
  defaultPrivacy,
  experienceLevels,
  fitnessGoals,
  interestOptions,
  type ActivityEntry,
  type Measurement,
  type NotificationType,
  type Reminder,
  type UserProfile,
} from "./types";

interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_src: string | null;
  bio: string | null;
  interests: string[] | null;
  banner_src: string | null;
  banner_preset: string | null;
  banner_position: number | null;
  privacy: Partial<UserProfile["privacy"]> | null;
  notification_prefs: Partial<Record<NotificationType, boolean>> | null;
  reminders: Reminder[] | null;
  height_cm: number | null;
  birth_date: string | null;
  fitness_goal: string | null;
  activity_level: string | null;
  experience: string | null;
  weekly_sessions_target: number | null;
  weekly_minutes_target: number | null;
  primary_goal?: string | null;
  target_weight_kg?: number | string | null;
}

const inList = <T extends string>(list: readonly T[], v: string | null | undefined): T | null => (v && (list as readonly string[]).includes(v) ? (v as T) : null);

/** The signed-in user's full profile (private fields included). Null when signed out. */
export const getMyProfile = cache(async (): Promise<UserProfile | null> => {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  const r = data as ProfileRow | null;
  if (!r) return null;
  return {
    id: r.id,
    displayName: r.display_name,
    avatarSrc: r.avatar_src,
    bio: r.bio,
    interests: (r.interests ?? []).filter((i): i is UserProfile["interests"][number] => (interestOptions as readonly string[]).includes(i)),
    bannerSrc: r.banner_src,
    bannerPreset: normalizeBanner(r.banner_preset),
    bannerPosition: typeof r.banner_position === "number" ? Math.min(100, Math.max(0, r.banner_position)) : 50,
    privacy: { ...defaultPrivacy, ...(r.privacy ?? {}) },
    notificationPrefs: { ...defaultNotificationPrefs, ...(r.notification_prefs ?? {}) },
    reminders: Array.isArray(r.reminders) ? r.reminders : [],
    heightCm: r.height_cm !== null ? Number(r.height_cm) : null,
    birthDate: r.birth_date,
    fitnessGoal: inList(fitnessGoals, r.fitness_goal),
    activityLevel: inList(activityLevels, r.activity_level),
    experience: inList(experienceLevels, r.experience),
    weeklySessionsTarget: r.weekly_sessions_target ?? 3,
    weeklyMinutesTarget: r.weekly_minutes_target ?? 60,
    primaryGoal: inList(primaryGoals, r.primary_goal ?? null),
    targetWeightKg: r.target_weight_kg !== null && r.target_weight_kg !== undefined ? Number(r.target_weight_kg) : null,
  };
});

export const listMeasurements = cache(async (): Promise<Measurement[]> => {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("measurements").select("id, measured_on, weight_kg, waist_cm, note").order("measured_on", { ascending: true });
  return ((data ?? []) as Array<{ id: string; measured_on: string; weight_kg: number | null; waist_cm: number | null; note: string | null }>).map((m) => ({
    id: m.id,
    measuredOn: m.measured_on,
    weightKg: m.weight_kg !== null ? Number(m.weight_kg) : null,
    waistCm: m.waist_cm !== null ? Number(m.waist_cm) : null,
    note: m.note,
  }));
});

export const listActivity = cache(async (limit = 365): Promise<ActivityEntry[]> => {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("activity_log").select("id, item_type, item_id, title, duration_min, completed_at").order("completed_at", { ascending: false }).limit(limit);
  return ((data ?? []) as Array<{ id: string; item_type: "workout" | "lesson" | "breath"; item_id: string; title: string | null; duration_min: number | null; completed_at: string }>).map((a) => ({
    id: a.id,
    itemType: a.item_type,
    itemId: a.item_id,
    title: a.title,
    durationMin: a.duration_min,
    completedAt: a.completed_at,
  }));
});
