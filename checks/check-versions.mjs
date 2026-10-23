#!/usr/bin/env node
// Fails when a package.json (the kit's, or a mockup root's with --root) pins a library to another
// version than the framework checkout's lockfile resolves, pins one inexactly, or lacks a library
// the framework's UI packages need.
//   check-versions [--root <dir>] [--framework <checkout>]
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { FRAMEWORK_SCOPE, locateFramework } from "../lib/framework.mjs";
import { parseArgs } from "../lib/fs-util.mjs";
import { KIT_ROOT } from "../lib/kit-root.mjs";

const args = parseArgs(process.argv.slice(2));
const root = resolve(args.root ?? KIT_ROOT);
const { frameworkRoot, packages } = locateFramework({ framework: args.framework, libraryRoot: root });
if (!frameworkRoot) {
  console.error("check-versions needs a framework checkout (--framework or SIMPLIX_FRAMEWORK) for its lockfile");
  process.exit(2);
}
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const pins = { ...manifest.dependencies, ...manifest.devDependencies };
const problems = [];
// `catalog:` and `workspace:` hand the version to the workspace the root lives in, which pins it for
// the product; every other pin is exact and compared with the framework below.
const delegated = (version) => version.startsWith("catalog:") || version.startsWith("workspace:");
let catalogued = 0;
for (const [name, version] of Object.entries(pins)) {
  if (name.startsWith(FRAMEWORK_SCOPE)) continue;
  if (delegated(version)) {
    catalogued++;
    continue;
  }
  if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) problems.push(`${name}@${version} is not an exact version`);
}

// Libraries the rendered framework packages import at runtime. A root that takes the framework
// from its workspace (`simplix-react` through the catalog) gets them with it.
const fromWorkspace = typeof pins["simplix-react"] === "string" && delegated(pins["simplix-react"]);
const rendered = fromWorkspace ? [] : ["ui", "i18n", "headless", "api"].map((n) => packages.get(`${FRAMEWORK_SCOPE}${n}`)).filter(Boolean);
for (const { manifest: m } of rendered) {
  for (const name of Object.keys({ ...m.dependencies, ...m.peerDependencies })) {
    if (!name.startsWith(FRAMEWORK_SCOPE) && !pins[name]) problems.push(`${name} is used by ${m.name} but not in ${root}/package.json`);
  }
}

// importers.<path>.<section>.<name>.version in pnpm-lock.yaml
const lockfile = join(frameworkRoot, "pnpm-lock.yaml");
if (!existsSync(lockfile)) throw new Error(`no pnpm-lock.yaml in ${frameworkRoot}`);
const text = readFileSync(lockfile, "utf8");
const importers = text.slice(text.indexOf("\nimporters:"), text.indexOf("\npackages:"));
const resolved = new Map();
let importer;
let name;
for (const line of importers.split("\n")) {
  let m;
  if ((m = line.match(/^  (\S.*):$/))) importer = m[1];
  else if ((m = line.match(/^      '?([^':]+)'?:$/))) name = m[1];
  else if ((m = line.match(/^        version: ([^\s(]+)/)) && importer && name && !m[1].startsWith("link:")) {
    if (importer.startsWith("packages/") || importer.startsWith("apps/")) {
      (resolved.get(name) ?? resolved.set(name, new Set()).get(name)).add(m[1]);
    }
  }
}
let compared = 0;
for (const [lib, version] of Object.entries(pins)) {
  const versions = resolved.get(lib);
  if (!versions || lib.startsWith(FRAMEWORK_SCOPE) || delegated(version)) continue;
  compared++;
  if (!versions.has(version)) problems.push(`${lib}@${version} ≠ framework ${[...versions].join(", ")}`);
}
console.log(`versions: ${Object.keys(pins).length} pins in ${root}/package.json, ${catalogued} from the workspace, ${compared} compared with the framework lockfile, ${problems.length} problems`);
for (const p of problems) console.log(`  ✖ ${p}`);
process.exitCode = problems.length > 0 ? 1 : 0;
