#!/usr/bin/env node
// Reports every import cycle among the source files under the given roots.
//   node scripts/check-cycles.mjs [root...]   default root: packages
//   node scripts/check-cycles.mjs --test      proves the check on its own hit and miss cases
//
// A cycle matters here because Vite's hot update walks the importers of the edited module, and a
// walk that meets a module it already visited gives up and reloads the whole page. So the edges
// are the ones the bundler keeps: the transform, not the type checker, decides which imports
// exist at run time.
//   - `import type`, `export type` and `export { type X } from` leave no edge.
//   - `import { type X } from` leaves an edge when the project sets `verbatimModuleSyntax`
//     (the transform keeps it as a bare `import "..."`) and no edge when it does not.
//   - `import("...")` is an edge: the importer is recorded in the module graph all the same.
// Bare specifiers resolve with the `source` condition, the one the dev server resolves with, so a
// cycle that crosses workspace packages is found at the files, not at the package boundary.
// Only files under the roots are nodes; a specifier that resolves outside them ends the walk.
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]);
const SKIPPED_DIRECTORIES = new Set(["node_modules", "dist", ".turbo", ".git"]);
const ASSET_EXTENSIONS = new Set([".css", ".scss", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".woff", ".woff2", ".json", ".md", ".txt", ".html", ".wasm"]);
const MAX_CYCLES_PER_COMPONENT = 100;

function listSources(directory, found) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (SKIPPED_DIRECTORIES.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      listSources(path, found);
    } else if (SOURCE_EXTENSIONS.has(entry.name.slice(entry.name.lastIndexOf("."))) && !entry.name.endsWith(".d.ts")) {
      found.push(path);
    }
  }
  return found;
}

function scriptKind(file) {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (/\.(?:m|c)?js$/.test(file)) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

/** The run-time module specifiers of one file, each with the kind of edge it makes. */
export function readSpecifiers(file, text, verbatimModuleSyntax) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind(file));
  const found = [];
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const elements = clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : [];
      const allInlineTypes = !!clause && !clause.name && elements.length > 0 && elements.every((element) => element.isTypeOnly);
      const typeOnly = !!clause && (clause.isTypeOnly || (allInlineTypes && !verbatimModuleSyntax));
      if (!typeOnly) found.push({ specifier: node.moduleSpecifier.text, kind: "static" });
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const elements = node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements : [];
      const allInlineTypes = elements.length > 0 && elements.every((element) => element.isTypeOnly);
      if (!node.isTypeOnly && !allInlineTypes) found.push({ specifier: node.moduleSpecifier.text, kind: "static" });
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments.length === 1 && ts.isStringLiteralLike(node.arguments[0])) {
      found.push({ specifier: node.arguments[0].text, kind: "dynamic" });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

function readVerbatimModuleSyntax(workspace) {
  const configPath = join(workspace, "tsconfig.json");
  if (!existsSync(configPath)) return false;
  const read = ts.readConfigFile(configPath, ts.sys.readFile);
  if (read.error) throw new Error(ts.flattenDiagnosticMessageText(read.error.messageText, "\n"));
  return ts.parseJsonConfigFileContent(read.config, ts.sys, workspace).options.verbatimModuleSyntax === true;
}

/** Builds the import graph of the files under `roots`: file -> [{ to, kind }], plus what could not be resolved. */
export function buildGraph(workspaceDirectory, roots) {
  // The resolver reports real paths, so the files are listed from the real directory too.
  const workspace = realpathSync(workspaceDirectory);
  const verbatimModuleSyntax = readVerbatimModuleSyntax(workspace);
  const options = {
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    customConditions: ["source"],
    allowImportingTsExtensions: true,
    resolveJsonModule: true,
  };
  const cache = ts.createModuleResolutionCache(workspace, (name) => name, options);
  const files = roots.flatMap((root) => (existsSync(join(workspace, root)) ? listSources(join(workspace, root), []) : []));
  const inScope = new Set(files);
  const edges = new Map();
  const unresolved = [];
  for (const file of files) {
    const out = [];
    for (const { specifier, kind } of readSpecifiers(file, readFileSync(file, "utf8"), verbatimModuleSyntax)) {
      const clean = specifier.replace(/[?#].*$/, "");
      const resolved = ts.resolveModuleName(clean, file, options, ts.sys, cache).resolvedModule;
      const target = resolved?.resolvedFileName;
      if (!target && /^\.\.?\//.test(clean)) {
        const extension = clean.slice(clean.lastIndexOf("."));
        if (!ASSET_EXTENSIONS.has(extension)) unresolved.push({ file, specifier });
        continue;
      }
      if (target && inScope.has(target)) out.push({ to: target, kind });
    }
    edges.set(file, out);
  }
  return { files, edges, unresolved };
}

/** Strongly connected components with more than one file, or one file that imports itself. */
export function cyclicComponents(files, edges) {
  let counter = 0;
  const index = new Map();
  const low = new Map();
  const onStack = new Set();
  const stack = [];
  const components = [];
  const visit = (start) => {
    // Iterative form of Tarjan's walk, so a long import chain cannot overflow the call stack.
    const work = [{ node: start, next: 0 }];
    index.set(start, counter);
    low.set(start, counter);
    counter += 1;
    stack.push(start);
    onStack.add(start);
    while (work.length > 0) {
      const frame = work[work.length - 1];
      const out = edges.get(frame.node) ?? [];
      if (frame.next < out.length) {
        const { to } = out[frame.next];
        frame.next += 1;
        if (!index.has(to)) {
          index.set(to, counter);
          low.set(to, counter);
          counter += 1;
          stack.push(to);
          onStack.add(to);
          work.push({ node: to, next: 0 });
        } else if (onStack.has(to)) {
          low.set(frame.node, Math.min(low.get(frame.node), index.get(to)));
        }
        continue;
      }
      work.pop();
      if (work.length > 0) {
        const parent = work[work.length - 1].node;
        low.set(parent, Math.min(low.get(parent), low.get(frame.node)));
      }
      if (low.get(frame.node) === index.get(frame.node)) {
        const members = [];
        let member;
        do {
          member = stack.pop();
          onStack.delete(member);
          members.push(member);
        } while (member !== frame.node);
        const selfImport = members.length === 1 && (edges.get(members[0]) ?? []).some((edge) => edge.to === members[0]);
        if (members.length > 1 || selfImport) components.push(members.sort());
      }
    }
  };
  for (const file of files) if (!index.has(file)) visit(file);
  return components.sort((a, b) => a[0].localeCompare(b[0]));
}

/** The elementary cycles inside one component, each starting at its first file in sorted order. */
export function cyclesOf(component, edges) {
  const members = new Set(component);
  const found = [];
  const walk = (root, node, path, onPath) => {
    if (found.length >= MAX_CYCLES_PER_COMPONENT) return;
    for (const { to } of edges.get(node) ?? []) {
      if (!members.has(to) || to < root) continue;
      if (to === root) {
        found.push([...path]);
      } else if (!onPath.has(to)) {
        onPath.add(to);
        path.push(to);
        walk(root, to, path, onPath);
        path.pop();
        onPath.delete(to);
      }
    }
  };
  for (const root of component) walk(root, root, [root], new Set([root]));
  return found;
}

function edgeKind(edges, from, to) {
  const kinds = new Set((edges.get(from) ?? []).filter((edge) => edge.to === to).map((edge) => edge.kind));
  return kinds.has("static") ? "" : " (dynamic)";
}

export function check(workspace, roots) {
  const { files, edges, unresolved } = buildGraph(workspace, roots);
  const components = cyclicComponents(files, edges);
  const cycles = components.flatMap((component) => cyclesOf(component, edges));
  return { files, edges, unresolved, components, cycles };
}

function report(workspace, result) {
  const show = (file) => relative(workspace, file);
  for (const { file, specifier } of result.unresolved) {
    console.error(`✖ ${show(file)}: cannot resolve "${specifier}", so its edge is not checked`);
  }
  for (const cycle of result.cycles) {
    const ring = [...cycle, cycle[0]];
    const line = ring
      .map((file, position) => (position === 0 ? show(file) : `${show(file)}${edgeKind(result.edges, ring[position - 1], file)}`))
      .join("\n    -> ");
    console.error(`✖ import cycle\n    ${line}`);
  }
  const verdict = `${result.files.length} files, ${result.components.length} cyclic group(s), ${result.cycles.length} cycle(s), ${result.unresolved.length} unresolved`;
  if (result.cycles.length > 0 || result.unresolved.length > 0) {
    console.error(`✖ ${verdict}`);
  } else {
    console.log(`✔ no import cycles (${verdict})`);
  }
}

// ---- Self-test: each case states what the check must report and what it must leave alone. ----

const CASES = [
  {
    name: "a value import back to the importer is a cycle",
    verbatim: true,
    files: { "a/x.ts": 'import { b } from "./y"; export const a = b;', "a/y.ts": 'import { a } from "./x"; export const b = a;' },
    cycles: 1,
  },
  {
    name: "an `import type` back edge is erased and leaves no cycle",
    verbatim: true,
    files: { "a/x.ts": 'import { b } from "./y"; export const a = b;', "a/y.ts": 'import type { a } from "./x"; export const b = 1 as unknown as typeof a;' },
    cycles: 0,
  },
  {
    name: "an inline type-only import is an edge when verbatimModuleSyntax is set",
    verbatim: true,
    files: { "a/x.ts": 'import { b } from "./y"; export const a = b;', "a/y.ts": 'import { type a } from "./x"; export const b = 1 as unknown as typeof a;' },
    cycles: 1,
  },
  {
    name: "an inline type-only import is erased when verbatimModuleSyntax is not set",
    verbatim: false,
    files: { "a/x.ts": 'import { b } from "./y"; export const a = b;', "a/y.ts": 'import { type a } from "./x"; export const b = 1 as unknown as typeof a;' },
    cycles: 0,
  },
  {
    name: "a barrel that re-exports a file importing the barrel is a cycle",
    verbatim: true,
    files: { "a/index.ts": 'export { widget } from "./widget";', "a/widget.ts": 'import { other } from "./index"; export const widget = other;' },
    cycles: 1,
  },
  {
    name: "`export type` re-exports leave no edge",
    verbatim: true,
    files: { "a/index.ts": 'export type { Widget } from "./widget";', "a/widget.ts": 'import { value } from "./index"; export type Widget = typeof value;' },
    cycles: 0,
  },
  {
    name: "a dynamic import back to the importer is a cycle",
    verbatim: true,
    files: { "a/x.ts": 'export const load = () => import("./y");', "a/y.ts": 'import { load } from "./x"; export const b = load;' },
    cycles: 1,
  },
  {
    name: "a cycle through two workspace packages is found at the files",
    verbatim: true,
    files: {
      "p/a/src/index.ts": 'import { b } from "@fx/b"; export const a = b;',
      "p/b/src/index.ts": 'import { a } from "@fx/a"; export const b = a;',
      "p/a/package.json": '{ "name": "@fx/a", "exports": { ".": { "source": "./src/index.ts", "import": "./dist/index.js" } } }',
      "p/b/package.json": '{ "name": "@fx/b", "exports": { ".": { "source": "./src/index.ts", "import": "./dist/index.js" } } }',
    },
    links: { "node_modules/@fx/a": "p/a", "node_modules/@fx/b": "p/b" },
    roots: ["p"],
    cycles: 1,
  },
  {
    name: "a chain with no way back is not a cycle",
    verbatim: true,
    files: { "a/x.ts": 'import { b } from "./y"; export const a = b;', "a/y.ts": 'import { c } from "./z"; export const b = c;', "a/z.ts": "export const c = 1;" },
    cycles: 0,
  },
  {
    name: "a relative import that does not resolve is reported, not skipped",
    verbatim: true,
    files: { "a/x.ts": 'import { missing } from "./gone"; export const a = missing;' },
    cycles: 0,
    unresolved: 1,
  },
];

function runSelfTest() {
  let failed = 0;
  for (const testCase of CASES) {
    const directory = mkdtempSync(join(tmpdir(), "check-cycles-"));
    try {
      writeFileSync(join(directory, "tsconfig.json"), JSON.stringify({ compilerOptions: { verbatimModuleSyntax: testCase.verbatim } }));
      for (const [name, text] of Object.entries(testCase.files)) {
        mkdirSync(dirname(join(directory, name)), { recursive: true });
        writeFileSync(join(directory, name), text);
      }
      for (const [link, target] of Object.entries(testCase.links ?? {})) {
        mkdirSync(dirname(join(directory, link)), { recursive: true });
        symlinkSync(join(directory, target), join(directory, link), "dir");
      }
      const result = check(directory, testCase.roots ?? ["a"]);
      const wantUnresolved = testCase.unresolved ?? 0;
      const ok = result.cycles.length === testCase.cycles && result.unresolved.length === wantUnresolved;
      console.log(`${ok ? "✔" : "✖"} ${testCase.name} (cycles ${result.cycles.length}/${testCase.cycles}, unresolved ${result.unresolved.length}/${wantUnresolved})`);
      if (!ok) failed += 1;
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }
  if (failed > 0) {
    console.error(`✖ ${failed} self-test case(s) failed`);
    process.exit(1);
  }
  console.log(`✔ ${CASES.length} self-test cases passed`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes("--test")) {
    runSelfTest();
  } else {
    const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "..");
    const roots = args.length > 0 ? args : ["packages"];
    const missing = roots.filter((root) => !existsSync(join(workspace, root)) || !statSync(join(workspace, root)).isDirectory());
    if (missing.length > 0) {
      console.error(`✖ not a directory under ${workspace}: ${missing.join(", ")}`);
      process.exit(2);
    }
    const result = check(workspace, roots);
    report(workspace, result);
    if (result.cycles.length > 0 || result.unresolved.length > 0) process.exit(1);
  }
}
