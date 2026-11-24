import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

/** Returns every file under `dir`, as POSIX paths relative to `dir`, that `keep` accepts. */
export function listFiles(dir, keep = () => true) {
  const out = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      const rel = relative(dir, full).split(sep).join("/");
      if (entry.isDirectory()) {
        if (keep(rel + "/", true)) walk(full);
      } else if (keep(rel, false)) {
        out.push(rel);
      }
    }
  };
  if (existsSync(dir) && statSync(dir).isDirectory()) walk(dir);
  return out.sort();
}

export function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/** Parses `--name value` pairs; a flag with no value becomes `true`. */
export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      args[token.slice(2)] = true;
    } else {
      args[token.slice(2)] = next;
      i++;
    }
  }
  return args;
}
