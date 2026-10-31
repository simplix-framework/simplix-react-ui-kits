import { defineConfig } from "vitest/config";

// The suites here check the kit's generator templates, which live outside `src`: a template is
// rendered with the CLI's template engine and its output is type-checked against the kit's own
// sources, so a run loads the compiler's program and is given room for it.
export default defineConfig({
  test: { include: ["tests/**/*.test.ts"], testTimeout: 120_000 },
});
