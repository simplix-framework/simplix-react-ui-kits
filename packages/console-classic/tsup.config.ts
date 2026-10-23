import { defineConfig } from "tsup";

// The classic console kit re-exports the shared parts segment by segment; the parts themselves
// build in console-core.
export default defineConfig((options) => ({
  entry: {
    "api/index": "src/api/index.ts",
    "attachment/index": "src/attachment/index.ts",
    "badge/index": "src/badge/index.ts",
    "clipboard/index": "src/clipboard/index.ts",
    "clipboard/fallback": "src/clipboard/fallback.ts",
    "datetime/index": "src/datetime/index.ts",
    "entity/index": "src/entity/index.ts",
    "error/index": "src/error/index.ts",
    "i18n/index": "src/i18n/index.ts",
    "identity/index": "src/identity/index.ts",
    "layout/index": "src/layout/index.ts",
    "manual/index": "src/manual/index.ts",
    "mock/index": "src/mock/index.ts",
    "notice/index": "src/notice/index.ts",
    "page/index": "src/page/index.ts",
    "peek/index": "src/peek/index.ts",
    "screen/index": "src/screen/index.ts",
    "shell/index": "src/shell/index.ts",
  },
  format: ["esm"],
  dts: !options.watch,
  sourcemap: true,
  clean: !options.watch,
  external: [/^@/, /^react/],
}));
