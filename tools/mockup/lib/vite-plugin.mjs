// Vite plugin that renders the framework's own components, from a checkout or from the installed
// packages' sources, with a design's component changes and tokens applied. A design is a directory
// of the mockup root that names it (`designDirs`); this package holds none.
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative, resolve, sep } from "node:path";
import { PACKAGE_ROOT } from "./package-root.mjs";
import { searchForWorkspaceRoot, transformWithOxc } from "vite";
import { colorThemeOf, designChain, loadDesigns, scopeDesignTokens } from "./designs.mjs";
import { FRAMEWORK_SCOPE, locateFramework } from "./framework.mjs";

const DESIGN_ID = "\0kit-design";
const BASE_PREFIX = "@kit-base/";
const SCRIPT_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"];
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

/**
 * Maps each package export to the file the framework's own dev setup renders: the `source`
 * condition, or for a plain string export the src/ file its build copies into dist/.
 */
function exportAliases(packages) {
  const aliases = [];
  for (const [name, { dir, manifest }] of packages) {
    for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
      const file = typeof target === "string" ? target.replace(/^\.\/dist\//, "./src/") : target.source;
      if (!file) continue;
      const specifier = `${name}${subpath === "." ? "" : subpath.slice(1)}`;
      aliases.push({ find: new RegExp(`^${escapeRegExp(specifier)}$`), replacement: join(dir, file) });
    }
  }
  return aliases;
}

/**
 * The workspaces of the libraries linked into the library root from outside it (a UI kit linked from
 * its own checkout). Such a library's dependencies (its fonts, its styles) are installed in its own
 * workspace, so the dev server has to be allowed to serve files from there.
 */
function linkedWorkspaces(libraryRoot) {
  const manifest = join(libraryRoot, "package.json");
  if (!existsSync(manifest)) return [];
  const { dependencies = {}, devDependencies = {} } = JSON.parse(readFileSync(manifest, "utf8"));
  const roots = new Set();
  for (const name of Object.keys({ ...dependencies, ...devDependencies })) {
    const link = join(libraryRoot, "node_modules", name);
    if (!existsSync(link)) continue;
    const real = realpathSync(link);
    if (real.startsWith(libraryRoot + sep) || real.split(sep).includes("node_modules")) continue;
    roots.add(searchForWorkspaceRoot(real));
  }
  return [...roots];
}

function firstExisting(base) {
  const isFile = (path) => existsSync(path) && statSync(path).isFile();
  if (isFile(base)) return base;
  return SCRIPT_EXTENSIONS.map((ext) => base + ext).find(isFile);
}

/**
 * @param {object} [options]
 * @param {string} [options.framework]   simplix-react checkout; defaults to SIMPLIX_FRAMEWORK, else the
 *                                       installed packages' sources are used
 * @param {string} [options.libraryRoot] directory whose node_modules provides the libraries
 * @param {string} [options.design]      design name; defaults to KIT_DESIGN, else "framework"
 * @param {string[]} [options.designDirs] the directories of the mockup root that hold its designs
 */
export function simplixMockupKit(options = {}) {
  const libraryRoot = resolve(options.libraryRoot ?? process.cwd());
  const framework = options.framework ?? process.env.SIMPLIX_FRAMEWORK;
  const design = options.design ?? process.env.KIT_DESIGN ?? "framework";
  const designDirs = (options.designDirs ?? []).map((d) => resolve(d));
  const chain = designChain(loadDesigns(designDirs), design);

  const requireFromLibraries = createRequire(join(libraryRoot, "package.json"));
  const { frameworkRoot, packages, uiSrc } = locateFramework({ framework, libraryRoot });
  const checkoutPattern = frameworkRoot ? new RegExp(`^${escapeRegExp(frameworkRoot)}/`) : undefined;
  const tokenFiles = new Map();
  for (const d of [...chain].reverse()) {
    const file = join(d.dir, "tokens.css");
    if (existsSync(file)) tokenFiles.set(file, d.name);
  }
  const overrideSources = chain.map((d) => join(d.dir, "ds")).filter((dir) => existsSync(dir));

  /** The override for a framework ui file, searched from the selected design down to its bases. */
  function overrideFor(file) {
    if (!file.startsWith(uiSrc)) return undefined;
    const rel = file.slice(uiSrc.length);
    for (const d of chain) {
      const candidate = join(d.dir, "ds", rel);
      if (existsSync(candidate)) return candidate;
    }
    return undefined;
  }

  return {
    name: "simplix-mockup-kit",
    enforce: "pre",
    config() {
      const tailwind = requireFromLibraries.resolve("tailwindcss/index.css");
      return {
        resolve: {
          // A checkout is rendered from its sources; installed packages through their `source`
          // export condition, so a design override can replace a source file.
          alias: [
            ...(packages ? exportAliases(packages) : []),
            ...(frameworkRoot ? [{ find: /^tailwindcss$/, replacement: tailwind }] : []),
          ],
          conditions: ["source"],
          // One copy of each, the library root's: this package and a UI kit linked from their own
          // checkout would otherwise bring the copies installed there.
          dedupe: ["react", "react-dom", "react-router-dom", "@tanstack/react-query", "i18next", "react-i18next", "storybook", "@storybook/react"],
        },
        optimizeDeps: { exclude: [...(packages ? packages.keys() : [`${FRAMEWORK_SCOPE}ui`])] },
        server: { fs: { allow: [PACKAGE_ROOT, libraryRoot, ...linkedWorkspaces(libraryRoot), ...(frameworkRoot ? [frameworkRoot] : []), ...designDirs] } },
        // A checkout is compiled by this plugin instead (see transform), so the core transform
        // and the React refresh transform leave its files alone; arrays merge with other plugins'.
        // The refresh filter matches everything not excluded unless it is also given an include.
        ...(checkoutPattern
          ? { oxc: { exclude: [checkoutPattern], jsxRefreshInclude: [/\.[tj]sx?(?:\?.*)?$/], jsxRefreshExclude: [checkoutPattern, /\/node_modules\//] } }
          : {}),
      };
    },
    async resolveId(source, importer, opts) {
      if (source === "virtual:kit-design") return DESIGN_ID;
      if (source.startsWith(BASE_PREFIX)) {
        const file = firstExisting(join(uiSrc, source.slice(BASE_PREFIX.length)));
        if (!file) this.error(`${source}: no framework ui file at that path`);
        return file;
      }
      const bare = !source.startsWith(".") && !source.startsWith("/") && !source.startsWith("\0");
      // A checkout has no install of its own: its files resolve libraries from libraryRoot, the
      // same copies the rest of the page uses.
      if (bare && checkoutPattern && importer && checkoutPattern.test(importer) && !source.startsWith(FRAMEWORK_SCOPE)) {
        return this.resolve(source, join(libraryRoot, "package.json"), { ...opts, skipSelf: true });
      }
      if (!importer || chain.length === 0) return null;
      const resolved = await this.resolve(source, importer, { ...opts, skipSelf: true });
      if (!resolved || resolved.external) return resolved;
      const override = overrideFor(resolved.id.split("?")[0]);
      if (!override || override === importer.split("?")[0]) return resolved;
      return override;
    },
    load(id) {
      if (id !== DESIGN_ID) return null;
      const imports = [...tokenFiles.keys()].map((f) => `import ${JSON.stringify(f + "?kit-design-tokens")};`);
      const info = { name: design, chain: chain.map((d) => d.name), colorTheme: colorThemeOf(chain) };
      return `${imports.join("\n")}\nexport default ${JSON.stringify(info)};\n`;
    },
    async transform(code, id) {
      const [file, query] = id.split("?");
      if (query === "kit-design-tokens" && tokenFiles.has(file)) {
        return { code: scopeDesignTokens(code, tokenFiles.get(file), file), map: null };
      }
      // Tailwind scans only the paths a stylesheet names, so the design's own components are added
      // to the sources of the stylesheet that pulls in the framework theme.
      if (file.endsWith(".css") && overrideSources.length > 0 && code.includes(`${FRAMEWORK_SCOPE}ui/theme.css`)) {
        return { code: code + overrideSources.map((dir) => `\n@source ${JSON.stringify(dir)};`).join(""), map: null };
      }
      // oxc reads the tsconfig nearest a file, and a checkout's tsconfig extends a package only its
      // own install provides; compiling under `lib/framework-tsconfig/` gives its files the tsconfig written there.
      if (checkoutPattern?.test(file) && /\.[cm]?[jt]sx?$/.test(file) && !file.includes(`${sep}node_modules${sep}`)) {
        const ext = file.match(/\.([cm]?)([jt]sx?)$/)[2];
        const result = await transformWithOxc(code, join(PACKAGE_ROOT, "lib", "framework-tsconfig", relative(frameworkRoot, file)), {
          lang: ext,
          jsx: { runtime: "automatic", importSource: "react" },
        });
        return { code: result.code, map: result.map };
      }
      return null;
    },
  };
}

export { PACKAGE_ROOT };
