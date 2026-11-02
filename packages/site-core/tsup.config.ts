import { defineConfig } from "tsup";

// One entry per segment the screens import, and no barrel at the root, as in console-core.
export default defineConfig((options) => ({
  entry: {
    "action/index": "src/action/index.ts",
    "help/index": "src/help/index.ts",
    "install/index": "src/install/index.ts",
    "link/index": "src/link/index.ts",
    "marketing/index": "src/marketing/index.ts",
    "page/index": "src/page/index.ts",
    "pricing/index": "src/pricing/index.ts",
    "shell/index": "src/shell/index.ts",
  },
  format: ["esm"],
  dts: !options.watch,
  splitting: true,
  sourcemap: true,
  clean: !options.watch,
  treeshake: true,
  external: [/^@/, /^react/],
}));
