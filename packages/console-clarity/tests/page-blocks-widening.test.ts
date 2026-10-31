import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * A generated CRUD page is rewritten on every run, while its `page.blocks.tsx` is the author's and
 * is written once. A key the kit's blocks contract gains later therefore reaches a blocks file
 * that never declared it, and the page that reads it must still type-check. These tests render the
 * real `crud-page.hbs` and `page.blocks.hbs` and check them with the compiler against the kit's own
 * sources, with blocks files written before each key existed.
 */

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(here, "..");
const templatesDir = join(packageDir, "templates");

interface TemplateEngine {
  create(): {
    registerHelper(name: string, helper: () => string): void;
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

function render(templateFile: string, context: Record<string, unknown>): string {
  const engine = Handlebars.create();
  engine.registerHelper("ldb", () => "{{");
  engine.registerHelper("rdb", () => "}}");
  return engine.compile(readFileSync(join(templatesDir, templateFile), "utf-8"), { noEscape: true })(context);
}

/** The context the CLI hands the page templates for an entity with every operation. */
const context = {
  entity: "product",
  EntityPascal: "Product",
  entityKebab: "product",
  entityPath: "/api/v1/product",
  packageName: "@test/domain-product",
  rowIdField: "productId",
  displayNameField: "name",
  hookDelete: "useDeleteProduct",
  accessCreate: "createProductAccess",
  accessUpdate: "updateProductAccess",
  accessDelete: "deleteProductAccess",
  hasCreate: true,
  hasUpdate: true,
  hasDelete: true,
  hasForm: true,
};

// Nothing is written: the files below exist only for the compiler's host.
const virtualRoot = join(packageDir, ".template-check");
const pageDir = join(virtualRoot, "modules", "mymod", "src", "pages", "product");
const widgetsDir = join(virtualRoot, "modules", "mymod", "src", "widgets", "product");

const widgetsStub = `
import type { ReactNode } from "react";
import type { RecordAction } from "@simplix-react-ui-kits/console-clarity/entity";

export interface ProductRow { readonly productId: string; readonly name?: string }
export interface ProductListProps {
  readonly list: ReturnType<typeof useProductList>;
  readonly activeRowId?: string;
  readonly onRowClick?: (row: ProductRow) => void;
  readonly actions?: readonly RecordAction<ProductRow>[];
}
export interface ProductDetailProps {
  readonly productId: string;
  readonly onClose?: () => void;
  readonly onEdit?: () => void;
  readonly onDelete?: (name: string) => void;
  readonly onDeleted?: () => void;
}
export interface ProductFormProps {
  readonly productId?: string;
  readonly onClose?: () => void;
  readonly onSuccess?: () => void;
  readonly onCancel?: () => void;
}
export declare function useProductList(params?: Readonly<Record<string, unknown>>): { readonly rows: readonly ProductRow[] };
export declare function ProductList(props: ProductListProps): ReactNode;
export declare function ProductDetail(props: ProductDetailProps): ReactNode;
export declare function ProductForm(props: ProductFormProps): ReactNode;
`;

const domainStub = `
import type { OrvalMutationLike } from "@simplix-react/ui";
import type { useAllowed } from "@simplix-react-ui-kits/console-clarity/entity";

type Rule = Parameters<typeof useAllowed>[0];
export declare function useDeleteProduct(): OrvalMutationLike;
export declare const createProductAccess: Rule;
export declare const updateProductAccess: Rule;
export declare const deleteProductAccess: Rule;
`;

/** A blocks file written before the page read `editDisabled` and `deleteDisabled`. */
const blocksBeforeRowGates = `
import type { ConsoleSearch, CrudPageNavigation } from "@simplix-react-ui-kits/console-clarity/page";
import type { RecordAction } from "@simplix-react-ui-kits/console-clarity/entity";
import type { ProductRow } from "../../widgets/product";

export interface PageBlocks {
  readonly listParams?: Readonly<Record<string, unknown>>;
  readonly rowActions?: (nav: CrudPageNavigation) => readonly RecordAction<ProductRow>[];
}

export function usePageBlocks(_page: { readonly search: ConsoleSearch; readonly onNavigate: (search: ConsoleSearch) => void }): PageBlocks {
  return {};
}
`;

/** A blocks file that declares none of the optional keys the page reads. */
const blocksWithNoKeys = `
import type { ConsoleSearch } from "@simplix-react-ui-kits/console-clarity/page";

export interface PageBlocks {}

export function usePageBlocks(_page: { readonly search: ConsoleSearch; readonly onNavigate: (search: ConsoleSearch) => void }): PageBlocks {
  return {};
}
`;

function typecheck(files: Readonly<Record<string, string>>, roots: readonly string[]): string[] {
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

function check(blocks: string, pageSource = render("crud-page.hbs", context)): string[] {
  const page = join(pageDir, "crud-page.tsx");
  return typecheck(
    {
      [page]: pageSource,
      [join(pageDir, "page.blocks.tsx")]: blocks,
      [join(widgetsDir, "index.ts")]: widgetsStub,
      [join(virtualRoot, "domain-product.ts")]: domainStub,
    },
    [page],
  );
}

describe("the generated CRUD page against a blocks file written before a key existed", () => {
  it("type-checks against a blocks file that has no editDisabled and no deleteDisabled", () => {
    expect(check(blocksBeforeRowGates)).toEqual([]);
  });

  it("type-checks against a blocks file that declares none of the optional keys", () => {
    expect(check(blocksWithNoKeys)).toEqual([]);
  });

  it("type-checks against the blocks stub the kit ships beside it", () => {
    expect(check(render("page.blocks.hbs", context))).toEqual([]);
  });

  it("is told apart from a page that reads the keys without widening them", () => {
    // The page as it was before the widening: the blocks hook's own type, with nothing added.
    const widened = render("crud-page.hbs", context);
    const unwidened = widened.replace(/const blocks: [^=]+= usePageBlocks/, "const blocks = usePageBlocks");
    expect(unwidened).not.toBe(widened);

    const messages = check(blocksBeforeRowGates, unwidened);
    expect(messages.some((line) => line.includes("editDisabled"))).toBe(true);
    expect(messages.some((line) => line.includes("deleteDisabled"))).toBe(true);
  });
});
