import { defineConfig } from "vitest/config";

// Only `*.test.*` files are tests: the design specs under `src/styles/designs` end in `.spec.ts`
// and hold a design, not a suite.
export default defineConfig({
  test: { include: ["src/**/*.test.{ts,tsx}"] },
});
