/** YouTube helpers. Videos stay on YouTube; we only store the video id and show the official player. */
export const YOUTUBE_CHANNEL = { id: "UCB-_v2Kn8PhHX2IcNHdgpMg", handle: "@julruz", url: "https://www.youtube.com/@julruz", name: "Jul Ruz" } as const;

/** Accepts a full link (watch, youtu.be, shorts, embed) or a bare 11-character id */
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function youTubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
