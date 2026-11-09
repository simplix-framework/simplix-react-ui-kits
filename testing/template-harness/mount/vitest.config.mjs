import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { workspacePaths } from "../lib/typecheck.mjs";

/**
 * Mounts the board frames a kit's templates generated, in the DOM the kit's own DOM tests use.
 *
 * `HARNESS_OUT` is the generated project and `HARNESS_KIT` the kit it was generated from. The
 * generated code's imports resolve as the type check resolves them (each workspace package and the
 * kit through its `source` export), and React, React DOM and lucide-react resolve to one copy, so a
 * framework component, a kit component and the router share one dispatcher.
 */

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const out = process.env.HARNESS_OUT;
const kit = process.env.HARNESS_KIT;
if (!out || !kit) throw new Error("HARNESS_OUT and HARNESS_KIT name the generated project and its kit");

// React is read from the tree the router and the kit are installed in, since a CommonJS dependency of
// the router requires it from there and no alias reaches a `require`; the framework's own modules are
// inlined, so the alias points them at the same copy.
const fromKit = createRequire(join(realpathSync(join(repoRoot, "packages", "console-core")), "package.json"));
const kitTreeDir = (name) => dirname(realpathSync(fromKit.resolve(`${name}/package.json`)));
const singleCopy = (name) => [
  { find: new RegExp(`^${name}$`), replacement: kitTreeDir(name) },
  { find: new RegExp(`^${name}/(.*)$`), replacement: `${kitTreeDir(name)}/$1` },
];
const workspaceAlias = Object.entries(workspacePaths(out, [kit]))
  .sort(([a], [b]) => b.length - a.length)
  .map(([specifier, [target]]) => ({ find: new RegExp(`^${specifier.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}$`), replacement: target }));

export default defineConfig({
  root: here,
  resolve: {
    // A workspace package is read from its sources, as an app's bundler reads it, never from a build.
    conditions: ["source", "module", "browser", "development"],
    dedupe: ["react", "react-dom"],
    alias: [...workspaceAlias, ...singleCopy("react"), ...singleCopy("react-dom"), ...singleCopy("lucide-react")],
  },
  server: { fs: { allow: [repoRoot, out] } },
  test: {
    include: ["mount.test.tsx"],
    environment: join(repoRoot, "packages", "console-core", "vitest-jsdom.mjs"),
    // Every dependency is inlined, so each ES module's `react` import goes through the alias above,
    // wherever the dependency is installed (the framework checkout keeps its own tree).
    server: { deps: { inline: true } },
    testTimeout: 30_000,
  },
});
