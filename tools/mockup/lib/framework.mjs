// Locates the framework a mockup renders: a simplix-react checkout, or the @simplix-react packages
// installed in a library root.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";

export const FRAMEWORK_SCOPE = "@simplix-react/";

/** Every `@simplix-react/*` package of a framework checkout, by name, with its directory. */
function checkoutPackages(frameworkRoot) {
  const packages = new Map();
  const dir = join(frameworkRoot, "packages");
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const manifestPath = join(dir, entry.name, "package.json");
    if (!entry.isDirectory() || !existsSync(manifestPath)) continue;
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (manifest.name?.startsWith(FRAMEWORK_SCOPE)) packages.set(manifest.name, { dir: join(dir, entry.name), manifest });
  }
  return packages;
}

/**
 * The directory of an installed package, found the way Node looks for one: `node_modules/<name>`
 * in the starting directory and each parent. Read directly because a package whose `exports` omits
 * `./package.json` cannot be resolved to its manifest through `require.resolve`.
 */
function installedPackageDir(start, name) {
  for (let dir = start; ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", name);
    if (existsSync(join(candidate, "package.json"))) return realpathSync(candidate);
    if (dirname(dir) === dir) throw new Error(`${name} is not installed under ${start} or any parent`);
  }
}

/**
 * @param {{ framework?: string, libraryRoot?: string }} options  `framework` defaults to
 *   SIMPLIX_FRAMEWORK; without one, the packages installed under `libraryRoot` are used.
 * @returns {{ frameworkRoot?: string, packages?: Map<string, {dir: string, manifest: object}>,
 *   uiDir: string, uiSrc: string, libraryRoot: string }}
 */
export function locateFramework({ framework = process.env.SIMPLIX_FRAMEWORK, libraryRoot = process.cwd() } = {}) {
  const root = resolve(libraryRoot);
  if (framework) {
    const frameworkRoot = resolve(framework);
    const packages = checkoutPackages(frameworkRoot);
    const ui = packages.get(`${FRAMEWORK_SCOPE}ui`);
    if (!ui) throw new Error(`${frameworkRoot}: no ${FRAMEWORK_SCOPE}ui package under packages/`);
    return { frameworkRoot, packages, uiDir: ui.dir, uiSrc: join(ui.dir, "src") + sep, libraryRoot: root };
  }
  const uiDir = installedPackageDir(root, `${FRAMEWORK_SCOPE}ui`);
  return { uiDir, uiSrc: join(uiDir, "src") + sep, libraryRoot: root };
}

/** The commit that last changed `file`, or the installed package version when it is not in git. */
export function revisionOf(file, uiDir) {
  try {
    const commit = execFileSync("git", ["-C", dirname(file), "log", "-1", "--format=%H", "--", file], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (commit) return commit;
  } catch {
    // Not inside a git checkout: an installed package.
  }
  return `${FRAMEWORK_SCOPE}ui@${JSON.parse(readFileSync(join(uiDir, "package.json"), "utf8")).version}`;
}
