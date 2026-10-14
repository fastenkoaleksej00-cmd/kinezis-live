import type { PlayableVideo, VideoSource } from "@/lib/content/types";
import { createServerSupabase } from "@/lib/supabase/server";

/** Signed playback links live this long; a page reload issues a fresh one. */
const SIGNED_URL_SECONDS = 60 * 60 * 3;

/**
 * Video host adapter. Turns a stored VideoSource into something the HTML5 player can open.
 * Today: direct files, HLS links and Supabase Storage. Switching to Cloudflare Stream or Mux
 * later means adding one more `kind` here; screens and the database stay the same.
 */
export async function resolveVideo(source: VideoSource): Promise<PlayableVideo | null> {
  if (!source) return null;
  if (source.kind === "file" || source.kind === "hls") return { src: source.src, poster: source.poster };

  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(source.bucket).createSignedUrl(source.path, SIGNED_URL_SECONDS);
  if (error || !data?.signedUrl) return null;
  return { src: data.signedUrl, poster: source.poster };
}
