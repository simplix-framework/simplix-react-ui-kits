#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { exportSurface } from "./lib/exports.mjs";

/**
 * Proves two kits of one family generate the same product: the projects the harness generated from
 * each are equal file by file once each kit's own values (`{{@kit.package}}`, `{{@kit.label}}`,
 * `{{@kit.id}}`) are put back as tokens, the kits export the same entries with the same names, and
 * they fence the same imports.
 *
 * Usage: node testing/template-harness/parity.mjs <kit directory> <kit directory>
 *
 * Run after the harness has generated both kits' projects. A file may differ only where it was
 * rendered from a template one of the kits declares in `simplix.overrides`.
 */

const here = dirname(fileURLToPath(import.meta.url));
const SKIP = new Set(["node_modules", ".simplix", "simplix.config.ts"]);
const STAMP = /@simplix-render [0-9a-f]{12}/g;

function fail(lines) {
  for (const line of lines) process.stderr.write(`✖ ${line}\n`);
  process.exit(1);
}

function kitOf(dir) {
  const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
  const label = manifest.name.replace(/^@[^/]+\//, "");
  return { dir, manifest, name: manifest.name, label, id: manifest.simplix?.id, out: join(here, ".out", label) };
}

function files(dir, base = dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...files(path, base));
    else found.push(relative(base, path));
  }
  return found.sort();
}

function escape(text) {
  return text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

/** The text with the kit's values put back as the tokens they were written from, longest first. */
function tokenized(text, kit) {
  let out = text.replace(STAMP, "@simplix-render <fingerprint>");
  out = out.replace(new RegExp(escape(kit.name), "g"), "{{@kit.package}}");
  out = out.replace(new RegExp(`(?<![\\w-])${escape(kit.label)}(?![\\w-])`, "g"), "{{@kit.label}}");
  if (kit.id) out = out.replace(new RegExp(`@simplix-generated ([a-z]+)/${escape(kit.id)}-`, "g"), "@simplix-generated $1/{{@kit.id}}-");
  return out;
}

/** The generated id stems a declared override renders (`app-shell.top-bar` → `app-shell-top-bar`). */
function overriddenStems(kit) {
  return Object.keys(kit.manifest.simplix?.overrides ?? {}).map((name) => name.replace(/\.stories$/, "").replace(/\./g, "-"));
}

function renderedFromOverride(text, stems) {
  const id = /@simplix-generated [a-z]+\/[a-z0-9]+-([a-z0-9-]+)/.exec(text)?.[1];
  return id !== undefined && stems.includes(id);
}

const [first, second] = process.argv.slice(2).map((arg) => kitOf(resolve(arg)));
if (!first || !second) fail(["usage: parity.mjs <kit directory> <kit directory>"]);
for (const kit of [first, second]) {
  if (!existsSync(kit.out)) fail([`${kit.name}: no generated project at ${relative(process.cwd(), kit.out)}; run the harness on it first`]);
}

const problems = [];
const stems = [...overriddenStems(first), ...overriddenStems(second)];
const left = files(first.out);
const right = files(second.out);
for (const file of left.filter((one) => !right.includes(one))) problems.push(`${file}: generated from ${first.name} only`);
for (const file of right.filter((one) => !left.includes(one))) problems.push(`${file}: generated from ${second.name} only`);
let compared = 0;
for (const file of left.filter((one) => right.includes(one))) {
  const a = readFileSync(join(first.out, file), "utf-8");
  const b = readFileSync(join(second.out, file), "utf-8");
  compared += 1;
  if (tokenized(a, first) === tokenized(b, second)) continue;
  if (renderedFromOverride(a, stems) || renderedFromOverride(b, stems)) continue;
  problems.push(`${file}: ${first.name} and ${second.name} generate it differently, and neither declares the template in simplix.overrides`);
}

const surfaceA = exportSurface(first);
const surfaceB = exportSurface(second);
for (const key of new Set([...surfaceA.keys(), ...surfaceB.keys()])) {
  const a = surfaceA.get(key);
  const b = surfaceB.get(key);
  if (!a || !b) {
    problems.push(`exports["${key}"]: only ${a ? first.name : second.name} has it`);
    continue;
  }
  const onlyA = a.filter((name) => !b.includes(name));
  const onlyB = b.filter((name) => !a.includes(name));
  if (onlyA.length > 0) problems.push(`exports["${key}"]: ${first.name} alone exports ${onlyA.join(", ")}`);
  if (onlyB.length > 0) problems.push(`exports["${key}"]: ${second.name} alone exports ${onlyB.join(", ")}`);
}

// The imports a kit refuses outside itself are part of what it is: a fence one kit lacks lets a
// screen drawn with it place framework parts the other kit's screens may not.
const { kitFenceOf } = await import(pathToFileURL(join(here, "../../node_modules/@simplix-react/cli/dist/index.js")).href);
if (typeof kitFenceOf !== "function") fail(["the installed @simplix-react/cli reads no fence through a kit chain (kitFenceOf); run pnpm local:link to use a framework checkout until it is released"]);
const fenceOf = async (kit) => tokenized(JSON.stringify((await kitFenceOf(kit.out, kit.dir)) ?? [], null, 2), kit);
const fenceA = await fenceOf(first);
const fenceB = await fenceOf(second);
if (fenceA !== fenceB) problems.push(`simplix.fence: ${first.name} and ${second.name} fence different imports or say different things about them`);

if (problems.length > 0) fail([`${first.name} and ${second.name} are not at parity:`, ...problems]);
process.stdout.write(`✔ ${first.name} = ${second.name}: ${compared} generated file(s) and ${surfaceA.size} export entr${surfaceA.size === 1 ? "y" : "ies"} agree\n`);
