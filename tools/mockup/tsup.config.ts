import { defineConfig } from "tsup";

import { exportEntries } from "../../config/tsup/entries.mjs";

// The preview and the settings a mockup root imports; the commands, the plugin and the preset are
// plain modules run as they are.
export default defineConfig((options) => ({
  entry: exportEntries(import.meta.url),
  format: ["esm"],
  dts: !options.watch,
  sourcemap: true,
  clean: !options.watch,
  external: [/^@/, /^react/, /^storybook/, /^virtual:/],
}));
