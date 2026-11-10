import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// The suites here check the kit's clarity design and its generator templates, which live outside
// `src`: a template is rendered with the CLI's template engine and its output is type-checked
// against the kit's own sources, so a run loads the compiler's program and is given room for it.
//
// A suite that renders a part does so with the framework's React: the linked framework checkout
// keeps React and lucide-react in its own tree, so `react`, `react-dom` and `lucide-react` resolve
// there, and the framework, React Query and zustand are inlined so their `react` import goes
// through the same alias. Where no framework is linked the lookup finds this package's own copies.
const uiDir = realpathSync(fileURLToPath(new URL("../../node_modules/@simplix-react/ui", import.meta.url)));
const fromFramework = createRequire(join(uiDir, "package.json"));
const frameworkDir = (name: string) => dirname(fromFramework.resolve(`${name}/package.json`));
const alias = (name: string) => [
  { find: new RegExp(`^${name}$`), replacement: frameworkDir(name) },
  { find: new RegExp(`^${name}/(.*)$`), replacement: `${frameworkDir(name)}/$1` },
];

export default defineConfig({
  resolve: { dedupe: ["react", "react-dom"], alias: [...alias("react"), ...alias("react-dom"), ...alias("lucide-react")] },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    testTimeout: 120_000,
    server: { deps: { inline: [/@simplix-react\//, /@tanstack\/react-query/, /zustand/] } },
  },
});
