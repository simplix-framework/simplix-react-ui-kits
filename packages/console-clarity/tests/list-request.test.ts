import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * A list whose page reads sums hands the conditions of its own request to that read, so a sum
 * follows the filter bar, the search text, the chosen time window and the scope the screen forces.
 * The list is generated the same way with or without them for a page that reads no sums.
 */

const field = { name: "name", contractKind: "text" };

const context = {
  entity: "product",
  EntityPascal: "Product",
  entityPath: "/api/v1/product",
  packageName: "@test/domain-product",
  rowIdField: "productId",
  displayNameField: "name",
  displayNameFields: ["name"],
  nameContractFields: [field],
  fields: [field],
  listFields: [field],
  contractFilters: [{ kind: "choice", field: "name", options: ["a"] }],
  hookList: "useListProduct",
  listRowType: "ProductListRow",
  holders: [],
};

const aggregates = { aggregates: { hook: "useGetProductAggregates", figures: [{ field: "price", op: "sum", kind: "number", isRowCount: false }] } };

const widgetsDir = join(virtualRoot, "modules", "mymod", "src", "widgets", "product");

const domainStub = `
export interface ProductListRow { readonly productId: string; readonly name?: string }
export declare function useListProduct(params?: unknown, options?: unknown): { data: unknown; isLoading: boolean; error: unknown };
`;

function check(source: string): string[] {
  const file = join(widgetsDir, "list.tsx");
  return typecheck({ [file]: source, [join(virtualRoot, "domain-product.ts")]: domainStub }, [file]);
}

describe("the generated list under a page that reads sums", () => {
  it("hands its request conditions to the page, with the keyword key and the forced scope", () => {
    const source = render("list.hbs", { ...context, hasKeywordSearch: true, figureTiles: aggregates });
    expect(source).toContain("const list = useCrudList<ProductRow>(");
    expect(source).toContain("return withListRequest(list, { forced: params, ...options });");
    expect(check(source)).toEqual([]);
  });

  it("hands them over where the route has no keyword search and no money filter", () => {
    const source = render("list.hbs", { ...context, hasKeywordSearch: false, figureTiles: aggregates });
    expect(source).not.toContain("const options");
    expect(source).toContain("return withListRequest(list, { forced: params });");
    expect(check(source)).toEqual([]);
  });

  it("carries the money filters' transform with the request", () => {
    const money = { kind: "number", field: "price", currency: "KRW", scale: 0 };
    const source = render("list.hbs", { ...context, hasKeywordSearch: true, hasMoneyFilter: true, contractFilters: [money], figureTiles: aggregates });
    expect(source).toContain("transformFilters: moneyFilterTransform(ProductFilters)");
    expect(source).toContain("return withListRequest(list, { forced: params, ...options });");
    expect(check(source)).toEqual([]);
  });

  it("is unchanged for a page that reads no sums", () => {
    const source = render("list.hbs", { ...context, hasKeywordSearch: true });
    expect(source).not.toContain("withListRequest");
    expect(source).toContain("return useCrudList<ProductRow>(");
    const counts = render("list.hbs", { ...context, hasKeywordSearch: true, figureTiles: { status: { hook: "useGetProductStatusCounts", field: "name", enumName: "E", options: ["a"] } } });
    expect(counts).not.toContain("withListRequest");
  });
});
