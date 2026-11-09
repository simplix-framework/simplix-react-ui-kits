import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectTemplates, renderTemplate } from "@simplix-react/cli";
import ts from "typescript";

/**
 * Renders a template the way the generator does and type-checks the result against the kit's own
 * sources, with every other file the rendered one imports supplied in memory.
 *
 * <p>The templates are the ones in force for a project that draws with this kit (the kit's own and
 * the base kit's beneath them, with the kit's values written in), read and rendered by the CLI.
 */

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(here, "..");
const templates = await loadProjectTemplates(packageDir, packageDir);

export function render(templateFile: string, context: Record<string, unknown>): string {
  const name = templateFile.replace(/\.hbs$/, "");
  const source = templates.get(name);
  if (source === undefined) throw new Error(`${templateFile}: no template of that name is in force for this kit`);
  return renderTemplate(source, context);
}

// Nothing is written: the files the tests hand in exist only for the compiler's host.
export const virtualRoot = join(packageDir, ".template-check");

/**
 * The compiler's messages for `roots`, with `files` present in memory; `domain-product.ts` under {@link virtualRoot} stands for the domain package.
 * `extraPaths` adds module mappings of the test's own (a module's `pages` entry, a stand-in for the router).
 */
export function typecheck(files: Readonly<Record<string, string>>, roots: readonly string[], extraPaths: Readonly<Record<string, readonly string[]>> = {}): string[] {
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
      ...extraPaths,
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

