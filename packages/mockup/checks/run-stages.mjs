#!/usr/bin/env node
// Runs the check stages a mockup root declares and reports every failure together.
//   run-stages [--root <mockup root>]
//
// The stages are the root's `mockup.config.json` key `checkStages`: `[{ "name", "command" }]`, run in
// order from the root with a shell. Every stage runs; the exit code is 1 when any failed, 2 when
// the list is missing or malformed.
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "../lib/fs-util.mjs";
import { runStages, stageProblems, summaryLines } from "../lib/run-stages.mjs";

const args = parseArgs(process.argv.slice(2));
const root = resolve(args.root ?? process.cwd());
const configPath = join(root, "mockup.config.json");
if (!existsSync(configPath)) {
  console.error(`no mockup.config.json in ${root}`);
  process.exit(2);
}
const stages = JSON.parse(readFileSync(configPath, "utf8")).checkStages;
const problems = stageProblems(stages);
if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  process.exit(2);
}
const outcome = runStages(stages, { cwd: root });
for (const line of summaryLines(outcome)) console.log(line);
process.exit(outcome.failed.length === 0 ? 0 : 1);
