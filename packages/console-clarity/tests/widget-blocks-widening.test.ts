import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * A generated form and a generated detail are rewritten on every run, while their
 * `form.blocks.tsx` and `detail.blocks.tsx` are the author's and are written once. A key the kit's
 * `CrudFormBlocks` or `CrudDetailBlocks` gains later reaches a blocks file that never declared it,
 * and the widget that reads it must still type-check. These tests render the real templates and
 * check them with the compiler against the kit's own sources.
 */

const field = { name: "name", contractKind: "text" };

/** The context the CLI hands the widget templates for an entity with every operation. */
const context = {
  entity: "product",
  EntityPascal: "Product",
  entityPath: "/api/v1/product",
  packageName: "@test/domain-product",
  rowIdField: "productId",
  displayNameField: "name",
  hookGet: "useGetProduct",
  hookCreate: "useCreateProduct",
  hookUpdate: "useUpdateProduct",
  hasUpdate: true,
  fields: [field],
  detailFields: [field],
  listFields: [field],
  contractFilters: [{ kind: "choice", field: "name", options: ["a"] }],
  hookList: "useListProduct",
  listRowType: "ProductListRow",
  holders: [],
};

const widgetsDir = join(virtualRoot, "modules", "mymod", "src", "widgets", "product");

const domainStub = `
import type { OrvalMutationLike } from "@simplix-react/ui";

export interface ProductDetail { readonly productId: string; readonly name?: string }
export declare function useGetProduct(id: string, options?: unknown): { readonly data?: ProductDetail; readonly isLoading: boolean; readonly isError: boolean };
export declare function useCreateProduct(options?: unknown): OrvalMutationLike;
export declare function useUpdateProduct(options?: unknown): OrvalMutationLike;
export interface ProductListRow { readonly productId: string; readonly name?: string }
export declare function useListProduct(params?: unknown, options?: unknown): { data: unknown; isLoading: boolean; error: unknown };
`;

/** A form blocks file that declares none of the optional keys the form reads. */
const formBlocksWithNoKeys = `
import type { ContractOverrides, RecordFormField } from "@simplix-react-ui-kits/console-clarity/entity";

export interface FormBlocks {}

export function useFormBlocks<T>(_form: { readonly record: T | undefined; readonly editing: boolean; readonly generated: readonly RecordFormField[] }): FormBlocks {
  return {};
}

export function useFormContract(): ContractOverrides {
  return {};
}
`;

/** A detail blocks file that declares none of the optional keys the detail reads. */
const detailBlocksWithNoKeys = `
import type { ProductDetailProps } from "./detail";

export interface DetailBlocks {}

export function useDetailBlocks<T>(_detail: { readonly record: T | undefined; readonly props: ProductDetailProps }): DetailBlocks {
  return {};
}
`;

function check(widget: "list" | "form" | "detail", blocks: string, source = render(`${widget}.hbs`, context)): string[] {
  const file = join(widgetsDir, `${widget}.tsx`);
  return typecheck(
    {
      [file]: source,
      [join(widgetsDir, `${widget}.blocks.tsx`)]: blocks,
      [join(virtualRoot, "domain-product.ts")]: domainStub,
    },
    [file],
  );
}

/** A detail blocks file that takes the field table as an argument, as the stub the kit ships does. */
const detailBlocksReadingFields = `
import type { ContractField } from "@simplix-react-ui-kits/console-clarity/entity";
import type { ProductDetailProps } from "./detail";

export interface DetailBlocks {}

export function useDetailBlocks<T>({ fields }: { readonly record: T | undefined; readonly props: ProductDetailProps; readonly fields: readonly ContractField[] }): DetailBlocks {
  void fields.length;
  return {};
}
`;

/** A detail blocks file that imports the field table back from the widget that imports it. */
const detailBlocksImportingTheTable = `
import { ProductDetailFields, type ProductDetailProps } from "./detail";

export interface DetailBlocks {}

export function useDetailBlocks<T>(_detail: { readonly record: T | undefined; readonly props: ProductDetailProps }): DetailBlocks {
  void ProductDetailFields.length;
  return {};
}
`;

/** The widget as it reads its blocks without widening them: the blocks hook's own type, with nothing added. */
function unwidened(widget: "form" | "detail"): string {
  const widened = render(`${widget}.hbs`, context);
  const hook = widget === "form" ? "useFormBlocks" : "useDetailBlocks";
  const plain = widened.replace(new RegExp(`const blocks: [^=]+= ${hook}`), `const blocks = ${hook}`);
  expect(plain).not.toBe(widened);
  return plain;
}

describe("the generated form against a blocks file written before a key existed", () => {
  it("type-checks against a blocks file that declares none of the optional keys", () => {
    expect(check("form", formBlocksWithNoKeys)).toEqual([]);
  });

  it("type-checks against the blocks stub the kit ships beside it", () => {
    expect(check("form", render("form.blocks.hbs", context))).toEqual([]);
  });

  it("is told apart from a form that reads the keys without widening them", () => {
    const messages = check("form", formBlocksWithNoKeys, unwidened("form"));
    for (const key of ["title", "sections", "note", "fieldNotices", "toRequest"]) {
      expect(messages.some((line) => line.includes(`'${key}'`)), key).toBe(true);
    }
  });
});

describe("the generated detail against a blocks file written before a key existed", () => {
  it("type-checks against a blocks file that declares none of the optional keys", () => {
    expect(check("detail", detailBlocksWithNoKeys)).toEqual([]);
  });

  it("type-checks against the blocks stub the kit ships beside it", () => {
    expect(check("detail", render("detail.blocks.hbs", context))).toEqual([]);
  });

  it("is told apart from a detail that reads the keys without widening them", () => {
    const messages = check("detail", detailBlocksWithNoKeys, unwidened("detail"));
    for (const key of ["contract", "note", "notices", "tabs"]) {
      expect(messages.some((line) => line.includes(`'${key}'`)), key).toBe(true);
    }
  });
});

describe("the generated detail and the module cycle with its blocks file", () => {
  it("hands the blocks hook the field table, which a blocks file reads from its argument", () => {
    expect(check("detail", detailBlocksReadingFields)).toEqual([]);
  });

  it("does not export the field table, so a blocks file cannot import it back", () => {
    const source = render("detail.hbs", context);
    expect(source).not.toMatch(/export const ProductDetailFields/);
    const blocksFile = join(widgetsDir, "detail.blocks.tsx");
    const messages = typecheck(
      { [join(widgetsDir, "detail.tsx")]: source, [blocksFile]: detailBlocksImportingTheTable, [join(virtualRoot, "domain-product.ts")]: domainStub },
      [blocksFile],
    );
    expect(messages.some((line) => line.includes("ProductDetailFields")), messages.join("\n")).toBe(true);
  });
});

/** A list blocks file written before the hook took the contract's tables. */
const listBlocksWithOldInput = `
import type { RecordAction, RecordColumn, RecordFilter } from "@simplix-react-ui-kits/console-clarity/entity";
import type { ProductRow } from "./list";
import type { RecordListProps } from "@simplix-react-ui-kits/console-clarity/entity";

export interface ListBlocks {
  readonly columns?: readonly RecordColumn<ProductRow>[];
  readonly filters?: readonly RecordFilter<ProductRow>[];
  readonly chips?: RecordListProps<ProductRow>["chips"];
  readonly groupBy?: RecordListProps<ProductRow>["groupBy"];
  readonly actions?: readonly RecordAction<ProductRow>[];
  readonly leading?: RecordListProps<ProductRow>["leading"];
  readonly searchPlaceholder?: string;
  readonly empty?: RecordListProps<ProductRow>["empty"];
  readonly features?: RecordListProps<ProductRow>["features"];
}

export function useListBlocks(_list: { readonly generated: readonly RecordColumn<ProductRow>[] }): ListBlocks {
  return {};
}
`;

/** A list blocks file that reads both tables from its argument. */
const listBlocksReadingTables = `
import type { ContractField, ContractFilter, RecordAction, RecordColumn, RecordFilter } from "@simplix-react-ui-kits/console-clarity/entity";
import type { ProductRow } from "./list";
import type { RecordListProps } from "@simplix-react-ui-kits/console-clarity/entity";

export interface ListBlocks {
  readonly columns?: readonly RecordColumn<ProductRow>[];
  readonly filters?: readonly RecordFilter<ProductRow>[];
  readonly chips?: RecordListProps<ProductRow>["chips"];
  readonly groupBy?: RecordListProps<ProductRow>["groupBy"];
  readonly actions?: readonly RecordAction<ProductRow>[];
  readonly leading?: RecordListProps<ProductRow>["leading"];
  readonly searchPlaceholder?: string;
  readonly empty?: RecordListProps<ProductRow>["empty"];
  readonly features?: RecordListProps<ProductRow>["features"];
}

export function useListBlocks({ fields, contractFilters }: { readonly generated: readonly RecordColumn<ProductRow>[]; readonly fields: readonly ContractField[]; readonly contractFilters: readonly ContractFilter[] }): ListBlocks {
  void fields.length;
  void contractFilters.length;
  return {};
}
`;

/** A list blocks file that imports the tables back from the widget that imports it. */
const listBlocksImportingTheTables = `
import { ProductColumnFields, ProductFilters, type ProductRow } from "./list";

export interface ListBlocks {}

export function useListBlocks(_list: { readonly generated: readonly unknown[] }): ListBlocks {
  void ProductColumnFields.length;
  void ProductFilters.length;
  return {};
}
`;

/** A form blocks file that reads the field table from its argument. */
const formBlocksReadingFields = `
import type { ContractField, ContractOverrides, RecordFormField } from "@simplix-react-ui-kits/console-clarity/entity";

export interface FormBlocks {}

export function useFormBlocks<T>({ fields }: { readonly record: T | undefined; readonly editing: boolean; readonly generated: readonly RecordFormField[]; readonly fields: readonly ContractField[] }): FormBlocks {
  void fields.length;
  return {};
}

export function useFormContract(): ContractOverrides {
  return {};
}
`;

/** A form blocks file that imports the field table back from the widget that imports it. */
const formBlocksImportingTheTable = `
import type { ContractOverrides } from "@simplix-react-ui-kits/console-clarity/entity";
import { ProductFormFields } from "./form";

export interface FormBlocks {}

export function useFormBlocks(_form: unknown): FormBlocks {
  void ProductFormFields.length;
  return {};
}

export function useFormContract(): ContractOverrides {
  return {};
}
`;

/** Type-checks a blocks file against its rendered widget, reporting what the blocks file gets wrong. */
function checkBlocks(widget: "list" | "form", blocks: string): string[] {
  const blocksFile = join(widgetsDir, `${widget}.blocks.tsx`);
  return typecheck(
    { [join(widgetsDir, `${widget}.tsx`)]: render(`${widget}.hbs`, context), [blocksFile]: blocks, [join(virtualRoot, "domain-product.ts")]: domainStub },
    [blocksFile],
  );
}

describe("the generated list and form and the module cycle with their blocks files", () => {
  it("type-checks the list against a blocks file written before the tables were passed", () => {
    expect(check("list", listBlocksWithOldInput)).toEqual([]);
  });

  it("type-checks the list against the blocks stub the kit ships beside it", () => {
    expect(check("list", render("list.blocks.hbs", context))).toEqual([]);
  });

  it("hands the list blocks hook both tables, which a blocks file reads from its argument", () => {
    expect(check("list", listBlocksReadingTables)).toEqual([]);
  });

  it("does not export the list's tables, so a blocks file cannot import them back", () => {
    const source = render("list.hbs", context);
    expect(source).not.toMatch(/export const Product(ColumnFields|Filters)/);
    const messages = checkBlocks("list", listBlocksImportingTheTables);
    expect(messages.some((line) => line.includes("ProductColumnFields")), messages.join("\n")).toBe(true);
    expect(messages.some((line) => line.includes("ProductFilters")), messages.join("\n")).toBe(true);
  });

  it("hands the form blocks hook the field table, which a blocks file reads from its argument", () => {
    expect(check("form", formBlocksReadingFields)).toEqual([]);
  });

  it("does not export the form's table, so a blocks file cannot import it back", () => {
    const source = render("form.hbs", context);
    expect(source).not.toMatch(/export const ProductFormFields/);
    const messages = checkBlocks("form", formBlocksImportingTheTable);
    expect(messages.some((line) => line.includes("ProductFormFields")), messages.join("\n")).toBe(true);
  });
});

describe("the generated detail imports only what its branches use", () => {
  it("imports neither useAllowed nor RecordTab when the record has no holders", () => {
    const source = render("detail.hbs", context);
    const kitImport = source.split("\n").find((line) => line.includes("console-clarity/entity")) ?? "";
    expect(kitImport).not.toMatch(/\buseAllowed\b/);
    expect(kitImport).not.toMatch(/\bRecordTab\b/);
  });

  it("imports both when the record has holders", () => {
    const holder = { accessList: "listAccess", hookList: "useListHolder", packageName: "@test/domain-holder", entity: "holder", EntityPascal: "Holder", fkField: "productId", rowIdField: "holderId" };
    const source = render("detail.hbs", { ...context, holders: [holder] });
    const kitImport = source.split("\n").find((line) => line.includes("console-clarity/entity")) ?? "";
    expect(kitImport).toMatch(/\buseAllowed\b/);
    expect(kitImport).toMatch(/\bRecordTab\b/);
  });
});
