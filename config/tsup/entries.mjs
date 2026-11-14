import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * The build entries of a package, read from its `exports`: every entry that names a `source` builds
 * that source to the file its `import` condition names, so a segment is declared once, in
 * `package.json`.
 *
 * @param {string} configUrl the `import.meta.url` of the package's `tsup.config.ts`
 * @returns {Record<string, string>} the output name (without extension) of each entry and its source
 */
export function exportEntries(configUrl) {
  const manifestFile = fileURLToPath(new URL("./package.json", configUrl));
  const manifest = JSON.parse(readFileSync(manifestFile, "utf-8"));
  const entries = {};
  for (const [key, entry] of Object.entries(manifest.exports ?? {})) {
    if (typeof entry !== "object" || entry === null || typeof entry.source !== "string") continue;
    const built = /^\.\/dist\/(.+)\.js$/.exec(entry.import ?? "");
    if (!built) throw new Error(`${manifestFile}: exports["${key}"] names a source and no ./dist/*.js import to build it to`);
    entries[built[1]] = entry.source.replace(/^\.\//, "");
  }
  if (Object.keys(entries).length === 0) throw new Error(`${manifestFile}: no export entry names a source`);
  return entries;
}
