// PROPOSED (not wired). Target: tests/e2e/*.spec.ts with Playwright (`npm i -D @playwright/test`).
// Runs against a preview deployment (PLAYWRIGHT_BASE_URL) in iPhone and desktop viewports.
// Guest-only flows; signed-in flows need a dedicated test account in a separate Supabase project.
import { devices, expect, test } from "@playwright/test";

test.use({ ...devices["iPhone 13"] });

test.beforeEach(async ({ page }) => {
  // Skip the first-launch introduction
  await page.addInitScript(() => window.localStorage.setItem("kl_onboarded", "1"));
});

test("home renders the main blocks", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  await expect(page.locator("h1")).toBeVisible();
});

test("library opens and filters by category", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("button", { name: /yoga|йога/i }).first().click();
  await expect(page).toHaveURL(/category=yoga/);
});

test("a YouTube session shows a thumbnail before any frame loads", async ({ page }) => {
  await page.goto("/library?source=youtube");
  await page.locator('a[href^="/library/yt-"]').first().click();
  await page.getByRole("link", { name: /start|начать/i }).first().click();
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("unknown page shows the branded 404 (after patch A1)", async ({ page }) => {
  const res = await page.goto("/this-does-not-exist");
  expect(res?.status()).toBe(404);
});

test("open-redirect guard", async ({ request }) => {
  const res = await request.get("/auth/callback?next=//evil.com", { maxRedirects: 0 });
  expect(res.headers().location ?? "").not.toContain("evil.com");
});
