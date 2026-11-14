import { defineConfig } from "vitest/config";

// The suites here hold the site stylesheet to the slots it draws and the variables it reads; the
// parts, the contract and the templates are tested in site-core.
export default defineConfig({
  test: { include: ["tests/**/*.test.ts"] },
});
