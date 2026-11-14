import { defineConfig } from "tsup";

import { exportEntries } from "../../config/tsup/entries.mjs";

// One entry per segment the screens import, as package.json exports them, and no barrel at the
// root, as in console-core.
export default defineConfig((options) => ({
  entry: exportEntries(import.meta.url),
  format: ["esm"],
  dts: !options.watch,
  splitting: true,
  sourcemap: true,
  clean: !options.watch,
  treeshake: true,
  external: [/^@/, /^react/],
}));
