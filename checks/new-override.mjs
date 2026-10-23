#!/usr/bin/env node
// Starts a design change to one framework component: copies the framework file to
// designs/<design>/ds/<same path> and records the file's hash and revision in design.json, so
// check-designs can tell when the framework file moves on or the change is adopted upstream.
//   new-override --design <name> --file <path under @simplix-react/ui src, e.g. base/controls/button.tsx>
//                [--framework <checkout>] [--designs <dir>] [--color-theme <preset>] [--base <design>]
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parseArgs, sha256 } from "../lib/fs-util.mjs";
import { locateFramework, revisionOf } from "../lib/framework.mjs";
import { KIT_ROOT } from "../lib/kit-root.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.design || !args.file) {
  console.error("usage: new-override --design <name> --file <ui src path> [--framework <checkout>]");
  process.exit(2);
}
const { uiSrc, uiDir } = locateFramework({ framework: args.framework, libraryRoot: KIT_ROOT });
const source = join(uiSrc, args.file);
if (!existsSync(source)) throw new Error(`no framework file ${args.file} under ${uiSrc}`);
const designDir = join(resolve(args.designs ?? join(KIT_ROOT, "designs")), args.design);
const manifestPath = join(designDir, "design.json");
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : { name: args.design, ...(args.base ? { base: args.base } : {}), ...(args["color-theme"] ? { colorTheme: args["color-theme"] } : {}), overrides: {} };
manifest.overrides ??= {};
if (manifest.overrides[args.file]) throw new Error(`${args.design} already overrides ${args.file}`);
const target = join(designDir, "ds", args.file);
mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
manifest.overrides[args.file] = { frameworkSha256: sha256(source), frameworkRevision: revisionOf(source, uiDir) };
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`designs/${args.design}/ds/${args.file} ← framework ${manifest.overrides[args.file].frameworkRevision.slice(0, 12)}; edit it to make the change`);
