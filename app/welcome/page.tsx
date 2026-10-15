import { Onboarding } from "@/components/onboarding/Onboarding";
import { resolveVideo } from "@/lib/video/resolve";
import type { VideoSource } from "@/lib/content/types";

/**
 * Intro video: set NEXT_PUBLIC_INTRO_VIDEO_URL to a hosted mp4 (or leave empty for the illustration slide).
 * Uploading it through the admin panel arrives with app settings later.
 */
export default async function WelcomePage() {
  const url = process.env.NEXT_PUBLIC_INTRO_VIDEO_URL?.trim();
  const source: VideoSource = url ? { kind: "file", src: url } : null;
  const intro = await resolveVideo(source);
  return <Onboarding intro={intro} />;
}
