import { defineConfig } from "tsup";

// The clarity site kit re-exports the shared parts segment by segment; the parts build in site-core.
export default defineConfig((options) => ({
  entry: {
    "action/index": "src/action/index.ts",
    "install/index": "src/install/index.ts",
    "link/index": "src/link/index.ts",
    "marketing/index": "src/marketing/index.ts",
    "page/index": "src/page/index.ts",
    "pricing/index": "src/pricing/index.ts",
    "shell/index": "src/shell/index.ts",
  },
  format: ["esm"],
  dts: !options.watch,
  sourcemap: true,
  clean: !options.watch,
  external: [/^@/, /^react/],
}));
