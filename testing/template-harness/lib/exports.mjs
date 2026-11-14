import { resolve } from "node:path";
import ts from "typescript";

/**
 * Each export entry of a kit that names a `source`, mapped to the names its source module exports.
 *
 * @param {{ dir: string, manifest: { exports?: Record<string, unknown> } }} kit
 * @returns {Map<string, string[]>}
 */
export function exportSurface(kit) {
  const entries = Object.entries(kit.manifest.exports ?? {}).filter(([, entry]) => typeof entry === "object" && entry?.source);
  const roots = entries.map(([, entry]) => resolve(kit.dir, entry.source));
  const program = ts.createProgram({ rootNames: roots, options: { noEmit: true, jsx: ts.JsxEmit.ReactJSX, moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, skipLibCheck: true, allowJs: false } });
  const checker = program.getTypeChecker();
  const surface = new Map();
  for (const [key, entry] of entries) {
    const source = program.getSourceFile(resolve(kit.dir, entry.source));
    const symbol = source && checker.getSymbolAtLocation(source);
    surface.set(key, symbol ? checker.getExportsOfModule(symbol).map((one) => one.getName()).sort() : []);
  }
  return surface;
}

/**
 * What a design kit's surface lacks of the core kit it extends: an entry of the core's it does not
 * have, and a name the core exports from an entry that the kit's same entry does not. A design kit
 * may export more (its design, its defaults), never less.
 *
 * @param {Map<string, string[]>} kit the design kit's surface
 * @param {Map<string, string[]>} core the core kit's surface
 * @param {{ kit: string, core: string }} names the two package names, for the messages
 * @returns {string[]}
 */
export function surfaceShortfall(kit, core, names) {
  const problems = [];
  for (const [key, exported] of core) {
    const held = kit.get(key);
    if (!held) {
      problems.push(`exports["${key}"]: ${names.core} has it and ${names.kit} does not`);
      continue;
    }
    const lacking = exported.filter((name) => !held.includes(name));
    if (lacking.length > 0) problems.push(`exports["${key}"]: ${names.kit} does not export ${lacking.join(", ")} of ${names.core}`);
  }
  return problems;
}
