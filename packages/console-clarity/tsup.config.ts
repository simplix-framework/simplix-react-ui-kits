import { defineConfig } from "tsup";

import { exportEntries } from "../../config/tsup/entries.mjs";

// A design kit re-exports its core kit segment by segment, one entry per export in package.json;
// the parts themselves build in the core kit.
export default defineConfig((options) => ({
  entry: exportEntries(import.meta.url),
  format: ["esm"],
  dts: !options.watch,
  sourcemap: true,
  clean: !options.watch,
  external: [/^@/, /^react/],
}));
