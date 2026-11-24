#!/usr/bin/env node
// Runs one command of the mockup tooling from a mockup root.
//   simplix-mockup <command> [arguments]
// A command is a file of `checks/`; its own header names its arguments.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { KIT_ROOT } from "../lib/kit-root.mjs";

const dir = join(KIT_ROOT, "checks");
const commands = readdirSync(dir).filter((name) => name.endsWith(".mjs")).map((name) => name.slice(0, -4)).sort();
const [command, ...rest] = process.argv.slice(2);
if (!command || !existsSync(join(dir, `${command}.mjs`))) {
  console.error(`${command ? `simplix-mockup: no command "${command}"\n` : ""}usage: simplix-mockup <command> [arguments]\ncommands: ${commands.join(", ")}`);
  process.exit(2);
}
const run = spawnSync(process.execPath, [join(dir, `${command}.mjs`), ...rest], { stdio: "inherit" });
if (run.error) throw run.error;
process.exit(run.status ?? 1);
