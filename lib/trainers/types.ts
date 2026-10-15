/** Plain module (no server imports) so client components can share these. */
export type ReportTarget = "workout" | "post" | "course" | "trainer" | "comment";
export type ReportReason = "unsafe" | "medical" | "misleading" | "inappropriate" | "copyright" | "other";
export const reportReasons: ReportReason[] = ["unsafe", "medical", "misleading", "inappropriate", "copyright", "other"];
