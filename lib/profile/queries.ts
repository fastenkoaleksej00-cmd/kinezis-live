import { createServerSupabase } from "@/lib/supabase/server";
import {
  activityLevels,
  bannerPresets,
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
}

const inList = <T extends string>(list: readonly T[], v: string | null | undefined): T | null => (v && (list as readonly string[]).includes(v) ? (v as T) : null);

/** The signed-in user's full profile (private fields included). Null when signed out. */
export async function getMyProfile(): Promise<UserProfile | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_src, bio, interests, banner_src, banner_preset, banner_position, privacy, notification_prefs, reminders, height_cm, birth_date, fitness_goal, activity_level, experience")
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
    bannerPreset: inList(bannerPresets, r.banner_preset) ?? "deep",
    bannerPosition: typeof r.banner_position === "number" ? Math.min(100, Math.max(0, r.banner_position)) : 50,
    privacy: { ...defaultPrivacy, ...(r.privacy ?? {}) },
    notificationPrefs: { ...defaultNotificationPrefs, ...(r.notification_prefs ?? {}) },
    reminders: Array.isArray(r.reminders) ? r.reminders : [],
    heightCm: r.height_cm !== null ? Number(r.height_cm) : null,
    birthDate: r.birth_date,
    fitnessGoal: inList(fitnessGoals, r.fitness_goal),
    activityLevel: inList(activityLevels, r.activity_level),
    experience: inList(experienceLevels, r.experience),
  };
}

export async function listMeasurements(): Promise<Measurement[]> {
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
}

export async function listActivity(limit = 365): Promise<ActivityEntry[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("activity_log").select("id, item_type, item_id, title, duration_min, completed_at").order("completed_at", { ascending: false }).limit(limit);
  return ((data ?? []) as Array<{ id: string; item_type: "workout" | "lesson"; item_id: string; title: string | null; duration_min: number | null; completed_at: string }>).map((a) => ({
    id: a.id,
    itemType: a.item_type,
    itemId: a.item_id,
    title: a.title,
    durationMin: a.duration_min,
    completedAt: a.completed_at,
  }));
}
