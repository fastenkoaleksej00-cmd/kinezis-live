"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { useProgress } from "@/lib/store/progress";

const ORIGIN = "https://www.youtube-nocookie.com";
const SAVE_EVERY_SECONDS = 5;

/**
 * Official YouTube player in privacy-enhanced mode. Until the member taps, only the thumbnail is shown,
 * so no YouTube frame or cookie loads on page open. Progress comes from the player's own postMessage
 * events (no extra script), so resume and "completed" work like our own player.
 */
export function YouTubeEmbed({ id, title, poster, progressId }: { id: string; title: string; poster?: string; progressId: string }) {
  const t = useTranslations("player");
  const { get, update } = useProgress();
  const [started, setStarted] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const lastSaved = useRef(0);
  const saved = get(progressId);
  const resume = saved && !saved.completed && saved.position > 5 ? Math.floor(saved.position) : 0;

  useEffect(() => {
    if (!started) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== ORIGIN || typeof e.data !== "string") return;
      let msg: { event?: string; info?: { currentTime?: number; duration?: number; playerState?: number } } | null = null;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      const info = msg?.info;
      if (!info) return;
      const duration = info.duration ?? 0;
      if (info.playerState === 0 && duration > 0) {
        update(progressId, duration, duration);
        return;
      }
      if (typeof info.currentTime === "number" && duration > 0 && Math.abs(info.currentTime - lastSaved.current) >= SAVE_EVERY_SECONDS) {
        lastSaved.current = info.currentTime;
        update(progressId, info.currentTime, duration);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [started, progressId, update]);

  const src = `${ORIGIN}/embed/${id}?enablejsapi=1&playsinline=1&rel=0&autoplay=1${resume ? `&start=${resume}` : ""}&origin=${typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : ""}`;

  return (
    <div className="space-y-2">
      <div className="relative aspect-video overflow-hidden rounded-3xl bg-black shadow-[var(--shadow-card)]">
        {started ? (
          <iframe
            ref={frame}
            src={src}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), ORIGIN)}
          />
        ) : (
          <button type="button" onClick={() => setStarted(true)} className="group absolute inset-0 h-full w-full" aria-label={t("playOnYouTube", { title })}>
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : null}
            <span className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" aria-hidden />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                <Play className="ml-1 h-7 w-7" fill="currentColor" aria-hidden />
              </span>
            </span>
            {resume ? <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">{t("resumeFrom", { time: `${Math.floor(resume / 60)}:${String(resume % 60).padStart(2, "0")}` })}</span> : null}
          </button>
        )}
      </div>
      <p className="text-steel text-xs">{t("youtubeNote")}</p>
    </div>
  );
}
