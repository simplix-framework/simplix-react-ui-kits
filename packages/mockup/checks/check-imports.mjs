#!/usr/bin/env node
// A design override reaches the framework file it replaces through @kit-base/<path>. Importing
// @simplix-react/* from a design routes back through the override itself, so it is refused.
//   [--design-dirs a:b]
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { listFiles, parseArgs } from "../lib/fs-util.mjs";
import { KIT_ROOT } from "../lib/kit-root.mjs";

const args = parseArgs(process.argv.slice(2));
const dirs = [join(KIT_ROOT, "designs"), ...(args["design-dirs"] ?? process.env.KIT_DESIGN_DIRS ?? "").split(":").filter(Boolean).map((d) => resolve(d))];
const problems = [];
let files = 0;
for (const dir of dirs) {
  for (const rel of listFiles(dir, (r, isDir) => isDir || /\.m?[jt]sx?$/.test(r))) {
    files++;
    readFileSync(join(dir, rel), "utf8").split("\n").forEach((line, i) => {
      if (/(from|import)\s*\(?\s*["']@simplix-react\//.test(line)) problems.push(`${join(dir, rel)}:${i + 1}: ${line.trim()}`);
    });
  }
}
console.log(`imports: ${files} design files scanned, ${problems.length} framework imports`);
for (const p of problems) console.log(`  ✖ ${p}`);
process.exitCode = problems.length > 0 ? 1 : 0;
