import { defineConfig } from "tsup";

import { exportEntries } from "../../config/tsup/entries.mjs";

// One entry per segment the screens import, as package.json exports them. No barrel at the root:
// every consumer names the segment it uses, so a screen cannot reach across the package by
// accident. `clipboard/fallback` is its own entry so an app's polyfills file can install the fill
// without pulling React and the framework's UI package in ahead of them.
export default defineConfig((options) => ({
  entry: exportEntries(import.meta.url),
  format: ["esm"],
  dts: !options.watch,
  splitting: true,
  sourcemap: true,
  clean: !options.watch,
  treeshake: true,
  external: [/^@/, /^react/, /^zod/, /^lucide-react/],
}));
