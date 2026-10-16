/** Community topics and post types. Plain module: shared by server and client. */
export const communityTopics = ["back", "mobility", "recovery", "nutrition", "breath", "mind", "face", "general"] as const;
export type CommunityTopic = (typeof communityTopics)[number];

export const postTypes = ["story", "question", "tip"] as const;
export type PostType = (typeof postTypes)[number];

/** Topics where personal advice can hurt: the composer shows the safety rules first */
export const sensitiveTopics: CommunityTopic[] = ["back", "mobility", "recovery", "nutrition"];

/** Up to 5 tags, lowercase, letters/digits/dash, 2–24 chars */
export function normalizeTags(raw: string): string[] {
  const out: string[] = [];
  for (const part of raw.split(/[,#\s]+/)) {
    const tag = part
      .toLowerCase()
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .slice(0, 24);
    if (tag.length >= 2 && !out.includes(tag)) out.push(tag);
    if (out.length === 5) break;
  }
  return out;
}

/**
 * Phrases that usually mean a cure claim, stopping treatment or a guarantee. A match does not block the post:
 * it goes to the moderation queue and the author sees a gentle note. Not a medical judgement.
 */
const riskyPatterns: RegExp[] = [
  /вылеч|излеч|исцел|навсегда избав|вилікув|зцілю|назавжди позбав/i,
  /гарантир|гарантую|100\s?%/i,
  /(брос|отмен|перестань|не пей|не принимай).{0,20}(лекарств|таблет|препарат)/i,
  /(кинь|скасу|перестан|не приймай).{0,20}(лік|таблет|препарат)/i,
  /\b(cure[sd]?|guarantee[sd]?|miracle)\b/i,
  /\bstop (taking )?(your )?(meds|medication|pills|treatment)\b/i,
  /\b(heilt|geheilt|garantiert)\b/i,
];

export function riskyText(text: string): boolean {
  return riskyPatterns.some((r) => r.test(text));
}

/** Symptoms that need a professional first; the post shows the see-a-doctor note under it */
const redFlagPatterns: RegExp[] = [/онемен|онімін|numb|taub/i, /слабост|слабкіст|weakness|schwäche/i, /резк(ая|ой) бол|різк(ий|ого) біл|sudden (sharp )?pain|plötzlich/i, /недержан|нетриман|incontinen/i];

export function redFlagText(text: string): boolean {
  return redFlagPatterns.some((r) => r.test(text));
}
