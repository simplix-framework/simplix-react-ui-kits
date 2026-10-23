#!/usr/bin/env node
// Extracts a product's design tokens from its app stylesheet into <out>/tokens.css, tokens.json and
// source.lock.json. The kit already renders the framework theme, so imports matching --stop-at
// (default: the framework theme entry) are recorded and not inlined.
//
//   extract-tokens --entry <product>/apps/<app>/src/index.css --out <mockup-root>/tokens
//                  [--alias <specifier>=<dir>]... [--stop-at <regex>] [--slot-pattern <regex>]
//
// Copied unchanged: every custom-property declaration, grouped by its selector or at-rule
// (`:root`, `.dark`, `[data-color-theme=…]`, `@theme`); every rule that derives a paint from a
// seed with color-mix() or whose selector matches --slot-pattern; every `@layer base` rule.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import postcss from "postcss";
import { parseArgs, sha256 } from "../lib/fs-util.mjs";

const argv = process.argv.slice(2);
const args = parseArgs(argv);
if (!args.entry || !args.out) {
  console.error("usage: extract-tokens --entry <app stylesheet> --out <dir> [--alias <spec>=<dir>]... [--stop-at <regex>] [--slot-pattern <regex>]");
  process.exit(2);
}
const aliases = argv
  .flatMap((token, i) => (token === "--alias" ? [argv[i + 1]] : []))
  .map((pair) => {
    const at = pair.indexOf("=");
    if (at < 1) throw new Error(`--alias expects <specifier>=<dir>, got "${pair}"`);
    return { prefix: pair.slice(0, at), dir: resolve(pair.slice(at + 1)) };
  });
const stopAt = new RegExp(args["stop-at"] ?? "^@simplix-react/ui/theme\\.css$");
const slotPattern = args["slot-pattern"] ? new RegExp(args["slot-pattern"]) : undefined;
const engineImports = new Set(["tailwindcss"]);

/** Resolves a package export the way the kit's Vite plugin does: source condition, else dist→src. */
function resolveExport(pkgDir, subpath) {
  const manifest = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
  const target = manifest.exports?.[subpath === "" ? "." : `.${subpath}`];
  if (!target) return join(pkgDir, subpath);
  const file = typeof target === "string" ? target : target.source ?? target.style ?? target.import ?? target.default;
  const direct = join(pkgDir, file);
  return existsSync(direct) ? direct : join(pkgDir, file.replace(/^\.\/dist\//, "./src/"));
}

function resolveImport(spec, fromFile) {
  if (spec.startsWith(".") || spec.startsWith("/")) return resolve(dirname(fromFile), spec);
  const alias = aliases.find((a) => spec === a.prefix || spec.startsWith(a.prefix + "/"));
  if (alias) return resolveExport(alias.dir, spec.slice(alias.prefix.length));
  return createRequire(fromFile).resolve(spec);
}

const sources = [];
const external = [];
const groups = new Map();
const verbatim = [];

function groupKey(node) {
  const parts = [];
  for (let current = node.parent; current && current.type !== "root"; current = current.parent) {
    parts.unshift(current.type === "atrule" ? `@${current.name}${current.params ? " " + current.params : ""}` : current.selector);
  }
  return parts.join(" ⟩ ");
}

function insideLayerBase(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (current.type === "atrule" && current.name === "layer" && current.params.trim() === "base") return true;
  }
  return false;
}

function visit(file) {
  if (sources.some((s) => s.file === file)) return;
  const css = readFileSync(file, "utf8");
  sources.push({ file, sha256: sha256(file) });
  const root = postcss.parse(css, { from: file });
  root.walkAtRules("import", (rule) => {
    const spec = rule.params.replace(/^url\(|\)$/g, "").trim().replace(/^["']|["'].*$/g, "");
    if (engineImports.has(spec)) return;
    if (stopAt.test(spec)) {
      external.push({ spec, from: relative(process.cwd(), file) });
      return;
    }
    visit(resolveImport(spec, file));
  });
  root.walkAtRules("layer", (layer) => {
    if (layer.params.trim() === "base" && layer.nodes?.length) verbatim.push({ file, css: layer.toString() });
  });
  root.walkRules((rule) => {
    if (insideLayerBase(rule)) return;
    const derived = rule.nodes.some((n) => n.type === "decl" && /color-mix\(/.test(n.value));
    if (derived || (slotPattern && slotPattern.test(rule.selector))) {
      verbatim.push({ file, css: rule.toString() });
      return;
    }
  });
  root.walkDecls(/^--/, (decl) => {
    if (insideLayerBase(decl)) return;
    const parentRule = decl.parent;
    if (parentRule.type === "rule" && parentRule.nodes.some((n) => n.type === "decl" && /color-mix\(/.test(n.value))) return;
    if (parentRule.type === "rule" && slotPattern && slotPattern.test(parentRule.selector)) return;
    const key = groupKey(decl) || ":root";
    const group = groups.get(key) ?? groups.set(key, new Map()).get(key);
    group.set(decl.prop, decl.value);
  });
}

visit(resolve(args.entry));

function wrap(key, body) {
  return key
    .split(" ⟩ ")
    .reverse()
    .reduce((inner, level) => `${level} {\n${inner.replace(/^/gm, "  ")}\n}`, body);
}
const out = resolve(args.out);
mkdirSync(out, { recursive: true });
const header = "/* Generated by simplix-mockup-kit extract-tokens. Do not edit; change the product stylesheet or the script. */\n";
const tokenBlocks = [...groups].map(([key, decls]) => wrap(key, [...decls].map(([p, v]) => `${p}: ${v};`).join("\n")));
writeFileSync(join(out, "tokens.css"), header + [...tokenBlocks, ...verbatim.map((v) => v.css)].join("\n\n") + "\n");
writeFileSync(join(out, "tokens.json"), JSON.stringify(Object.fromEntries([...groups].map(([k, d]) => [k, Object.fromEntries(d)])), null, 2) + "\n");

function commitOf(file) {
  try {
    return execFileSync("git", ["-C", dirname(file), "log", "-1", "--format=%H", "--", file], { encoding: "utf8" }).trim() || null;
  } catch {
    return null;
  }
}
const lock = {
  entry: relative(out, resolve(args.entry)),
  external,
  sources: sources.map((s) => ({ path: relative(out, s.file), commit: commitOf(s.file), sha256: s.sha256 })),
};
writeFileSync(join(out, "source.lock.json"), JSON.stringify(lock, null, 2) + "\n");
const count = [...groups.values()].reduce((n, g) => n + g.size, 0);
console.log(`tokens: ${count} custom properties in ${groups.size} groups, ${verbatim.length} verbatim rules, from ${sources.length} files (${external.length} kit-provided imports skipped)`);
