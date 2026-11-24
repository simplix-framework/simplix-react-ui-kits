#!/usr/bin/env node
// Creates a mockup root: Storybook config, stylesheet, mockup.config.json, the layer directories,
// and a package.json whose library versions are the ones the framework checkout's lockfile resolves
// (which check-versions keeps them equal to).
//   init-mockup --root <dir> --name <package name> --ui-kit <package> [--stylesheet <specifier>]
//               [--framework <checkout>] [--workspace <pnpm workspace root>]
//               [--framework-version <x.y.z>] [--ui-kit-version <spec>] [--mockup-version <spec>]
// --stylesheet names what the root's stylesheet imports before the product's tokens, once per
// import and in order. Without it the imports are the ones the UI kit declares (`simplix.stylesheet`
// of its manifest, read where --ui-kit-version is a `link:` path), else <ui-kit>/styles/app.css.
// --workspace makes every library that workspace's catalog pins a `catalog:` dependency, so the root
// follows the product.
// --framework is the checkout whose lockfile pins the libraries (default: the `framework` the root's
// mockup.config.json names). --ui-kit-version and --mockup-version are how the root depends on the
// UI kit and on this package (default `workspace:*`; a `link:` path or a published version otherwise).
// Existing files are never overwritten. Without --framework-version the root renders the checkout.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { listFiles, parseArgs } from "../lib/fs-util.mjs";
import { FRAMEWORK_SCOPE, locateFramework } from "../lib/framework.mjs";
import { frameworkPin, frameworkVersions } from "../lib/framework-versions.mjs";
import { PACKAGE_ROOT } from "../lib/package-root.mjs";
import { frameworkOf } from "../lib/mockup-root.mjs";

const argv = process.argv.slice(2);
const args = parseArgs(argv);
if (!args.root || !args.name || !args["ui-kit"]) {
  console.error("usage: init-mockup --root <dir> --name <package name> --ui-kit <package> [--framework <checkout>] [--workspace <dir>] [--framework-version <x.y.z>]");
  process.exit(2);
}
const root = resolve(args.root);
const scaffold = join(PACKAGE_ROOT, "scaffold");
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
  // The checkout named for this run is the one the root renders from then on.
  if (args.framework) mockupConfig.framework = relative(root, resolve(String(args.framework))) || ".";
  writeFileSync(configPath, JSON.stringify(mockupConfig, null, 2) + "\n");
}

// A root that renders a checkout reads the framework's types from that checkout's sources, and
// React's from its own install: the checkout and a linked UI kit each carry a copy of React's types,
// and two copies do not agree on a prop's type.
const tsconfigPath = join(root, "tsconfig.json");
if (created.includes("tsconfig.json") && !args["framework-version"]) {
  const checkout = frameworkOf(root, args.framework);
  if (checkout) {
    const from = relative(root, checkout).split("\\").join("/");
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf8"));
    tsconfig.compilerOptions.paths = {
      "@simplix-react/ui/*": [`${from}/packages/ui/src/*`],
      "@simplix-react/i18n/*": [`${from}/packages/i18n/src/*`],
      "@simplix-react/*": [`${from}/packages/*/src`],
      react: ["./node_modules/@types/react"],
      "react/*": ["./node_modules/@types/react/*"],
      "react-dom": ["./node_modules/@types/react-dom"],
      "react-dom/*": ["./node_modules/@types/react-dom/*"],
    };
    writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + "\n");
  }
}

// The root's stylesheet starts from the UI kit's, which carries Tailwind, the framework theme and the
// kit's own sources; the product's extracted tokens and the screens follow it.
const cssPath = join(root, "src", "index.css");
if (!existsSync(cssPath)) {
  const named = argv.flatMap((token, i) => (token === "--stylesheet" && argv[i + 1] ? [argv[i + 1]] : []));
  const link = String(args["ui-kit-version"] ?? "");
  const kitManifest = link.startsWith("link:") ? join(resolve(root, link.slice(5)), "package.json") : undefined;
  const declared = kitManifest && existsSync(kitManifest) ? JSON.parse(readFileSync(kitManifest, "utf8")).simplix?.stylesheet : undefined;
  const imports = named.length > 0 ? named : (declared ?? [`${args["ui-kit"]}/styles/app.css`]);
  mkdirSync(join(root, "src"), { recursive: true });
  writeFileSync(
    cssPath,
    `${imports.map((specifier) => `@import "${specifier}";\n`).join("")}/* This product's own tokens, written by simplix-mockup extract-tokens. */\n@import "../tokens/tokens.css";\n\n@source "../screens";\n`,
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

const kit = JSON.parse(readFileSync(join(PACKAGE_ROOT, "package.json"), "utf8"));
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
  // A library the workspace's catalog pins follows the workspace; every other is pinned to the
  // version the framework checkout's lockfile resolves.
  const frameworkRoot = frameworkOf(root, args.framework);
  let resolved;
  const pick = (names) => Object.fromEntries(names.map((n) => {
    if (catalog.has(n)) return [n, "catalog:"];
    if (!frameworkRoot) throw new Error(`${n} needs a version: name the framework checkout (--framework, or mockup.config.json framework) or a workspace whose catalog pins it (--workspace)`);
    resolved ??= frameworkVersions(frameworkRoot);
    const version = frameworkPin(resolved, n);
    if (!version) throw new Error(`${frameworkRoot}/pnpm-lock.yaml resolves no ${n}, which a mockup root installs`);
    return [n, version];
  }));
  const wanted = kit.simplix.mockupRoot;
  // A root that renders a checkout installs the libraries the rendered framework packages import;
  // a root on the published framework, or inside a workspace that pins it, gets them with it.
  const rendered = Object.keys(frameworkPackages).length === 0 && frameworkRoot
    ? ["ui", "i18n", "headless", "api"].map((n) => locateFramework({ framework: frameworkRoot, libraryRoot: root }).packages.get(`${FRAMEWORK_SCOPE}${n}`)).filter(Boolean)
    : [];
  const frameworkLibraries = [...new Set(rendered.flatMap(({ manifest: m }) => Object.keys({ ...m.dependencies, ...m.peerDependencies })))]
    .filter((n) => !n.startsWith(FRAMEWORK_SCOPE))
    .sort();
  const manifest = {
    name: args.name,
    private: true,
    type: "module",
    scripts: {
      storybook: "storybook dev -p 6006 --no-open",
      "build-storybook": "storybook build -o storybook-static",
      capture: "simplix-mockup capture --url http://localhost:6006 --out captures",
      tokens: "simplix-mockup extract-tokens --out tokens --entry",
      typecheck: "tsc --noEmit -p tsconfig.json",
      check: "simplix-mockup check-screens && tsc --noEmit -p tsconfig.json && simplix-mockup check-designs && simplix-mockup check-imports && simplix-mockup check-versions",
    },
    dependencies: {
      ...frameworkPackages,
      [String(args["ui-kit"])]: String(args["ui-kit-version"] ?? "workspace:*"),
      ...pick([...new Set([...frameworkLibraries, ...wanted.dependencies])].sort()),
    },
    devDependencies: {
      [kit.name]: String(args["mockup-version"] ?? "workspace:*"),
      ...pick(wanted.devDependencies),
    },
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  created.push("package.json");
}
console.log(`mockup root ${root}: created ${created.length} (${created.join(", ")})${skipped.length ? `, kept existing ${skipped.join(", ")}` : ""}`);
