#!/usr/bin/env node
/**
 * Refuses a second avatar implementation. A person is drawn by the console's one avatar part
 * (`InitialsAvatar`, with `UserAvatar` adding an uploaded photo where one is served), and the letters
 * and the tone come from its one rule (`avatarInitials`, `avatarTone`). A screen, a package or another
 * kit part that writes its own letters helper, its own stand-in picture or its own letters circle
 * draws the same person differently on the next screen.
 *
 * Usage:
 *   node check-avatar-owner.mjs [--root <dir>] [--owner <glob>]... [<dir> ...]
 *   node check-avatar-owner.mjs --test     # each rule against its hit and miss cases
 *
 * `--owner` names the files that may hold the rule (the kit passes its own avatar file); a project
 * passes none, since no project file may. node_modules, dist and .git are never read.
 *
 * Exit code 1 on a finding, 2 on a usage error.
 */
import fs from "node:fs";
import path from "node:path";

const RULES = [
  {
    id: "initials-helper",
    title: "a helper that derives a person's letters, beside the avatar's own rule",
    // A function or constant named for initials, declared rather than imported.
    pattern: /\b(?:function\s+|(?:const|let|var)\s+)[\w$]*[Ii]nitials[\w$]*\s*(?:[=(:<])/g,
    hit: ["function initialsOf(name: string) {", "const getInitials = (name) =>", "let userInitials: string = ''", "function initials(name) {"],
    miss: ["import { avatarInitials } from \"./initials-avatar\";", "const letters = avatarInitials(name);", "// the initials are drawn by InitialsAvatar", "readonly initialsLabel?: string;"],
  },
  {
    id: "stand-in-picture",
    title: "a stand-in picture for a person without a photo",
    pattern: /default-avatar\.(?:svg|png)|\bDEFAULT_USER_AVATAR_URL\b/g,
    hit: ['const src = "/images/avatars/default-avatar.svg";', "src={DEFAULT_USER_AVATAR_URL}"],
    miss: ['src={user.avatarUrl}', "<UserAvatar name={name} />"],
  },
  {
    id: "letters-circle",
    title: "a round element drawing letters taken from a name",
    // A rounded-full element whose child expression slices a name into letters.
    pattern: /rounded-full[^>\n]*>\s*\{[^}\n]*(?:\.slice\(\s*-?\d+\s*(?:,\s*\d+\s*)?\)|\[0\]\s*\[0\]|charAt\(0\))[^}\n]*\}/g,
    hit: ['<span className="rounded-full bg-muted">{name.slice(0, 2)}</span>', '<div className="size-6 rounded-full">{name[0][0]}</div>', '<i class="rounded-full">{user.name.charAt(0)}</i>'],
    miss: ['<span className="rounded-full">{count}</span>', '<InitialsAvatar name={name} seed={id} />', '<span className="rounded-full" />'],
  },
];

function globToRegExp(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*\//g, "(?:.*/)?").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*");
  return new RegExp(`^${escaped}$`);
}

function selfTest() {
  let failed = 0;
  for (const rule of RULES) {
    for (const text of rule.hit) {
      rule.pattern.lastIndex = 0;
      if (!rule.pattern.test(text)) {
        failed += 1;
        console.error(`✖ ${rule.id}: missed the hit case ${text}`);
      }
    }
    for (const text of rule.miss) {
      rule.pattern.lastIndex = 0;
      if (rule.pattern.test(text)) {
        failed += 1;
        console.error(`✖ ${rule.id}: flagged the miss case ${text}`);
      }
    }
  }
  if (failed > 0) return 1;
  console.log(`check-avatar-owner selftest: ${RULES.length} rules, ${RULES.reduce((n, r) => n + r.hit.length, 0)} hit and ${RULES.reduce((n, r) => n + r.miss.length, 0)} miss cases hold`);
  return 0;
}

function* filesUnder(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* filesUnder(full);
    else if (/\.(tsx?|jsx?|mjs)$/.test(entry.name) && !/\.test\.|\.stories\./.test(entry.name)) yield full;
  }
}

function main(argv) {
  if (argv.includes("--test")) return selfTest();
  let root = process.cwd();
  const owners = [];
  const dirs = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--root") root = path.resolve(argv[++i] ?? "");
    else if (arg === "--owner") owners.push(globToRegExp(argv[++i] ?? ""));
    else if (arg.startsWith("--")) {
      console.error(`unknown option ${arg}`);
      return 2;
    } else dirs.push(arg);
  }
  if (dirs.length === 0) dirs.push(".");
  const findings = [];
  for (const dir of dirs) {
    for (const file of filesUnder(path.resolve(root, dir))) {
      const rel = path.relative(root, file).split(path.sep).join("/");
      if (owners.some((owner) => owner.test(rel))) continue;
      // This script names the patterns it refuses.
      if (rel.endsWith("check-avatar-owner.mjs")) continue;
      const text = fs.readFileSync(file, "utf8");
      for (const rule of RULES) {
        rule.pattern.lastIndex = 0;
        for (const match of text.matchAll(rule.pattern)) {
          const line = text.slice(0, match.index).split("\n").length;
          findings.push(`${rel}:${line}: ${rule.id}: ${rule.title}: ${match[0].trim().slice(0, 80)}`);
        }
      }
    }
  }
  for (const line of findings) console.error(`✖ ${line}`);
  if (findings.length > 0) return 1;
  console.log("check-avatar-owner: no second avatar implementation");
  return 0;
}

process.exit(main(process.argv.slice(2)));
