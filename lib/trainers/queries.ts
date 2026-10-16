import { cache } from "react";
import { authorColumns, courseColumns, getDb, workoutColumns, type AuthorRow, type CourseRow, type WorkoutRow } from "@/lib/content/db";
import { createServerSupabase, getSessionUser } from "@/lib/supabase/server";

export type ApplicationStatus = "draft" | "submitted" | "review" | "approved" | "rejected";

export interface TrainerApplication {
  id: string;
  userId: string;
  fullName: string;
  photoSrc: string | null;
  specialties: string[];
  bio: string;
  qualifications: string;
  experienceYears: number | null;
  links: string[];
  documents: string[];
  consent: boolean;
  status: ApplicationStatus;
  adminNote: string | null;
  submittedAt: string | null;
  decidedAt: string | null;
  updatedAt: string;
}

interface ApplicationRow {
  id: string;
  user_id: string;
  full_name: string;
  photo_src: string | null;
  specialties: string[] | null;
  bio: string;
  qualifications: string;
  experience_years: number | null;
  links: string[] | null;
  documents: string[] | null;
  consent: boolean;
  status: ApplicationStatus;
  admin_note: string | null;
  submitted_at: string | null;
  decided_at: string | null;
  updated_at: string;
}

const appColumns = "id, user_id, full_name, photo_src, specialties, bio, qualifications, experience_years, links, documents, consent, status, admin_note, submitted_at, decided_at, updated_at";

function rowToApplication(r: ApplicationRow): TrainerApplication {
  return {
    id: r.id,
    userId: r.user_id,
    fullName: r.full_name,
    photoSrc: r.photo_src,
    specialties: r.specialties ?? [],
    bio: r.bio,
    qualifications: r.qualifications,
    experienceYears: r.experience_years,
    links: r.links ?? [],
    documents: r.documents ?? [],
    consent: r.consent,
    status: r.status,
    adminNote: r.admin_note,
    submittedAt: r.submitted_at,
    decidedAt: r.decided_at,
    updatedAt: r.updated_at,
  };
}

/** The signed-in member's own application, if any (RLS: own rows only). */
export const getMyApplication = cache(async (): Promise<TrainerApplication | null> => {
  const db = await createServerSupabase();
  const user = await getSessionUser();
  if (!db || !user) return null;
  const { data } = await db.from("trainer_applications").select(appColumns).eq("user_id", user.id).maybeSingle();
  return data ? rowToApplication(data as ApplicationRow) : null;
});

/** Admin: every application, newest first (RLS returns nothing for non-admins). */
export async function listApplications(status?: ApplicationStatus): Promise<TrainerApplication[]> {
  const db = await getDb();
  if (!db) return [];
  let q = db.from("trainer_applications").select(appColumns).order("updated_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data } = await q;
  return ((data ?? []) as ApplicationRow[]).map(rowToApplication);
}

export async function getApplication(id: string): Promise<TrainerApplication | null> {
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.from("trainer_applications").select(appColumns).eq("id", id).maybeSingle();
  return data ? rowToApplication(data as ApplicationRow) : null;
}

/** Admin: author cards including suspended ones. */
export async function listAuthorsAdmin(): Promise<AuthorRow[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("authors").select(authorColumns).order("created_at");
  return (data ?? []) as AuthorRow[];
}

export async function getMyAuthorRow(): Promise<AuthorRow | null> {
  const db = await createServerSupabase();
  const user = await getSessionUser();
  if (!db || !user) return null;
  const { data } = await db.from("authors").select(authorColumns).eq("user_id", user.id).maybeSingle();
  return (data as AuthorRow | null) ?? null;
}

/** Admin: content waiting for review. */
export async function listPendingContent(): Promise<{ workouts: WorkoutRow[]; courses: CourseRow[] }> {
  const db = await getDb();
  if (!db) return { workouts: [], courses: [] };
  const [w, c] = await Promise.all([
    db.from("workouts").select(workoutColumns).eq("review_status", "pending").order("updated_at", { ascending: false }),
    db.from("courses").select(courseColumns).eq("review_status", "pending").order("updated_at", { ascending: false }),
  ]);
  return { workouts: (w.data ?? []) as unknown as WorkoutRow[], courses: (c.data ?? []) as unknown as CourseRow[] };
}

import type { ReportReason, ReportTarget } from "./types";
export type { ReportReason, ReportTarget } from "./types";

export interface ContentReport {
  id: string;
  reporterId: string;
  targetType: ReportTarget;
  targetId: string;
  reason: ReportReason;
  details: string | null;
  status: "open" | "resolved" | "dismissed";
  resolution: string | null;
  createdAt: string;
}

interface ReportRow {
  id: string;
  reporter_id: string;
  target_type: ReportTarget;
  target_id: string;
  reason: ReportReason;
  details: string | null;
  status: ContentReport["status"];
  resolution: string | null;
  created_at: string;
}

export async function listReports(status: ContentReport["status"] | "all" = "open"): Promise<ContentReport[]> {
  const db = await getDb();
  if (!db) return [];
  let q = db.from("content_reports").select("id, reporter_id, target_type, target_id, reason, details, status, resolution, created_at").order("created_at", { ascending: false });
  if (status !== "all") q = q.eq("status", status);
  const { data } = await q;
  return ((data ?? []) as ReportRow[]).map((r) => ({ id: r.id, reporterId: r.reporter_id, targetType: r.target_type, targetId: r.target_id, reason: r.reason, details: r.details, status: r.status, resolution: r.resolution, createdAt: r.created_at }));
}

export interface AuthorStats {
  completions: number;
  likes: number;
  published: number;
}

/** Aggregates only; the function refuses other trainers' ids. */
export async function getAuthorStats(authorId: string): Promise<AuthorStats | null> {
  const db = await createServerSupabase();
  if (!db) return null;
  const { data, error } = await db.rpc("author_stats", { aid: authorId });
  if (error || !data) return null;
  const row = (Array.isArray(data) ? data[0] : data) as { completions: number | string; likes: number | string; published: number | string } | undefined;
  if (!row) return null;
  return { completions: Number(row.completions ?? 0), likes: Number(row.likes ?? 0), published: Number(row.published ?? 0) };
}

export interface AdminOverview {
  members: number;
  new7d: number;
  active7d: number;
  posts7d: number;
  openReports: number;
  pendingReview: number;
}

/** Admin home numbers (migration 0026). Null when the function is missing or the caller is not an admin. */
export async function getAdminOverview(): Promise<AdminOverview | null> {
  const db = await createServerSupabase();
  if (!db) return null;
  const { data, error } = await db.rpc("admin_overview");
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, number | string> | undefined;
  if (error || !row) return null;
  const n = (k: string) => Number(row[k] ?? 0);
  return { members: n("members"), new7d: n("new_7d"), active7d: n("active_7d"), posts7d: n("posts_7d"), openReports: n("open_reports"), pendingReview: n("pending_review") };
}
