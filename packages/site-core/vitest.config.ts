import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// The linked framework checkout keeps React, react-table and lucide-react in its own tree. A
// library loaded from there reads that tree's React, so a component of this package rendered beside
// it only shares a dispatcher when this package's `react`, `react-dom` and `lucide-react` imports
// resolve into the same tree. Where no framework is linked the lookup finds this package's own
// copies, and the aliases change nothing.
const uiDir = realpathSync(fileURLToPath(new URL("../../node_modules/@simplix-react/ui", import.meta.url)));
const fromFramework = createRequire(join(uiDir, "package.json"));
const frameworkDir = (name: string) => dirname(fromFramework.resolve(`${name}/package.json`));
const alias = (name: string) => [
  { find: new RegExp(`^${name}$`), replacement: frameworkDir(name) },
  { find: new RegExp(`^${name}/(.*)$`), replacement: `${frameworkDir(name)}/$1` },
];

// The parts are tested beside their sources; `tests/core` holds the checks of the contract and of
// the slot declarations as a whole, which read no design kit.
export default defineConfig({
  resolve: { dedupe: ["react", "react-dom"], alias: [...alias("react"), ...alias("react-dom"), ...alias("lucide-react")] },
  test: { include: ["src/**/*.test.{ts,tsx}", "tests/core/**/*.test.ts"], server: { deps: { inline: [/@simplix-react\//] } } },
});
