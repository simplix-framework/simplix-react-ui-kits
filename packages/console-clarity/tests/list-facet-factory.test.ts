import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * A facet resolves the records it has picked by one column of the filtered list. A project that
 * names a facet factory gets one facet per filtered column, made once at module scope; one that
 * names a fixed hook gets that hook for every column.
 */

const owner = { name: "ownerUserId", contractKind: "reference", peekKind: "userAccount", nameField: "ownerUserName" };

const context = {
  entity: "product",
  EntityPascal: "Product",
  entityPath: "/api/v1/product",
  packageName: "@test/domain-product",
  rowIdField: "productId",
  displayNameField: "name",
  displayNameFields: ["name"],
  nameContractFields: [{ name: "name", contractKind: "text" }],
  fields: [owner],
  listFields: [owner],
  contractFilters: [{ kind: "reference", field: "ownerUserId" }],
  hookList: "useListProduct",
  listRowType: "ProductListRow",
  holders: [],
};

const domainStub = `
import type { CrudListFilters, EntityFacet } from "@simplix-react/ui";
export interface ProductListRow { readonly productId: string; readonly ownerUserId?: string; readonly ownerUserName?: string }
export declare function useListProduct(params?: unknown, options?: unknown): { data: unknown; isLoading: boolean; error: unknown };
export declare function createUserFacet(idField: string): (state: CrudListFilters) => EntityFacet;
export declare function useUserIdFacet(state: CrudListFilters): EntityFacet;
`;

function check(source: string): string[] {
  const file = join(virtualRoot, "modules", "mymod", "src", "widgets", "product", "list.tsx");
  return typecheck({ [file]: source, [join(virtualRoot, "domain-product.ts")]: domainStub }, [file]);
}

describe("a list filter over a reference", () => {
  it("is read through a facet the list makes for its own column, where the project names a factory", () => {
    const source = render("list.hbs", {
      ...context,
      listFacets: [{ field: "ownerUserId", hook: "useOwnerUserIdFacet", factory: "createUserFacet", from: "@test/domain-product" }],
      listFacetImports: [{ from: "@test/domain-product", hooks: "createUserFacet" }],
    });
    expect(source).toContain('const useOwnerUserIdFacet = createUserFacet("ownerUserId");');
    expect(source).toContain("const ownerUserIdFacet = useOwnerUserIdFacet(list.filters);");
    expect(check(source)).toEqual([]);
  });

  it("is read through the project's hook as it is, where the project names a fixed one", () => {
    const source = render("list.hbs", {
      ...context,
      listFacets: [{ field: "ownerUserId", hook: "useUserIdFacet", from: "@test/domain-product" }],
      listFacetImports: [{ from: "@test/domain-product", hooks: "useUserIdFacet" }],
    });
    expect(source).not.toContain("createUserFacet");
    expect(source).toContain("const ownerUserIdFacet = useUserIdFacet(list.filters);");
    expect(check(source)).toEqual([]);
  });
});
