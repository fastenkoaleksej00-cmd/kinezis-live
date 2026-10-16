import { describe, expect, it } from "vitest";
import { calculate } from "@/lib/health/calculator";
import { safePath } from "@/lib/security";
import { parseYouTubeId } from "@/lib/video/youtube";
import { normalizeTags, redFlagText, riskyText } from "@/lib/community/types";
import { offersFor, type ShopItem } from "@/lib/shop/types";
import { regionAt } from "@/lib/body/regions";
import { cycleSeconds, practiceById } from "@/lib/breath/practices";

describe("safePath (open-redirect guard)", () => {
  it("keeps in-app paths", () => expect(safePath("/library/abc", "/")).toBe("/library/abc"));
  it("blocks protocol-relative and backslash tricks", () => {
    expect(safePath("//evil.com", "/")).toBe("/");
    expect(safePath("/\\evil.com", "/")).toBe("/");
    expect(safePath("https://evil.com", "/")).toBe("/");
  });
});

describe("parseYouTubeId", () => {
  it("reads watch, short and shorts links", () => {
    expect(parseYouTubeId("https://www.youtube.com/watch?v=hRvell3y2LM")).toBe("hRvell3y2LM");
    expect(parseYouTubeId("https://youtu.be/hRvell3y2LM?si=x")).toBe("hRvell3y2LM");
    expect(parseYouTubeId("https://youtube.com/shorts/vFfTyl055rg")).toBe("vFfTyl055rg");
  });
  it("rejects other hosts and junk", () => {
    expect(parseYouTubeId("https://vimeo.com/123")).toBeNull();
    expect(parseYouTubeId("javascript:alert(1)")).toBeNull();
  });
});

describe("goal calculator", () => {
  const base = { currentKg: 70, targetKg: 65, heightCm: 168, age: 40, activity: "moderate" as const, goal: null, sex: "female" as const };
  it("plans 0.25–0.5 kg per week", () => {
    const r = calculate(base)!;
    expect(r.direction).toBe("lose");
    expect(r.weeks).toEqual({ fast: 10, slow: 20 });
  });
  it("never suggests intake below the floor", () => {
    const r = calculate({ ...base, currentKg: 50, targetKg: 45, heightCm: 150, activity: "low" })!;
    expect(r.intake.low).toBeGreaterThanOrEqual(1200);
  });
  it("refuses to plan for minors", () => {
    const r = calculate({ ...base, age: 16 });
    expect(r === null || r.warnings.includes("minor")).toBe(true);
  });
});

describe("community safety helpers", () => {
  it("normalises tags", () => expect(normalizeTags("#Поясница, утро, утро, x")).toEqual(["поясница", "утро"]));
  it("flags cure claims, not ordinary stories", () => {
    expect(riskyText("Это упражнение меня вылечило навсегда")).toBe(true);
    expect(riskyText("Stop taking your meds, this works")).toBe(true);
    expect(riskyText("Стало легче после недели растяжки")).toBe(false);
  });
  it("detects red-flag symptoms", () => expect(redFlagText("появилось онемение в ноге")).toBe(true));
});

describe("shop offers by country", () => {
  const item = { offers: [{ id: "a", source: "amazon", countries: ["DE"], url: "https://x", currency: "EUR" }, { id: "b", source: "partner", countries: [], url: "https://y", currency: "EUR" }] } as unknown as ShopItem;
  it("shows confirmed and unspecified offers", () => {
    expect(offersFor(item, "DE").map((o) => [o.offer.id, o.confirmed])).toEqual([["a", true], ["b", false]]);
    expect(offersFor(item, "UA").map((o) => o.offer.id)).toEqual(["b"]);
  });
});

describe("body map regions", () => {
  it("maps a point at the neck to the neck", () => expect(regionAt({ x: 0, y: 1.48, z: 0 })).toBe("neck"));
  it("returns null outside the body", () => expect(regionAt({ x: 2, y: 2, z: 2 })).toBeNull());
});

describe("breathing practices", () => {
  it("calm practice is about 10 seconds per breath (≈6 per minute)", () => {
    expect(cycleSeconds(practiceById.calm)).toBeCloseTo(10, 0);
  });
});
