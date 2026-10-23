#!/usr/bin/env node
// Every screen is drawn with the UI kit named in mockup.config.json (`uiKit`). A screen file may
// import only that kit, React, Storybook types, its own fixtures and locales, and the mockup
// settings hook; it may not lay itself out with className or style. Anything else needs a
// `// ui-kit-exception: <reason>` line directly above it and is counted, because a screen type the
// kit lacks belongs in the kit, not in the screen.
//   check-screens [--root <mockup root>]
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { listFiles, parseArgs } from "../lib/fs-util.mjs";

const args = parseArgs(process.argv.slice(2));
const root = resolve(args.root ?? process.cwd());
const configPath = join(root, "mockup.config.json");
if (!existsSync(configPath)) {
  console.error(`no mockup.config.json in ${root}`);
  process.exit(2);
}
const config = JSON.parse(readFileSync(configPath, "utf8"));
if (!config.uiKit) {
  console.error(`${configPath}: "uiKit" names no UI kit package; every screen is drawn with one`);
  process.exit(2);
}
const allowed = [
  (spec) => spec === config.uiKit || spec.startsWith(`${config.uiKit}/`),
  (spec) => spec === "react",
  (spec) => spec.startsWith("@storybook/"),
  (spec) => /^(\.\.\/)+fixtures\//.test(spec) || /^\.\/fixtures\//.test(spec),
  (spec) => /^(\.\.\/)+locales\//.test(spec),
  (spec) => /kit\/storybook\/mockup-settings(\.tsx?)?$/.test(spec),
  ...(config.screenImports ?? []).map((prefix) => (spec) => spec === prefix || spec.startsWith(`${prefix}/`)),
];
const EXCEPTION = /\/\/\s*ui-kit-exception:\s*\S/;

const violations = [];
const exceptions = [];
const files = listFiles(join(root, "screens"), (rel, isDir) => isDir || /\.[jt]sx?$/.test(rel));
for (const rel of files) {
  const lines = readFileSync(join(root, "screens", rel), "utf8").split("\n");
  lines.forEach((line, i) => {
    const where = `screens/${rel}:${i + 1}`;
    const excused = i > 0 && EXCEPTION.test(lines[i - 1]);
    const imported = line.match(/^\s*(?:import|export)\b[^"']*?from\s*["']([^"']+)["']|^\s*import\s*["']([^"']+)["']/);
    const spec = imported?.[1] ?? imported?.[2];
    if (spec && !allowed.some((ok) => ok(spec))) {
      (excused ? exceptions : violations).push(`${where}: imports ${spec}`);
    }
    if (/\b(className|style)\s*=/.test(line)) {
      (excused ? exceptions : violations).push(`${where}: lays out with ${line.match(/\b(className|style)/)[1]}`);
    }
  });
}
console.log(`screens: ${files.length} files with ${config.uiKit}, ${violations.length} violations, ${exceptions.length} declared exceptions`);
for (const v of violations) console.log(`  ✖ ${v}`);
for (const e of exceptions) console.log(`  ⚠ exception ${e}`);
process.exitCode = violations.length > 0 ? 1 : 0;
