import { getDb, postColumns, rowToPost, type PostRow } from "@/lib/content/db";
import type { Post } from "@/lib/content/types";
import { getSocialCounts } from "@/lib/social/queries";
import { communityTopics, postTypes, type CommunityTopic, type PostType } from "./types";

export interface CommunityFilter {
  topic?: CommunityTopic;
  type?: PostType;
  tag?: string;
  q?: string;
  sort: "new" | "best";
}

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseCommunityFilter(sp: Params): CommunityFilter {
  const topic = one(sp.topic);
  const type = one(sp.type);
  const tag = one(sp.tag);
  const q = one(sp.q)?.trim().slice(0, 80);
  return {
    topic: (communityTopics as readonly string[]).includes(topic ?? "") ? (topic as CommunityTopic) : undefined,
    type: (postTypes as readonly string[]).includes(type ?? "") ? (type as PostType) : undefined,
    tag: tag && /^[\p{L}\p{N}-]{2,24}$/u.test(tag) ? tag.toLowerCase() : undefined,
    q: q || undefined,
    sort: one(sp.sort) === "best" ? "best" : "new",
  };
}

/** Member posts with filters. "best" = most helpful votes (likes) among the last 100 matches. */
export async function listCommunityPosts(f: CommunityFilter): Promise<Post[]> {
  const db = await getDb();
  if (!db) return [];
  let q = db.from("posts").select(postColumns).not("user_id", "is", null).eq("published", true).order("published_at", { ascending: false }).limit(f.sort === "best" ? 100 : 50);
  if (f.topic) q = f.topic === "general" ? q.or("topic.eq.general,topic.is.null") : q.eq("topic", f.topic);
  if (f.type) q = q.eq("post_type", f.type);
  if (f.tag) q = q.contains("tags", [f.tag]);
  if (f.q) q = q.textSearch("search", f.q, { type: "websearch", config: "simple" });
  const { data, error } = await q;
  if (error || !data) return [];
  const posts = (data as unknown as PostRow[]).map(rowToPost);
  if (f.sort === "new") return posts;
  const counts = await getSocialCounts("post", posts.map((p) => p.id));
  return posts.sort((a, b) => (counts[b.id]?.likes ?? 0) - (counts[a.id]?.likes ?? 0) || (a.publishedAt < b.publishedAt ? 1 : -1)).slice(0, 50);
}

/** Admin: member posts flagged for review */
export async function listFlaggedPosts(): Promise<Post[]> {
  const db = await getDb();
  if (!db) return [];
  const { data, error } = await db.from("posts").select(postColumns).eq("needs_review", true).order("created_at", { ascending: false }).limit(100);
  if (error || !data) return [];
  return (data as unknown as PostRow[]).map(rowToPost);
}
