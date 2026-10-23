import { defineConfig } from "tsup";

// One entry per segment the screens import.
// No barrel at the root: every consumer names the segment it uses, so a screen cannot
// reach across the package by accident.
//
// The licence-domain segments of the source package (catalogue, deployment, gateway, ledger,
// storefront) are not in this copy, and neither is the export button, which reaches into the
// generated system domain and the deployment settings beside it — design 17.6 keeps the licence domain out, and what came
// across is the neutral half.
export default defineConfig((options) => ({
  entry: {
    // What the boot mutator hands a screen, said once rather than cast at every call site.
    "api/index": "src/api/index.ts",
    "peek/index": "src/peek/index.ts",
    "layout/index": "src/layout/index.ts",
    "page/index": "src/page/index.ts",
    "manual/index": "src/manual/index.ts",
    "mock/index": "src/mock/index.ts",
    "notice/index": "src/notice/index.ts",
    "attachment/index": "src/attachment/index.ts",
    "badge/index": "src/badge/index.tsx",
    "clipboard/index": "src/clipboard/index.ts",
    // Its own entry so an app's polyfills file can install the fill without pulling React and
    // the framework's UI package in ahead of them — that file runs before anything is set up.
    "clipboard/fallback": "src/clipboard/install-clipboard-fallback.ts",
    "datetime/index": "src/datetime/index.ts",
    "entity/index": "src/entity/index.ts",
    // The failure screens and the failure dialog: shared because three apps drew them and one
    // app's fix reached only that app, which is how two of them printed raw keys for a release.
    "error/index": "src/error/index.ts",
    "i18n/index": "src/i18n/index.ts",
    "identity/index": "src/identity/index.ts",
    // The board's common patterns — the frames that belong to no entity, so no scaffold
    // can emit them and no app may hold its own copy.
    "screen/index": "src/screen/index.ts",
    "shell/index": "src/shell/index.ts",
  },
  format: ["esm"],
  dts: !options.watch,
  splitting: true,
  sourcemap: true,
  clean: !options.watch,
  treeshake: true,
  external: [/^@/, /^react/, /^zod/, /^lucide-react/],
}));
