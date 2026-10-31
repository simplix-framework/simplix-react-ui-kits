import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * The list's search box sends its text as the route's keyword search, which only a route whose
 * search DTO marks keyword fields accepts. The CLI says which through `hasKeywordSearch`; the
 * generated list either wires the search key or draws no search box.
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
  fields: [field],
  listFields: [field],
  contractFilters: [{ kind: "choice", field: "name", options: ["a"] }],
  hookList: "useListProduct",
  listRowType: "ProductListRow",
  holders: [],
};

const widgetsDir = join(virtualRoot, "modules", "mymod", "src", "widgets", "product");

const domainStub = `
export interface ProductListRow { readonly productId: string; readonly name?: string }
export declare function useListProduct(params?: unknown, options?: unknown): { data: unknown; isLoading: boolean; error: unknown };
`;

function check(source: string): string[] {
  const file = join(widgetsDir, "list.tsx");
  return typecheck(
    {
      [file]: source,
      [join(widgetsDir, "list.blocks.tsx")]: render("list.blocks.hbs", context),
      [join(virtualRoot, "domain-product.ts")]: domainStub,
    },
    [file],
  );
}

describe("the generated list's search box", () => {
  it("sends its text as the keyword search where the route declares keyword fields", () => {
    const source = render("list.hbs", { ...context, hasKeywordSearch: true });
    expect(source).toContain("const options = { searchKey: SEARCHABLE_KEYWORD_PARAM };");
    expect(source).toContain("adaptOrvalList<ProductRow>(useListProduct, options)");
    expect(source).toContain("adaptForcedList<ProductRow>(useListProduct, { ...params }, options)");
    expect(source).not.toContain("search: false");
    expect(check(source)).toEqual([]);
  });

  it("is not drawn where the route declares none, since the text would reach nothing", () => {
    const source = render("list.hbs", { ...context, hasKeywordSearch: false });
    expect(source).not.toContain("SEARCHABLE_KEYWORD_PARAM");
    expect(source).toContain("features={ { search: false, ...blocks.features } }");
    expect(check(source)).toEqual([]);
  });
});

describe("a detail's holder tab", () => {
  const holder = (hasKeywordSearch: boolean) => ({
    entity: "member",
    EntityPascal: "Member",
    key: "memberByProductId",
    hookList: "useListMembers",
    accessList: "listMembersAccess",
    packageName: "@test/domain-member",
    filterKey: "productId.equals",
    rowIdField: "memberId",
    fields: [{ name: "name", contractKind: "text" }],
    hasKeywordSearch,
  });
  const detail = (hasKeywordSearch: boolean) =>
    render("detail.hbs", { ...context, detailFields: [field], hookGet: "useGetProduct", holders: [holder(hasKeywordSearch)], holdersKeywordSearch: hasKeywordSearch });

  it("sends its search as the holder route's keyword search where that route declares keyword fields", () => {
    const source = detail(true);
    expect(source).toContain("adaptForcedList(useListMembers, holder0Forced, { searchKey: SEARCHABLE_KEYWORD_PARAM, queryOptions:");
    expect(source).toMatch(/import \{ adaptForcedList, forcedScope, SEARCHABLE_KEYWORD_PARAM, useCrudList \}/);
    expect(source).not.toContain("features: { search: false }");
  });

  it("draws no search box where the holder route declares none", () => {
    const source = detail(false);
    expect(source).not.toContain("SEARCHABLE_KEYWORD_PARAM");
    expect(source).toContain("features: { search: false }");
  });
});
