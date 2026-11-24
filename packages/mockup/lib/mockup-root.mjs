// What a mockup root says about itself in `mockup.config.json`, read from the root a command runs in.
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/** The root's `mockup.config.json`, or an empty object where the directory holds none. */
export function readMockupConfig(root = process.cwd()) {
  const file = join(resolve(root), "mockup.config.json");
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
}

/**
 * The directories that hold a root's designs, absolute: the `--design-dirs` flag, then
 * KIT_DESIGN_DIRS (both colon-separated), then the root's `designDirs`.
 */
export function designDirsOf(root = process.cwd(), flag = undefined) {
  const named = flag ?? process.env.KIT_DESIGN_DIRS;
  if (named !== undefined) return String(named).split(":").filter(Boolean).map((dir) => resolve(dir));
  return (readMockupConfig(root).designDirs ?? []).map((dir) => resolve(root, dir));
}

/** The framework checkout a root renders: the flag, then SIMPLIX_FRAMEWORK, then the root's `framework`. */
export function frameworkOf(root = process.cwd(), flag = undefined) {
  const named = flag ?? process.env.SIMPLIX_FRAMEWORK;
  if (named !== undefined) return resolve(String(named));
  const configured = readMockupConfig(root).framework;
  return configured ? resolve(root, configured) : undefined;
}
