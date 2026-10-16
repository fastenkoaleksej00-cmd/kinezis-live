import { YOUTUBE_CHANNEL } from "./youtube";

export interface FeedVideo {
  id: string;
  title: string;
  published: string;
}

/** Latest uploads from the channel's public RSS feed (no API key; YouTube returns the 15 newest). Cached for an hour. */
export async function latestChannelVideos(channelId: string = YOUTUBE_CHANNEL.id): Promise<FeedVideo[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const out: FeedVideo[] = [];
    for (const entry of xml.split("<entry>").slice(1)) {
      const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
      const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? "";
      if (id) out.push({ id, title: title.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'"), published });
    }
    return out;
  } catch {
    return [];
  }
}
