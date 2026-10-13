import { getDb, postColumns, workoutColumns, type AuthorRow, type PostRow, type WorkoutRow } from "@/lib/content/db";

/** Staff reads: RLS lets trainers and admins see drafts too. */
export async function listAllWorkouts(): Promise<WorkoutRow[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("workouts").select(workoutColumns).order("updated_at", { ascending: false });
  return (data ?? []) as unknown as WorkoutRow[];
}

export async function getWorkoutRow(id: string): Promise<WorkoutRow | null> {
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.from("workouts").select(workoutColumns).eq("id", id).maybeSingle();
  return (data as unknown as WorkoutRow | null) ?? null;
}

export async function listAllPosts(): Promise<PostRow[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("posts").select(postColumns).order("updated_at", { ascending: false });
  return (data ?? []) as unknown as PostRow[];
}

export async function getPostRow(id: string): Promise<PostRow | null> {
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.from("posts").select(postColumns).eq("id", id).maybeSingle();
  return (data as unknown as PostRow | null) ?? null;
}

export async function listAuthorRows(): Promise<AuthorRow[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("authors").select("id, user_id, name, role").order("created_at");
  return (data ?? []) as AuthorRow[];
}
