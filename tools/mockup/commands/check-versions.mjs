#!/usr/bin/env node
// Fails when a mockup root's package.json pins a library to another version than the framework
// checkout's lockfile resolves, pins one inexactly, or lacks a library the framework's UI packages
// need. The root is the directory the command runs in unless --root names one.
//   check-versions [--root <dir>] [--framework <checkout>]
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { FRAMEWORK_SCOPE, locateFramework } from "../lib/framework.mjs";
import { parseArgs } from "../lib/fs-util.mjs";
import { frameworkVersions } from "../lib/framework-versions.mjs";
import { frameworkOf } from "../lib/mockup-root.mjs";

const args = parseArgs(process.argv.slice(2));
const root = resolve(args.root ?? process.cwd());
const framework = frameworkOf(root, args.framework);
const { frameworkRoot, packages } = locateFramework({ framework, libraryRoot: root });
if (!frameworkRoot) {
  console.error("check-versions needs a framework checkout (--framework, mockup.config.json framework, or SIMPLIX_FRAMEWORK) for its lockfile");
  process.exit(2);
}
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const pins = { ...manifest.dependencies, ...manifest.devDependencies };
const problems = [];
// `catalog:` and `workspace:` hand the version to the workspace the root lives in, which pins it for
// the product; every other pin is exact and compared with the framework below.
const delegated = (version) => version.startsWith("catalog:") || version.startsWith("workspace:");
const localLinks = new Set();
for (const [name, version] of Object.entries(pins)) {
  if (!version.startsWith("link:")) continue;
  const file = resolve(root, version.slice(5), "package.json");
  if (!existsSync(file)) problems.push(`${name}: local package is missing at ${file}`);
  else if (JSON.parse(readFileSync(file, "utf8")).name !== name) problems.push(`${name}: local package name does not match`);
  else localLinks.add(name);
}
let catalogued = 0;
for (const [name, version] of Object.entries(pins)) {
  if (localLinks.has(name) || name.startsWith(FRAMEWORK_SCOPE)) continue;
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

const resolved = frameworkVersions(frameworkRoot);
let compared = 0;
for (const [lib, version] of Object.entries(pins)) {
  const versions = resolved.get(lib);
  if (!versions || localLinks.has(lib) || lib.startsWith(FRAMEWORK_SCOPE) || delegated(version)) continue;
  compared++;
  if (!versions.has(version)) problems.push(`${lib}@${version} ≠ framework ${[...versions].join(", ")}`);
}
console.log(`versions: ${Object.keys(pins).length} pins in ${root}/package.json, ${catalogued} from the workspace, ${compared} compared with the framework lockfile, ${problems.length} problems`);
for (const p of problems) console.log(`  ✖ ${p}`);
process.exitCode = problems.length > 0 ? 1 : 0;
