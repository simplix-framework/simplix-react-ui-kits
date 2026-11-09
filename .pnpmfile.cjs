// .pnpmfile.cjs — COMMITTED & shared (intentionally not gitignored).
//
// Links the entire @simplix-react(-ext) scope to a local simplix-react checkout when the
// active link profile resolves to "local" (or "auto" + the checkout is present). In
// "registry" mode the hook is inert and packages come from the published npm versions
// pinned by the catalog. A clean clone or CI without the checkout always falls back to the
// registry: no edits, no broken links.
//
// Profile + checkout PATH are resolved (first defined value wins) from:
//   profile:        SIMPLIX_PROFILE env
//                 → .simplix-react#linkProfile
//                 → package.json#simplix.linkProfile
//                 → "auto"
//   frameworkPath:  SIMPLIX_FRAMEWORK_PATH env
//                 → .simplix-react#frameworkPath
//                 → package.json#simplix.frameworkPath
//                 → "../simplix-react"
// `.simplix-react` is a per-developer JSON file (gitignored); copy it from
// `.simplix-react.sample`. Relative framework paths resolve against the repo root.
//
// Profiles:
//   "auto"     - link IFF the configured checkout exists
//   "local"    - always link (active co-development; requires the checkout)
//   "registry" - never link (use the published npm version)
//
// This repository commits "auto": the kits' templates are read by the framework's CLI, so a
// simplix-react checkout beside this one (the CLI included) is what the kits build and test
// against, and a clone without it falls back to the published version. "registry"
// (pnpm local:unlink) checks the kits against the published framework alone.
//
// Linking is by CONVENTION (no per-package list):
//   @simplix-react/<x>                    → <framework>/packages/<x>
//   @simplix-react-ext/simplix-boot-<x>   → <framework>/extensions/simplix-boot/packages/<x>
//
// Run `node .pnpmfile.cjs status` (pnpm local:status) to print the resolved profile/path.

const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const LOCAL_CONFIG = ".simplix-react";
const DEFAULT_FRAMEWORK = "../simplix-react";

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    // Missing or malformed file → treat as "no overrides".
    return {};
  }
}

const ROOT_MANIFEST = readJson(path.join(ROOT, "package.json"));
const ROOT_PKG = ROOT_MANIFEST.name;

// Resolve the link profile + framework checkout path from env / .simplix-react / package.json.
function resolveLinkConfig() {
  const committed = ROOT_MANIFEST.simplix || {};
  const local = readJson(path.join(ROOT, LOCAL_CONFIG));

  const profile =
    process.env.SIMPLIX_PROFILE || local.linkProfile || committed.linkProfile || "auto";
  const profileSource = process.env.SIMPLIX_PROFILE
    ? "env override"
    : local.linkProfile
      ? LOCAL_CONFIG
      : committed.linkProfile
        ? "package.json default"
        : "built-in default";

  const rawPath =
    process.env.SIMPLIX_FRAMEWORK_PATH ||
    local.frameworkPath ||
    committed.frameworkPath ||
    DEFAULT_FRAMEWORK;
  const pathSource = process.env.SIMPLIX_FRAMEWORK_PATH
    ? "env override"
    : local.frameworkPath
      ? LOCAL_CONFIG
      : committed.frameworkPath
        ? "package.json default"
        : "built-in default";

  // Absolute paths pass through; relative paths resolve against the repo root.
  const frameworkPath = path.resolve(ROOT, rawPath);
  const frameworkExists = fs.existsSync(frameworkPath);
  // "local" forces linking, "registry" forces npm; "auto" links only when the checkout exists.
  const enabled = profile === "local" ? true : profile === "registry" ? false : frameworkExists;

  return { profile, profileSource, frameworkPath, pathSource, frameworkExists, enabled };
}

const { enabled: ENABLED, frameworkPath: FRAMEWORK } = resolveLinkConfig();

// Conventional directory for a scoped package name inside the framework checkout.
function dirOf(name) {
  // Bare meta packages (simplix-react, simplix-react-ext) aggregate a whole scope;
  // their sources live alongside the scoped packages in packages/.
  if (name === "simplix-react" || name === "simplix-react-ext") {
    return path.join(FRAMEWORK, "packages", name);
  }
  // The React Native meta package aggregates the native scope from extensions/native.
  if (name === "simplix-react-native") {
    return path.join(FRAMEWORK, "extensions/native/packages", "meta");
  }
  if (name.startsWith("@simplix-react-native/")) {
    return path.join(
      FRAMEWORK,
      "extensions/native/packages",
      name.slice("@simplix-react-native/".length),
    );
  }
  if (name.startsWith("@simplix-react-native-ext/")) {
    return path.join(
      FRAMEWORK,
      "extensions/native/packages",
      name.slice("@simplix-react-native-ext/".length),
    );
  }
  if (name.startsWith("@simplix-react/")) {
    return path.join(FRAMEWORK, "packages", name.slice("@simplix-react/".length));
  }
  if (name.startsWith("@simplix-react-ext/simplix-boot-")) {
    return path.join(
      FRAMEWORK,
      "extensions/simplix-boot/packages",
      name.slice("@simplix-react-ext/simplix-boot-".length),
    );
  }
  return null;
}

function linkSpec(name) {
  const dir = dirOf(name);
  return dir && fs.existsSync(path.join(dir, "package.json")) ? "link:" + dir : null;
}

function patch(deps) {
  if (!deps) return;
  for (const name of Object.keys(deps)) {
    const spec = linkSpec(name);
    if (spec) deps[name] = spec;
  }
}

// Every scoped package present in the checkout — covers transitive peers (react,
// form, testing, …) that no app manifest declares directly.
function allScoped() {
  const out = {};
  const scan = (sub, scope) => {
    const base = path.join(FRAMEWORK, sub);
    let entries = [];
    try {
      entries = fs.readdirSync(base, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      try {
        const name = JSON.parse(
          fs.readFileSync(path.join(base, e.name, "package.json"), "utf8"),
        ).name;
        if (name && name.startsWith(scope)) out[name] = "link:" + path.join(base, e.name);
      } catch {
        // not a package directory
      }
    }
  };
  scan("packages", "@simplix-react/");
  scan("extensions/simplix-boot/packages", "@simplix-react-ext/");
  scan("extensions/native/packages", "@simplix-react-native/");
  scan("extensions/native/packages", "@simplix-react-native-ext/");
  return out;
}

function readPackage(pkg) {
  if (!ENABLED) return pkg;
  patch(pkg.dependencies);
  patch(pkg.devDependencies);
  patch(pkg.optionalDependencies);
  // At the workspace root, pin the whole framework graph so transitive peers link too.
  if (pkg.name === ROOT_PKG) {
    pkg.devDependencies = Object.assign(pkg.devDependencies || {}, allScoped());
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };

// `node .pnpmfile.cjs status` (pnpm local:status) — report the resolved link profile/path.
// pnpm loads this file via require(), so require.main !== module and this block is skipped
// during install; it only runs on direct invocation.
if (require.main === module) {
  if (process.argv[2] !== "status") {
    console.error("usage: node .pnpmfile.cjs status");
    process.exit(1);
  }
  const c = resolveLinkConfig();
  console.log(`profile:   ${c.profile} (${c.profileSource})`);
  console.log(
    `framework: ${c.frameworkPath} (${c.frameworkExists ? "present" : "absent"}, from ${c.pathSource})`,
  );
  console.log(
    c.enabled
      ? "→ LOCAL — @simplix-react resolved to local source"
      : "→ REGISTRY — @simplix-react resolved to published npm version",
  );
}
