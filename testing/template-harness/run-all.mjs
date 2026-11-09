#!/usr/bin/env node
import { spawn } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Runs the template harness on every kit of the workspace at once, then the parity check on every
 * pair of kits that extend the same base.
 *
 * A kit is a package under `packages/` that declares `simplix.id`. Each run is timed, and the
 * slowest is named, since it sets the wall time. `--parity-only` skips the generation and compares
 * the projects each kit's own `test:templates` already generated.
 */

const here = dirname(fileURLToPath(import.meta.url));
const packagesDir = resolve(here, "../../packages");

const kits = readdirSync(packagesDir)
  .map((name) => join(packagesDir, name))
  .map((dir) => {
    try {
      return { dir, manifest: JSON.parse(readFileSync(join(dir, "package.json"), "utf-8")) };
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "ENOTDIR") return undefined;
      throw error;
    }
  })
  .filter((kit) => kit?.manifest.simplix?.id !== undefined);

function run(script, args) {
  const started = Date.now();
  return new Promise((done) => {
    const child = spawn(process.execPath, [join(here, script), ...args], { stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("close", (code) => done({ label: `${script} ${args.map((arg) => arg.replace(`${packagesDir}/`, "")).join(" ")}`, code, output, seconds: (Date.now() - started) / 1000 }));
  });
}

function report(results) {
  for (const result of results) process.stdout.write(`${result.output.trimEnd()}\n  (${result.seconds.toFixed(1)}s)\n`);
  const slowest = results.reduce((a, b) => (b.seconds > a.seconds ? b : a), results[0]);
  if (slowest) process.stdout.write(`slowest: ${slowest.label}, ${slowest.seconds.toFixed(1)}s\n`);
  return results.every((result) => result.code === 0);
}

if (kits.length === 0) {
  process.stderr.write("✖ no package under packages/ declares simplix.id\n");
  process.exit(1);
}

const parityOnly = process.argv.includes("--parity-only");
const generated = parityOnly || report(await Promise.all(kits.map((kit) => run("harness.mjs", [kit.dir]))));

const families = new Map();
for (const kit of kits) {
  const base = kit.manifest.simplix.extends;
  if (base) families.set(base, [...(families.get(base) ?? []), kit]);
}
const pairs = [...families.values()].flatMap((members) => members.slice(1).map((kit) => [members[0], kit]));
const agreed = generated ? report(await Promise.all(pairs.map(([a, b]) => run("parity.mjs", [a.dir, b.dir])))) : false;

process.exit(generated && agreed ? 0 : 1);
