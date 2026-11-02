import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { defineConfig } from "vitest/config";

// The linked framework checkout carries React and every library that calls into it (react-table,
// lucide-react, the primitives) in its own tree, beside this package's React. A component of the
// framework rendered here must run on the one React its own libraries use, so `react` and
// `react-dom` resolve to the framework's copy for every import. Without a linked checkout (the
// registry profile) there is a single tree and the lookup finds this package's own copies.
const uiDir = realpathSync(fileURLToPath(new URL("../../node_modules/@simplix-react/ui", import.meta.url)));
const frameworkReact = (name: string) => dirname(createRequire(join(uiDir, "package.json")).resolve(`${name}/package.json`));
const alias = (name: string) => [
  { find: new RegExp(`^${name}$`), replacement: frameworkReact(name) },
  { find: new RegExp(`^${name}/(.*)$`), replacement: `${frameworkReact(name)}/$1` },
];

// Only `*.test.*` files are tests: the design specs under `src/styles/designs` end in `.spec.ts`
// and hold a design, not a suite.
export default defineConfig({
  resolve: { dedupe: ["react", "react-dom"], alias: [...alias("react"), ...alias("react-dom")] },
  test: { include: ["src/**/*.test.{ts,tsx}"], server: { deps: { inline: [/@simplix-react\//] } } },
});
