export const fitnessGoals = ["lose_weight", "gain_muscle", "maintain", "strength", "endurance", "activity"] as const;
export type FitnessGoal = (typeof fitnessGoals)[number];

export const activityLevels = ["low", "moderate", "high"] as const;
export type ActivityLevel = (typeof activityLevels)[number];

export const experienceLevels = ["beginner", "intermediate", "advanced"] as const;
export type ExperienceLevel = (typeof experienceLevels)[number];

export const interestOptions = ["yoga", "pilates", "stretching", "mobility", "back", "face", "skincare", "nutrition", "pregnancy"] as const;
export type Interest = (typeof interestOptions)[number];

export const bannerPresets = ["deep", "mint", "light"] as const;
export type BannerPreset = (typeof bannerPresets)[number];

export const notificationTypes = ["workouts", "reminders", "posts", "messages", "goals"] as const;
export type NotificationType = (typeof notificationTypes)[number];

export const reminderKinds = ["workout", "water", "rest", "sleep", "stretch"] as const;
export type ReminderKind = (typeof reminderKinds)[number];

export interface Reminder {
  kind: ReminderKind;
  /** "HH:MM" local time */
  time: string;
  enabled: boolean;
}

export interface Privacy {
  profileVisible: boolean;
  showActivity: boolean;
  allowComments: boolean;
}

export interface UserProfile {
  id: string;
  displayName: string | null;
  avatarSrc: string | null;
  bio: string | null;
  interests: Interest[];
  bannerSrc: string | null;
  bannerPreset: BannerPreset;
  bannerPosition: number;
  privacy: Privacy;
  notificationPrefs: Partial<Record<NotificationType, boolean>>;
  reminders: Reminder[];
  heightCm: number | null;
  birthDate: string | null;
  fitnessGoal: FitnessGoal | null;
  activityLevel: ActivityLevel | null;
  experience: ExperienceLevel | null;
  weeklySessionsTarget: number;
  weeklyMinutesTarget: number;
}

export interface Measurement {
  id: string;
  measuredOn: string;
  weightKg: number | null;
  waistCm: number | null;
  note: string | null;
}

export interface ActivityEntry {
  id: string;
  itemType: "workout" | "lesson";
  itemId: string;
  title: string | null;
  durationMin: number | null;
  completedAt: string;
}

export const defaultPrivacy: Privacy = { profileVisible: true, showActivity: false, allowComments: true };
export const defaultNotificationPrefs: Record<NotificationType, boolean> = { workouts: true, reminders: true, posts: true, messages: true, goals: true };
