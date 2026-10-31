import { defineConfig } from "vitest/config";

// Only `*.test.*` files are tests: the design specs under `src/styles/designs` end in `.spec.ts`
// and hold a design, not a suite. React resolves to one copy, so a hook test rendering under the
// framework's provider shares its dispatcher even when the framework is a linked checkout.
export default defineConfig({
  resolve: { dedupe: ["react", "react-dom"] },
  test: { include: ["src/**/*.test.{ts,tsx}"], server: { deps: { inline: [/@simplix-react\//] } } },
});
