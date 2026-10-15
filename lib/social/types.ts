export type ReactionTarget = "post" | "workout" | "course" | "meal";
export type CommentTarget = "post" | "workout";

export interface SocialCounts {
  likes: number;
  comments: number;
  /** Whether the current user liked it */
  liked: boolean;
}

export interface CommentView {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
  hidden: boolean;
  authorName: string | null;
  authorAvatar: string | null;
  authorRole: "user" | "trainer" | "admin";
  mine: boolean;
}
