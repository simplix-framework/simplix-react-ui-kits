// Reads kit designs and resolves a design's base chain. "framework" is the implicit root: the
// framework as it ships, with no directory of its own.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const ROOT_DESIGN = "framework";

/**
 * Loads every `<dir>/<name>/design.json` under the given directories. A name declared twice is
 * an error, so a mockup root cannot silently shadow a kit design.
 */
export function loadDesigns(designDirs) {
  const designs = new Map();
  for (const dir of designDirs) {
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const manifestPath = join(dir, entry.name, "design.json");
      if (!existsSync(manifestPath)) continue;
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      if (manifest.name !== entry.name) {
        throw new Error(`${manifestPath}: name "${manifest.name}" differs from its directory "${entry.name}"`);
      }
      if (manifest.name === ROOT_DESIGN) throw new Error(`${manifestPath}: "${ROOT_DESIGN}" is reserved for the framework itself`);
      if (designs.has(manifest.name)) {
        throw new Error(`design "${manifest.name}" is declared in both ${designs.get(manifest.name).dir} and ${join(dir, entry.name)}`);
      }
      designs.set(manifest.name, { overrides: {}, ...manifest, dir: join(dir, entry.name) });
    }
  }
  return designs;
}

/** Returns the design and its bases, nearest first, without the implicit framework root. */
export function designChain(designs, name) {
  const chain = [];
  const seen = new Set();
  for (let current = name; current !== ROOT_DESIGN; ) {
    if (seen.has(current)) throw new Error(`design base cycle: ${[...seen, current].join(" → ")}`);
    seen.add(current);
    const design = designs.get(current);
    if (!design) throw new Error(`unknown design "${current}"; known: ${[ROOT_DESIGN, ...designs.keys()].join(", ")}`);
    chain.push(design);
    current = design.base ?? ROOT_DESIGN;
  }
  return chain;
}

/** The framework colour preset a design renders with: its own, else the nearest base's. */
export function colorThemeOf(chain) {
  return chain.find((d) => d.colorTheme)?.colorTheme ?? "default";
}

/**
 * Scopes a design's token stylesheet to that design. The file is written like the framework's
 * theme/base.css, with top-level `:root` and `.dark` blocks; each becomes a selector that applies
 * only under `[data-kit-design="<name>"]` and outranks the framework's presets in the same mode.
 */
export function scopeDesignTokens(css, name, file) {
  const scope = `:where([data-kit-design="${name}"])`;
  const light = `${scope}:not(.dark), ${scope} [data-color-theme]:not(.dark)`;
  const dark = `${scope}.dark, ${scope} .dark, ${scope} [data-color-theme].dark`;
  let depth = 0;
  let out = "";
  let i = 0;
  while (i < css.length) {
    if (css.startsWith("/*", i)) {
      const end = css.indexOf("*/", i + 2);
      const stop = end === -1 ? css.length : end + 2;
      out += css.slice(i, stop);
      i = stop;
      continue;
    }
    const ch = css[i];
    if (depth === 0 && ch !== "{" && ch !== "}" && !/\s/.test(ch)) {
      const brace = css.indexOf("{", i);
      if (brace === -1) throw new Error(`${file}: unterminated rule`);
      const selector = css.slice(i, brace).trim();
      if (selector === ":root") out += light + " ";
      else if (selector === ".dark") out += dark + " ";
      else throw new Error(`${file}: only top-level :root and .dark blocks are allowed, found "${selector}"`);
      i = brace;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    out += ch;
    i++;
  }
  return out;
}
