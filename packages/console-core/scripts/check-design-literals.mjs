#!/usr/bin/env node
/**
 * Refuses design values written as literals outside the design files: a Tailwind arbitrary value
 * holding a number (`text-[13.5px]`, `h-[34px]`, `font-[550]`, `duration-[230ms]`), an arbitrary
 * shadow or colour that names no variable, and a literal colour or pixel size in a CSS declaration.
 * A value the theme owns is read through its variable (`text-(length:--fs-cell)`, `h-(--h-row)`,
 * `shadow-[var(--shadow-pop)]`), so a product theme can map it onto its own tokens.
 *
 * Usage:
 *   node check-design-literals.mjs [--root <dir>] [--config <file>] [<dir> ...]
 *   node check-design-literals.mjs --test     # each rule against its hit and miss cases
 *
 * The config (default `<root>/design-literals.json`, optional) holds:
 *   designFiles  globs where literals are allowed (token CSS, presets, generated theme files)
 *   exclude      globs never read (node_modules, dist and .git are always skipped)
 *   allow        { <rule>: [{ "pattern": "<regex>", "reason": "<why>" }] } exempting a match
 *   max          { <rule>: <count> } the findings a rule may still report; it only goes down
 * Paths in the config are relative to the root. Nothing project-specific is built in.
 *
 * Exit code 1 when a rule reports more findings than its `max`, 2 on a usage error.
 */
import fs from "node:fs";
import path from "node:path";

const RULES = [
  {
    id: "arbitrary-literal",
    title: "a Tailwind arbitrary value holding a literal number",
    files: /\.(tsx?|jsx?)$/,
    // `-[` holding one number, bare or in a design unit; a layout value (`1fr_auto`, `37%`) is not.
    pattern: /(?<![\w$])(?:[a-z][\w-]*:)*-?[a-z][a-z0-9-]*-\[-?\d*\.?\d+(?:px|rem|em|ms|s)?\]/g,
    hit: ['"text-[13.5px] font-medium"', '"h-[34px]"', '"font-[550]"', '"duration-[230ms]"', '"hover:px-[9px]"', '"leading-[1.5]"', '"tracking-[-0.02em]"'],
    miss: ['"text-(length:--fs-cell)"', '"h-[var(--h-row)]"', '"w-[calc(var(--sp-2)*2)]"', '"grid-cols-[1fr_auto]"', '"[&>*]:p-2"', "items[3]", '"w-[37%]"'],
  },
  {
    id: "arbitrary-shadow",
    title: "an arbitrary shadow that names no variable",
    files: /\.(tsx?|jsx?)$/,
    pattern: /(?<![\w$])(?:[a-z][\w-]*:)*shadow-\[(?![^\]]*var\()[^\]]*\]/g,
    hit: ['"shadow-[0_1px_2px_rgba(0,0,0,0.1)]"', '"focus:shadow-[0_0_0_3px_#fff]"'],
    miss: ['"shadow-[var(--shadow-pop)]"', '"shadow-[0_0_0_3px_var(--card)]"', '"shadow-none"'],
  },
  {
    id: "arbitrary-colour",
    title: "an arbitrary colour written as a literal",
    files: /\.(tsx?|jsx?)$/,
    pattern: /(?<![\w$])(?:[a-z][\w-]*:)*[a-z][a-z0-9-]*-\[(?:#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?|oklch|oklab|lab|lch)\()[^\]]*\]/g,
    hit: ['"bg-[oklch(0.93_0.035_213)]"', '"text-[#b42318]"', '"dark:bg-[rgb(1,2,3)]"'],
    miss: ['"bg-[var(--surface-2)]"', '"bg-[color-mix(in_oklch,var(--a),var(--b)_7%)]"', '"text-primary"'],
  },
  {
    id: "css-literal",
    title: "a literal colour or pixel size in a CSS declaration",
    files: /\.css$/,
    // A declaration of a non-custom property whose value holds a colour literal or a px length.
    pattern: /(?<![\w-])(?!--)[a-z-]+\s*:\s*(?![^;{}]*var\()[^;{}]*(?:#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?|oklch)\(|\b\d*\.?\d+px\b)[^;{}]*;/g,
    hit: [".a { color: #fff; }", ".a { padding: 12px 8px; }", ".a { background: oklch(0.9 0 0); }"],
    miss: [".a { padding: var(--sp-3); }", ":root { --sp-3: 12px; }", ".a { border-width: 0; }", ".a { width: 100%; }"],
  },
];

const ALWAYS_SKIPPED = ["node_modules", "dist", ".git", "storybook-static", "coverage"];

function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i += 1) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      re += ".*";
      i += 1;
      if (glob[i + 1] === "/") i += 1;
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`);
}

function readConfig(root, file) {
  const configPath = file ? path.resolve(file) : path.join(root, "design-literals.json");
  if (!fs.existsSync(configPath)) {
    if (file) throw new Error(`config ${configPath} does not exist`);
    return { designFiles: [], exclude: [], allow: {}, max: {} };
  }
  const raw = JSON.parse(fs.readFileSync(configPath, "utf8"));
  for (const key of Object.keys(raw)) {
    if (!["designFiles", "exclude", "allow", "max", "$comment"].includes(key)) {
      throw new Error(`${configPath}: unknown key ${key}`);
    }
  }
  return { designFiles: [], exclude: [], allow: {}, max: {}, ...raw };
}

function walk(dir, root, skip, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ALWAYS_SKIPPED.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).split(path.sep).join("/");
    if (skip(rel)) continue;
    if (entry.isDirectory()) walk(full, root, skip, out);
    else if (entry.isFile()) out.push([full, rel]);
  }
}

/** The findings of one rule in one text, minus the matches an allow entry exempts. */
function findIn(rule, text, allow) {
  const exempt = (allow[rule.id] ?? []).map((a) => new RegExp(a.pattern));
  const found = [];
  for (const m of text.matchAll(rule.pattern)) {
    if (exempt.some((re) => re.test(m[0]))) continue;
    found.push({ match: m[0].trim(), index: m.index });
  }
  return found;
}

function selfTest() {
  let failed = 0;
  for (const rule of RULES) {
    for (const [direction, cases] of [["hit", rule.hit], ["miss", rule.miss]]) {
      for (const text of cases) {
        const n = findIn(rule, text, {}).length;
        const ok = direction === "hit" ? n > 0 : n === 0;
        if (!ok) failed += 1;
        console.log(`${ok ? "✔" : "✖"} ${rule.id} · ${direction} · ${text} (${n} found)`);
      }
    }
  }
  const total = RULES.reduce((n, r) => n + r.hit.length + r.miss.length, 0);
  console.log(failed === 0 ? `self-test: ${total}/${total} cases` : `self-test: ${failed} of ${total} cases wrong`);
  return failed === 0 ? 0 : 1;
}

function main(argv) {
  if (argv.includes("--test")) return selfTest();
  const dirs = [];
  let root = process.cwd();
  let configFile;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--root") root = path.resolve(argv[++i] ?? "");
    else if (a === "--config") configFile = argv[++i];
    else if (a.startsWith("--")) {
      console.error(`unknown option ${a}`);
      return 2;
    } else dirs.push(a);
  }
  const config = readConfig(root, configFile);
  const design = config.designFiles.map(globToRegExp);
  const excluded = config.exclude.map(globToRegExp);
  const files = [];
  for (const d of dirs.length > 0 ? dirs : ["."]) {
    const start = path.resolve(root, d);
    walk(start, root, (rel) => excluded.some((re) => re.test(rel)), files);
  }
  const byRule = new Map(RULES.map((r) => [r.id, []]));
  for (const [full, rel] of files) {
    if (design.some((re) => re.test(rel))) continue;
    const rules = RULES.filter((r) => r.files.test(rel));
    if (rules.length === 0) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const rule of rules) {
      for (const f of findIn(rule, text, config.allow)) {
        const line = text.slice(0, f.index).split("\n").length;
        byRule.get(rule.id).push(`${rel}:${line} ${f.match}`);
      }
    }
  }
  let failed = 0;
  for (const rule of RULES) {
    const found = byRule.get(rule.id);
    const max = config.max[rule.id] ?? 0;
    const over = found.length > max;
    if (over) failed += 1;
    console.log(`${over ? "✖" : "✔"} ${rule.id}: ${found.length} (max ${max}) - ${rule.title}`);
    if (over) for (const f of found) console.log(`   ${f}`);
    else if (found.length < max) console.log(`   the max can go down to ${found.length}`);
  }
  console.log(`design literals: ${files.length} files read`);
  return failed === 0 ? 0 : 1;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (e) {
  console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 2;
}
