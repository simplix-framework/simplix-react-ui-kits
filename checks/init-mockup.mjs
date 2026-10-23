#!/usr/bin/env node
// Creates a mockup root around this kit: Storybook config, stylesheet, mockup.config.json, the
// layer directories, and a package.json whose library versions are the kit's own pins (which
// check-versions keeps equal to the framework's lockfile).
//   init-mockup --root <dir> --name <package name> --ui-kit <package> [--stylesheet <specifier>]
//               [--workspace <pnpm workspace root>] [--framework-version <x.y.z>]
// --stylesheet is the UI kit's app stylesheet (default <ui-kit>/styles/app.css); --workspace makes
// every library that workspace's catalog pins a `catalog:` dependency, so the root follows the product.
// The kit is expected at <root>/kit (git submodule add <kit repo> kit). Existing files are never
// overwritten. Without --framework-version the framework is a checkout named in mockup.config.json.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { listFiles, parseArgs } from "../lib/fs-util.mjs";
import { KIT_ROOT } from "../lib/kit-root.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.root || !args.name || !args["ui-kit"]) {
  console.error("usage: init-mockup --root <dir> --name <package name> --ui-kit <package> [--framework-version <x.y.z>]");
  process.exit(2);
}
const root = resolve(args.root);
const scaffold = join(KIT_ROOT, "scaffold");
const created = [];
const skipped = [];
for (const rel of listFiles(scaffold)) {
  const target = join(root, rel === "gitignore" ? ".gitignore" : rel);
  if (existsSync(target)) {
    skipped.push(rel);
    continue;
  }
  mkdirSync(join(target, ".."), { recursive: true });
  cpSync(join(scaffold, rel), target);
  created.push(rel === "gitignore" ? ".gitignore" : rel);
}
for (const dir of ["fixtures", "screens", "locales"]) mkdirSync(join(root, dir), { recursive: true });

// Every screen is drawn with one UI kit, named here and enforced by check-screens.
const configPath = join(root, "mockup.config.json");
const mockupConfig = JSON.parse(readFileSync(configPath, "utf8"));
if (!mockupConfig.uiKit) {
  mockupConfig.uiKit = String(args["ui-kit"]);
  writeFileSync(configPath, JSON.stringify(mockupConfig, null, 2) + "\n");
}

// The root's stylesheet starts from the UI kit's, which carries Tailwind, the framework theme and the
// kit's own sources; the product's extracted tokens and the screens follow it.
const cssPath = join(root, "src", "index.css");
if (!existsSync(cssPath)) {
  const stylesheet = String(args.stylesheet ?? `${args["ui-kit"]}/styles/app.css`);
  mkdirSync(join(root, "src"), { recursive: true });
  writeFileSync(
    cssPath,
    `@import "${stylesheet}";\n/* This product's own tokens, from kit/checks/extract-tokens.mjs. */\n@import "../tokens/tokens.css";\n\n@source "../screens";\n`,
  );
  created.push("src/index.css");
}

/** Entries of a pnpm workspace catalog, by package name. */
function catalogOf(workspaceRoot) {
  const text = readFileSync(join(workspaceRoot, "pnpm-workspace.yaml"), "utf8");
  const block = text.slice(text.indexOf("\ncatalog:") + 1).split("\n").slice(1);
  const names = new Set();
  for (const line of block) {
    if (!/^\s/.test(line) && line.trim()) break;
    const m = line.match(/^\s+'?([^':#\s]+)'?:/);
    if (m) names.add(m[1]);
  }
  return names;
}
const catalog = args.workspace ? catalogOf(resolve(String(args.workspace))) : new Set();
const pin = (deps) => Object.fromEntries(Object.entries(deps).map(([n, v]) => [n, catalog.has(n) ? "catalog:" : v]));

const kit = JSON.parse(readFileSync(join(KIT_ROOT, "package.json"), "utf8"));
const manifestPath = join(root, "package.json");
if (existsSync(manifestPath)) {
  skipped.push("package.json");
} else {
  // The framework: a published version when one is named, the workspace's own pin inside a
  // workspace (whose catalog decides it), and nothing otherwise (a checkout named in the config).
  const frameworkPackages = args["framework-version"]
    ? Object.fromEntries(["ui", "i18n", "headless", "api"].map((n) => [`@simplix-react/${n}`, String(args["framework-version"])]))
    : catalog.has("simplix-react")
      ? { "simplix-react": "catalog:" }
      : {};
  const pick = (names, from) => Object.fromEntries(names.map((n) => {
    const version = from[n] ?? kit.dependencies[n] ?? kit.devDependencies[n];
    if (!version) throw new Error(`kit package.json mockupRoot names ${n}, which the kit does not pin`);
    return [n, version];
  }));
  const manifest = {
    name: args.name,
    private: true,
    type: "module",
    packageManager: kit.packageManager,
    scripts: {
      storybook: "storybook dev -p 6006 --no-open",
      "build-storybook": "storybook build -o storybook-static",
      capture: "node kit/checks/capture.mjs --url http://localhost:6006 --out captures",
      tokens: "node kit/checks/extract-tokens.mjs --out tokens --entry",
      typecheck: "tsc --noEmit -p tsconfig.json",
      check: "node kit/checks/check-screens.mjs && tsc --noEmit -p tsconfig.json && node kit/checks/check-designs.mjs && node kit/checks/check-imports.mjs && node kit/checks/check-versions.mjs --root .",
    },
    dependencies: { ...frameworkPackages, [String(args["ui-kit"])]: args["ui-kit-version"] ? String(args["ui-kit-version"]) : "workspace:*", ...pin(pick(kit.mockupRoot.dependencies, kit.dependencies)) },
    devDependencies: pin(pick(kit.mockupRoot.devDependencies, kit.devDependencies)),
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  created.push("package.json");
}
console.log(`mockup root ${root}: created ${created.length} (${created.join(", ")})${skipped.length ? `, kept existing ${skipped.join(", ")}` : ""}`);
if (!existsSync(join(root, "kit", "package.json"))) console.log("  ℹ add the kit: git submodule add https://github.com/simplecore-inc/simplix-mockup-kit.git kit");
