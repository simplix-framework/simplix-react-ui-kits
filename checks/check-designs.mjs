#!/usr/bin/env node
// Validates every kit design against the framework it changes:
//   ✖ an override with no framework file at its path, or not recorded in design.json
//   ✖ an override identical to the framework file: adopted upstream (or never changed), delete it
//   ✖ the framework file changed since the override was written: reconcile, then re-record
//   ✖ an unknown colour preset, a bad base chain, a malformed tokens.css
//   [--design-dirs a:b] [--framework <checkout>]
import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { designChain, loadDesigns, scopeDesignTokens } from "../lib/designs.mjs";
import { locateFramework } from "../lib/framework.mjs";
import { listFiles, parseArgs, sha256 } from "../lib/fs-util.mjs";
import { KIT_ROOT } from "../lib/kit-root.mjs";

const args = parseArgs(process.argv.slice(2));
const extra = (args["design-dirs"] ?? process.env.KIT_DESIGN_DIRS ?? "").split(":").filter(Boolean).map((d) => resolve(d));
const designs = loadDesigns([join(KIT_ROOT, "designs"), ...extra]);
// The framework comes from --framework, then SIMPLIX_FRAMEWORK, then the `framework` the mockup root
// names in mockup.config.json (resolved from that root), and only then the packages installed here.
const configPath = resolve("mockup.config.json");
const configured = existsSync(configPath) ? JSON.parse(readFileSync(configPath, "utf8")).framework : undefined;
const framework = args.framework ?? process.env.SIMPLIX_FRAMEWORK ?? (configured ? resolve(configured) : undefined);
const { uiSrc } = locateFramework({ framework, libraryRoot: KIT_ROOT });
const presets = new Set(listFiles(join(uiSrc, "theme", "presets"), (r, isDir) => !isDir && r.endsWith(".css")).map((f) => basename(f, ".css")));
const allowedKeys = new Set(["name", "description", "base", "colorTheme", "overrides"]);
const problems = [];
let overrideCount = 0;

for (const [name, design] of designs) {
  const where = `designs/${name}`;
  for (const key of Object.keys(design)) if (key !== "dir" && !allowedKeys.has(key)) problems.push(`${where}: unknown key "${key}"`);
  if (design.colorTheme && design.colorTheme !== "default" && !presets.has(design.colorTheme)) {
    problems.push(`${where}: colorTheme "${design.colorTheme}" is not a framework preset (${[...presets].join(", ")})`);
  }
  try {
    designChain(designs, name);
  } catch (error) {
    problems.push(`${where}: ${error.message}`);
  }
  const tokens = join(design.dir, "tokens.css");
  if (existsSync(tokens)) {
    try {
      scopeDesignTokens(readFileSync(tokens, "utf8"), name, tokens);
    } catch (error) {
      problems.push(`${where}: ${error.message}`);
    }
  }
  const files = listFiles(join(design.dir, "ds"), (r, isDir) => isDir || /\.[jt]sx?$/.test(r));
  for (const rel of files) {
    overrideCount++;
    const framework = join(uiSrc, rel);
    const record = design.overrides[rel];
    if (!existsSync(framework)) {
      problems.push(`${where}/ds/${rel}: no framework file at this path; an override replaces a framework file by its own path`);
      continue;
    }
    if (!record) problems.push(`${where}/ds/${rel}: not recorded in design.json overrides (start overrides with new-override)`);
    const current = sha256(framework);
    if (current === sha256(join(design.dir, "ds", rel))) {
      problems.push(`${where}/ds/${rel}: identical to the framework file; the change is adopted (or was never made), so delete it`);
    } else if (record && record.frameworkSha256 !== current) {
      problems.push(`${where}/ds/${rel}: the framework file changed since ${record.frameworkRevision.slice(0, 12)}; carry the framework change into the override, then record the new hash`);
    }
  }
  for (const rel of Object.keys(design.overrides)) {
    if (!files.includes(rel)) problems.push(`${where}: design.json records ${rel} but ds/${rel} does not exist`);
  }
}
console.log(`designs: ${designs.size}${designs.size ? ` (${[...designs.keys()].join(", ")})` : ""}, ${overrideCount} component overrides, ${problems.length} problems`);
for (const p of problems) console.log(`  ✖ ${p}`);
process.exitCode = problems.length > 0 ? 1 : 0;
