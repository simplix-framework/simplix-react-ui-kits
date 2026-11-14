#!/usr/bin/env node
// Keeps every design kit a segment-by-segment re-export of the core kit it extends.
//   node scripts/sync-design-kits.mjs           writes what is missing (run after adding a segment to a core kit)
//   node scripts/sync-design-kits.mjs --check   fails where a design kit and its core kit disagree
//   node scripts/sync-design-kits.mjs --test    proves the check on its own hit and miss cases
//
// A design kit is a package under `packages/` whose `simplix.extends` names a core kit of this
// workspace. For every export entry of the core kit that names a `source` (a segment), the design
// kit holds an export entry of the same key and a source file that re-exports the core's segment;
// a design kit's own additions to a segment (its design, its defaults) are written beside that
// line and kept. A segment entry the core kit does not have is refused: a design kit holds no
// component of its own. The build entries are read from `exports` (`config/tsup/entries.mjs`), so
// a segment added to a core kit's `exports` reaches every design kit with one run of this script.
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/** The path of a segment below `src`, without extension: `./badge` is `badge/index`, `./clipboard/fallback` is itself. */
function segmentPath(key, coreSource) {
  const name = key.replace(/^\.\//, "");
  return /\/index\.[cm]?[jt]sx?$/.test(coreSource) ? `${name}/index` : name;
}

function segments(manifest) {
  return Object.entries(manifest.exports ?? {}).filter(([, entry]) => typeof entry === "object" && entry !== null && typeof entry.source === "string");
}

/**
 * What a design kit must hold for its core kit, and what it holds that the core kit does not.
 *
 * @returns {{ problems: string[], exports: Record<string, object>, files: Record<string, string> }}
 *   the problems a check reports, the export entries to add or replace, and the files to write
 */
export function plan(kit, core, readKitFile) {
  const problems = [];
  const exports = {};
  const files = {};
  const coreKeys = new Set();
  for (const [key, coreEntry] of segments(core)) {
    coreKeys.add(key);
    const path = segmentPath(key, coreEntry.source);
    const wanted = { source: `./src/${path}.ts`, types: `./src/${path}.ts`, import: `./dist/${path}.js` };
    const held = kit.exports?.[key];
    if (JSON.stringify(held) !== JSON.stringify(wanted)) {
      problems.push(`${kit.name}: exports["${key}"] ${held === undefined ? "is missing" : "differs from the entry its core kit's segment needs"}`);
      exports[key] = wanted;
    }
    const line = `export * from "${core.name}/${key.replace(/^\.\//, "")}";`;
    const text = readKitFile(`src/${path}.ts`);
    if (text === undefined) {
      problems.push(`${kit.name}: src/${path}.ts is missing`);
      files[`src/${path}.ts`] = `${line}\n`;
    } else if (!text.split("\n").some((written) => written.trim() === line)) {
      problems.push(`${kit.name}: src/${path}.ts does not re-export ${core.name}/${key.replace(/^\.\//, "")} (${line})`);
    }
  }
  for (const [key] of segments(kit)) {
    if (!coreKeys.has(key)) problems.push(`${kit.name}: exports["${key}"] is a segment ${core.name} does not have; a design kit holds no component of its own`);
  }
  return { problems, exports, files };
}

/** `exports` with `added` put in, each new key placed before the first entry that is not a segment. */
export function withExports(current, added) {
  const out = {};
  const pending = Object.entries(added).filter(([key]) => !(key in current));
  let placed = false;
  for (const [key, entry] of Object.entries(current)) {
    const segment = typeof entry === "object" && entry !== null && typeof entry.source === "string";
    if (!segment && !placed) {
      for (const [name, value] of pending) out[name] = value;
      placed = true;
    }
    out[key] = key in added ? added[key] : entry;
  }
  if (!placed) for (const [name, value] of pending) out[name] = value;
  return out;
}

function readManifest(dir) {
  const file = join(dir, "package.json");
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf-8")) : undefined;
}

function run(packagesDir, write, say = (line) => process.stdout.write(line)) {
  const packages = readdirSync(packagesDir)
    .map((name) => ({ dir: join(packagesDir, name), manifest: readManifest(join(packagesDir, name)) }))
    .filter((one) => one.manifest !== undefined);
  const byName = new Map(packages.map((one) => [one.manifest.name, one]));
  const problems = [];
  let kits = 0;
  for (const kit of packages) {
    const base = kit.manifest.simplix?.extends;
    if (base === undefined) continue;
    const core = byName.get(base);
    if (!core) {
      problems.push(`${kit.manifest.name}: simplix.extends names ${base}, which is not a package of this workspace`);
      continue;
    }
    kits += 1;
    const read = (path) => (existsSync(join(kit.dir, path)) ? readFileSync(join(kit.dir, path), "utf-8") : undefined);
    const found = plan(kit.manifest, core.manifest, read);
    if (!write) {
      problems.push(...found.problems);
      continue;
    }
    for (const [path, text] of Object.entries(found.files)) {
      mkdirSync(dirname(join(kit.dir, path)), { recursive: true });
      writeFileSync(join(kit.dir, path), text);
      say(`wrote ${relative(process.cwd(), join(kit.dir, path))}\n`);
    }
    if (Object.keys(found.exports).length > 0) {
      const manifest = { ...kit.manifest, exports: withExports(kit.manifest.exports ?? {}, found.exports) };
      writeFileSync(join(kit.dir, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
      say(`wrote ${Object.keys(found.exports).length} export entr${Object.keys(found.exports).length === 1 ? "y" : "ies"} of ${kit.manifest.name}\n`);
    }
    // What a run cannot write: a file that exists without the re-export, a segment of the kit's own.
    const after = plan(readManifest(kit.dir), core.manifest, read);
    problems.push(...after.problems);
  }
  return { problems, kits };
}

function selftest() {
  const core = { name: "@x/area-core", exports: { "./api": { source: "./src/api/index.ts" }, "./badge": { source: "./src/badge/index.tsx" }, "./clip/fallback": { source: "./src/clip/fallback.ts" }, "./styles/*": "./src/styles/*" } };
  const entry = (path) => ({ source: `./src/${path}.ts`, types: `./src/${path}.ts`, import: `./dist/${path}.js` });
  const whole = { name: "@x/area-one", exports: { "./api": entry("api/index"), "./badge": entry("badge/index"), "./clip/fallback": entry("clip/fallback"), "./styles/*": "./src/styles/*" } };
  const filesOf = (over = {}) => ({ "src/api/index.ts": 'export * from "@x/area-core/api";\n', "src/badge/index.ts": 'import { a } from "a";\n\nexport * from "@x/area-core/badge";\nexport const OWN = a;\n', "src/clip/fallback.ts": 'export * from "@x/area-core/clip/fallback";\n', ...over });
  const check = (kit, files) => plan(kit, core, (path) => files[path]).problems;
  const failures = [];
  const good = check(whole, filesOf());
  if (good.length > 0) failures.push(`miss: a kit at parity is refused (${good.join("; ")})`);
  const bad = {
    "an export entry missing": [{ ...whole, exports: { "./api": entry("api/index"), "./clip/fallback": entry("clip/fallback") } }, filesOf()],
    "an export entry pointing elsewhere": [{ ...whole, exports: { ...whole.exports, "./badge": entry("badge/other") } }, filesOf()],
    "a segment file missing": [whole, filesOf({ "src/api/index.ts": undefined })],
    "a segment file without the re-export": [whole, filesOf({ "src/badge/index.ts": "export const OWN = 1;\n" })],
    "a segment of the kit's own": [{ ...whole, exports: { ...whole.exports, "./extra": entry("extra/index") } }, filesOf()],
  };
  for (const [label, [kit, files]] of Object.entries(bad)) if (check(kit, files).length === 0) failures.push(`no hit for ${label}`);
  // A write on a real tree: the missing entry and file appear, the kit's own lines stay, and the check then holds.
  const root = mkdtempSync(join(tmpdir(), "sync-design-kits-"));
  try {
    const put = (path, text) => {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), text);
    };
    put("core/package.json", JSON.stringify(core));
    put("one/package.json", JSON.stringify({ name: "@x/area-one", simplix: { extends: "@x/area-core" }, exports: { "./badge": entry("badge/index"), "./styles/*": "./src/styles/*" } }));
    put("one/src/badge/index.ts", filesOf()["src/badge/index.ts"]);
    if (run(root, false).problems.length === 0) failures.push("no hit for a kit two segments short on disk");
    const written = run(root, true, () => {});
    if (written.problems.length > 0) failures.push(`a write leaves problems (${written.problems.join("; ")})`);
    if (run(root, false).problems.length > 0) failures.push("the check fails after a write");
    const manifest = JSON.parse(readFileSync(join(root, "one/package.json"), "utf-8"));
    if (Object.keys(manifest.exports).join(" ") !== "./badge ./api ./clip/fallback ./styles/*") failures.push(`the written exports are ordered ${Object.keys(manifest.exports).join(" ")}`);
    if (readFileSync(join(root, "one/src/badge/index.ts"), "utf-8") !== filesOf()["src/badge/index.ts"]) failures.push("a write changed a file the kit wrote itself");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  process.stdout.write(failures.length === 0 ? `sync-design-kits selftest: hit ${Object.keys(bad).length + 1}, miss 0\n` : `sync-design-kits selftest FAILED\n${failures.join("\n")}\n`);
  process.exit(failures.length === 0 ? 0 : 1);
}

if (process.argv.includes("--test")) selftest();

const packagesDir = join(dirname(dirname(fileURLToPath(import.meta.url))), "packages");
const write = !process.argv.includes("--check");
const { problems, kits } = run(packagesDir, write);
if (problems.length > 0) {
  for (const problem of problems) process.stderr.write(`✖ ${problem}\n`);
  if (!write) process.stderr.write("run `node scripts/sync-design-kits.mjs` to write the missing entries and files\n");
  process.exit(1);
}
process.stdout.write(`✔ ${kits} design kit(s) re-export every segment of the core kit they extend\n`);
