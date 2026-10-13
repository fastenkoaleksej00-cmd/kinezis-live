import type { Post } from "./types";

/**
 * Feed repository, stage 3. Same contract the database will implement in stage 5.
 * Sample posts are neutral platform notes and general tips, labelled as samples in the UI.
 */
const samplePosts: Post[] = [
  {
    id: "p-welcome",
    kind: "news",
    authorId: "yuliia",
    title: { en: "Welcome to KINEZIS LIVE", uk: "Вітаємо в KINEZIS LIVE", de: "Willkommen bei KINEZIS LIVE" },
    body: {
      en: "This feed is where new sessions, short videos and practical tips will be published. Save what you want to come back to with the bookmark.",
      uk: "У цій стрічці публікуватимуться нові заняття, короткі відео та практичні поради. Зберігай те, до чого хочеш повернутися, за допомогою закладки.",
      de: "In diesem Feed erscheinen neue Einheiten, kurze Videos und praktische Tipps. Speichere mit dem Lesezeichen, worauf du zurückkommen möchtest.",
    },
    language: "uk",
    access: "free",
    publishedAt: "2026-10-13T09:00:00Z",
    reactionsEnabled: true,
    commentsEnabled: true,
    sample: true,
  },
  {
    id: "p-new-session-back",
    kind: "session",
    authorId: "yuliia",
    title: { en: "New session: Back care in 10 minutes", uk: "Нове заняття: Турбота про спину за 10 хвилин", de: "Neue Einheit: Rückenpflege in 10 Minuten" },
    body: {
      en: "A short routine for days when there is little time. No equipment, floor or chair.",
      uk: "Коротка рутина для днів, коли мало часу. Без обладнання, на підлозі або на стільці.",
      de: "Eine kurze Routine für Tage mit wenig Zeit. Ohne Hilfsmittel, am Boden oder auf dem Stuhl.",
    },
    attachment: { kind: "workout", workoutId: "w-back-ten" },
    language: "uk",
    access: "free",
    publishedAt: "2026-10-12T17:30:00Z",
    reactionsEnabled: true,
    commentsEnabled: true,
    sample: true,
  },
  {
    id: "p-tip-sitting",
    kind: "tip",
    authorId: "yuliia",
    title: { en: "Tip: break up long sitting", uk: "Порада: перервати довге сидіння", de: "Tipp: langes Sitzen unterbrechen" },
    body: {
      en: "Every hour of sitting, stand up for two minutes: a few slow shoulder circles, a gentle twist and a short walk around the room. Small, regular breaks are easier to keep than one long session.",
      uk: "Щогодини сидіння вставай на дві хвилини: кілька повільних кіл плечима, м’який поворот корпусу та коротка прогулянка кімнатою. Малі регулярні перерви легше втримати, ніж одне довге заняття.",
      de: "Steh nach jeder Stunde Sitzen zwei Minuten auf: ein paar langsame Schulterkreise, eine sanfte Drehung und ein kurzer Gang durchs Zimmer. Kleine, regelmäßige Pausen sind leichter durchzuhalten als eine lange Einheit.",
    },
    language: "uk",
    access: "free",
    publishedAt: "2026-10-11T08:15:00Z",
    reactionsEnabled: true,
    commentsEnabled: true,
    sample: true,
  },
  {
    id: "p-short-video-neck",
    kind: "video",
    authorId: "yuliia",
    title: { en: "Short video: neck release", uk: "Коротке відео: розслаблення шиї", de: "Kurzes Video: Nacken lösen" },
    body: {
      en: "A one-minute sequence you can do at the desk.",
      uk: "Однохвилинна послідовність, яку можна зробити за столом.",
      de: "Eine einminütige Abfolge, die du am Schreibtisch machen kannst.",
    },
    attachment: { kind: "video", coverTone: "light", source: null, durationSec: 60 },
    language: "uk",
    access: "free",
    publishedAt: "2026-10-10T12:00:00Z",
    reactionsEnabled: true,
    commentsEnabled: true,
    sample: true,
  },
  {
    id: "p-photo-studio",
    kind: "photo",
    authorId: "yuliia",
    body: {
      en: "Morning light in the studio before the first group. Photos from real sessions will appear here.",
      uk: "Ранкове світло в студії перед першою групою. Тут з’являтимуться фото зі справжніх занять.",
      de: "Morgenlicht im Studio vor der ersten Gruppe. Hier erscheinen Fotos von echten Einheiten.",
    },
    attachment: { kind: "photo", coverTone: "mint", alt: { en: "Studio", uk: "Студія", de: "Studio" } },
    language: "uk",
    access: "free",
    publishedAt: "2026-10-09T07:40:00Z",
    reactionsEnabled: true,
    commentsEnabled: true,
    sample: true,
  },
];

export function listPosts(limit?: number): Post[] {
  const sorted = [...samplePosts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return limit ? sorted.slice(0, limit) : sorted;
}

export function getPost(id: string): Post | undefined {
  return samplePosts.find((p) => p.id === id);
}
