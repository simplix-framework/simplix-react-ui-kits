import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import ts from "typescript";

/**
 * Type-checks a generated project as an app would build it: every TypeScript file under `root`,
 * the shared compiler options, and each workspace package and kit mapped to its `source` export.
 */

// `.simplix` holds the CLI's merge bases, copies of what it wrote rather than code an app builds.
const SKIP = new Set(["node_modules", "dist", ".git", ".simplix"]);

/** A package's build and test tool settings, which configure tools rather than make up the app. */
const TOOL_CONFIG = /\.config\.(?:ts|mts)$/;

/** Every `.ts` and `.tsx` file under `dir`, outside dependency and build directories and tool settings. */
export function sourceFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...sourceFiles(path));
    else if (/\.tsx?$/.test(entry) && !TOOL_CONFIG.test(entry)) found.push(path);
  }
  return found.sort();
}

/** Every `package.json` under `dir` at any depth, outside dependency directories. */
function manifests(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...manifests(path));
    else if (entry === "package.json") found.push(path);
  }
  return found;
}

/** The file an export entry names under the `source` condition, else its `types`, else the entry itself. */
function sourceOf(entry) {
  if (typeof entry === "string") return entry;
  return entry?.source ?? entry?.types ?? entry?.import ?? entry?.default;
}

/**
 * Module paths for the workspace packages under `root` and for each named kit: a package's own
 * exports, read under the `source` condition, as the app's bundler resolves them.
 *
 * @param {string} root the generated project
 * @param {string[]} kitDirs the kit packages the generated code imports
 */
export function workspacePaths(root, kitDirs) {
  const paths = {};
  for (const file of [...manifests(root), ...kitDirs.map((dir) => join(dir, "package.json"))]) {
    const manifest = JSON.parse(readFileSync(file, "utf-8"));
    if (!manifest.name || manifest.name === "@fixture/root") continue;
    const dir = dirname(file);
    const exports = manifest.exports ?? { ".": manifest.types ?? manifest.main ?? "./src/index.ts" };
    for (const [key, entry] of Object.entries(typeof exports === "string" ? { ".": exports } : exports)) {
      const target = sourceOf(entry);
      if (!target || key.endsWith(".json") || key.includes("/styles/")) continue;
      const specifier = key === "." ? manifest.name : `${manifest.name}/${key.slice(2)}`;
      paths[specifier] = [join(dir, target)];
    }
  }
  return paths;
}

/**
 * The imports of the generated files that a kit's fence refuses, each as `path:line message`.
 *
 * @param {string} root the generated project
 * @param {{ name: string, importNames: string[], message: string }[]} fence the fence in force
 */
export function fenceBreaches(root, fence) {
  const breaches = [];
  for (const file of sourceFiles(root)) {
    const source = ts.createSourceFile(file, readFileSync(file, "utf-8"), ts.ScriptTarget.ES2022, true);
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const entry = fence.find((one) => one.name === statement.moduleSpecifier.text);
      const bindings = statement.importClause?.namedBindings;
      if (!entry || !bindings || !ts.isNamedImports(bindings)) continue;
      for (const element of bindings.elements) {
        const imported = (element.propertyName ?? element.name).text;
        if (!entry.importNames.includes(imported)) continue;
        const line = source.getLineAndCharacterOfPosition(element.getStart()).line + 1;
        breaches.push(`${relative(root, file)}:${line} imports ${imported} from ${entry.name}: ${entry.message}`);
      }
    }
  }
  return breaches;
}

/**
 * The compiler's messages for the generated project, each as `path:line TSnnnn message`.
 *
 * @param {string} root the generated project
 * @param {string} tsconfig the shared configuration the project's packages extend
 * @param {string[]} kitDirs the kit packages the generated code imports
 */
export function typecheckProject(root, tsconfig, kitDirs) {
  const config = ts.readConfigFile(tsconfig, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, dirname(tsconfig));
  const options = {
    ...parsed.options,
    noEmit: true,
    paths: workspacePaths(root, kitDirs),
    types: [],
  };
  const roots = sourceFiles(root);
  const program = ts.createProgram({ rootNames: roots, options });
  // The kit's own sources are checked by the kit's typecheck; what is judged here is the generated code.
  const inProject = new Set(roots);
  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => !diagnostic.file || inProject.has(diagnostic.file.fileName))
    .map((diagnostic) => {
      const file = diagnostic.file;
      const where = file && diagnostic.start !== undefined ? `${relative(root, file.fileName)}:${file.getLineAndCharacterOfPosition(diagnostic.start).line + 1}` : "(project)";
      return `${where} TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`;
    });
}
