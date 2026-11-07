import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * The generated list, detail and form are each the widget's whole start: they compile on their
 * own, with no blocks file beside them, against the kit's own sources.
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
  displayNameFields: ["name"],
  nameContractFields: [{ name: "name", contractKind: "text" }],
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

function check(widget: "list" | "form" | "detail", source = render(`${widget}.hbs`, context)): string[] {
  const file = join(widgetsDir, `${widget}.tsx`);
  return typecheck({ [file]: source, [join(virtualRoot, "domain-product.ts")]: domainStub }, [file]);
}

describe.each(["list", "detail", "form"] as const)("the generated %s", (widget) => {
  it("compiles alone and reads no blocks file", () => {
    const source = render(`${widget}.hbs`, context);
    expect(source).not.toContain(".blocks");
    expect(check(widget, source)).toEqual([]);
  });
});

describe("the generated detail's changes tab", () => {
  it("hands the record its field enums, so an enum value the audit record names no enum for is labeled", () => {
    const source = render("detail.hbs", context);
    expect(source).toContain("fieldEnums={fieldEnumsOf(ProductDetailFields)}");
    expect(check("detail", source)).toEqual([]);
  });
});

describe("the generated detail's read", () => {
  it("carries the record-read meta, since the record draws its own failed read", () => {
    const source = render("detail.hbs", context);
    expect(source).toContain("useGetProduct(props.productId, { query: { meta: RECORD_READ_META } })");
    expect(source).toMatch(/notices=\{isError \?/);
  });
});


describe("the generated form with a field only a verb moves", () => {
  it("compiles with the field's create default in the body", () => {
    const source = render("form.hbs", { ...context, verbOnlyCreateDefaults: [{ name: "enabled", defaultLiteral: "true" }] });
    expect(source).toContain("{ enabled: true, ...written }");
    expect(check("form", source)).toEqual([]);
  });
});

describe("the generated form's save", () => {
  it("says a saved record in a toast, new or edited, before the panel closes", () => {
    const source = render("form.hbs", context);
    expect(source).toContain("announce({ message: editing ? words.saved : words.created });");
    expect(source.indexOf("announce({")).toBeLessThan(source.indexOf("props.onSuccess?.()"));
    expect(check("form", source)).toEqual([]);
  });
});
