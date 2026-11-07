import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

/**
 * Renders a kit template the way the generator does and type-checks the result against the kit's
 * own sources, with every other file the rendered one imports supplied in memory.
 */

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(here, "..");
const templatesDir = join(packageDir, "templates");

interface TemplateEngine {
  create(): {
    registerHelper(name: string, helper: (...args: never[]) => unknown): void;
    compile(source: string, options: { noEscape: boolean }): (context: Record<string, unknown>) => string;
  };
}

// The template engine is the CLI's own, reached through the CLI that the `simplix-react` meta
// package brings, so the kit renders a template exactly as the generator does.
function cliPackageManifest(): string {
  const lookup = createRequire(import.meta.url).resolve.paths("@simplix-react/cli") ?? [];
  const found = lookup.map((dir) => join(dir, "@simplix-react", "cli", "package.json")).find((path) => existsSync(path));
  if (!found) throw new Error("@simplix-react/cli is not installed; the simplix-react meta package brings it");
  return found;
}
const Handlebars = createRequire(cliPackageManifest())("handlebars") as TemplateEngine;

export function render(templateFile: string, context: Record<string, unknown>): string {
  const engine = Handlebars.create();
  engine.registerHelper("ldb", () => "{{");
  engine.registerHelper("rdb", () => "}}");
  engine.registerHelper("eq", (a: unknown, b: unknown) => a === b);
  // The CLI's `or`: true when any argument before Handlebars' trailing options object is.
  engine.registerHelper("or", (...args: unknown[]) => args.slice(0, -1).some(Boolean));
  return engine.compile(readFileSync(join(templatesDir, templateFile), "utf-8"), { noEscape: true })(context);
}

// Nothing is written: the files the tests hand in exist only for the compiler's host.
export const virtualRoot = join(packageDir, ".template-check");

/** The compiler's messages for `roots`, with `files` present in memory; `domain-product.ts` under {@link virtualRoot} stands for the domain package. */
export function typecheck(files: Readonly<Record<string, string>>, roots: readonly string[]): string[] {
  const config = ts.readConfigFile(join(packageDir, "tsconfig.json"), ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, packageDir);
  const options: ts.CompilerOptions = {
    ...parsed.options,
    noEmit: true,
    rootDir: undefined,
    outDir: undefined,
    paths: {
      "@simplix-react-ui-kits/console-clarity/*": [join(packageDir, "src", "*")],
      "@test/domain-product": [join(virtualRoot, "domain-product.ts")],
      "@test/domain-member": [join(virtualRoot, "domain-member.ts")],
      "@test/member-widgets": [join(virtualRoot, "modules", "other", "src", "widgets", "index.ts")],
    },
  };
  const present = new Map(Object.entries(files));
  const host = ts.createCompilerHost(options);
  const { fileExists, readFile, getSourceFile, directoryExists } = host;
  host.fileExists = (path) => present.has(path) || fileExists(path);
  host.readFile = (path) => present.get(path) ?? readFile(path);
  host.directoryExists = (path) => [...present.keys()].some((file) => file.startsWith(path + sep)) || (directoryExists?.(path) ?? false);
  host.getSourceFile = (path, languageVersion, onError, shouldCreate) => {
    const text = present.get(path);
    return text === undefined ? getSourceFile(path, languageVersion, onError, shouldCreate) : ts.createSourceFile(path, text, languageVersion, true);
  };
  const program = ts.createProgram({ rootNames: [...roots], options, host });
  return roots.flatMap((root) => {
    const source = program.getSourceFile(root);
    if (!source) return [`${root}: not found by the compiler`];
    return ts.getPreEmitDiagnostics(program, source).map((diagnostic) => {
      const where = diagnostic.start === undefined ? "" : `:${source.getLineAndCharacterOfPosition(diagnostic.start).line + 1}`;
      return `${root.slice(virtualRoot.length)}${where} TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`;
    });
  });
}

