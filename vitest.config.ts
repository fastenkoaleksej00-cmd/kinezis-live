import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** Unit tests for pure logic in lib/ (no browser, no Supabase). Run: npm test */
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: { include: ["tests/unit/**/*.test.ts"], environment: "node" },
});
