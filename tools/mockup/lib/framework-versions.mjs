// The library versions a framework checkout resolves, read from its lockfile: the one statement of
// which version of a library a mockup root pins.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Every version the framework's own packages and apps resolve a library to.
 *
 * @param {string} frameworkRoot a simplix-react checkout
 * @returns {Map<string, Set<string>>} library name to the versions its importers resolve
 */
export function frameworkVersions(frameworkRoot) {
  const lockfile = join(frameworkRoot, "pnpm-lock.yaml");
  if (!existsSync(lockfile)) throw new Error(`no pnpm-lock.yaml in ${frameworkRoot}`);
  const text = readFileSync(lockfile, "utf8");
  // importers.<path>.<section>.<name>.version
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
  return resolved;
}

/** `a` and `b` as release versions, compared part by part; a pre-release sorts below its release. */
function compareVersions(a, b) {
  const [coreA, preA = ""] = a.split("-");
  const [coreB, preB = ""] = b.split("-");
  const partsA = coreA.split(".").map(Number);
  const partsB = coreB.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((partsA[i] ?? 0) !== (partsB[i] ?? 0)) return (partsA[i] ?? 0) - (partsB[i] ?? 0);
  if (preA === preB) return 0;
  if (preA === "") return 1;
  if (preB === "") return -1;
  return preA < preB ? -1 : 1;
}

/** The version a new mockup root pins a library to: the newest the framework resolves, or undefined. */
export function frameworkPin(resolved, name) {
  const versions = [...(resolved.get(name) ?? [])];
  return versions.sort(compareVersions).at(-1);
}
