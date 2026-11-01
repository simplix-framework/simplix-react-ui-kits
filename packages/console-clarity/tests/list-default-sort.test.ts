import { describe, expect, it } from "vitest";

import { render } from "./template-typecheck";

/**
 * A generated list opens in the order the CLI chose for it (the entity's declared default sort, or
 * the project's first candidate the row carries), the order a reorder owns, or the server's own.
 * Never the row's key: a list sorted by an opaque id is in no order a reader can use.
 */

const field = { name: "name", contractKind: "text" };

const context = {
  entity: "product",
  EntityPascal: "Product",
  entityPath: "/api/v1/product",
  packageName: "@test/domain-product",
  rowIdField: "productId",
  fields: [field],
  listFields: [field],
  contractFilters: [],
  hookList: "useListProduct",
  listRowType: "ProductListRow",
  holders: [],
};

describe("the generated list's default sort", () => {
  it("opens in the chosen order", () => {
    const text = render("list.hbs", { ...context, defaultSort: { field: "createdAt", direction: "desc" } });
    expect(text).toContain('defaultSort: { field: "createdAt", direction: "desc" },');
  });

  it("opens in the reorder's order where a reorder owns it", () => {
    const text = render("list.hbs", { ...context, orderField: "sortOrder", defaultSort: { field: "createdAt", direction: "desc" } });
    expect(text).toContain('defaultSort: { field: "sortOrder", direction: "asc" },');
    expect(text).not.toContain('"createdAt"');
  });

  it("states no order where none was chosen, never the row's key", () => {
    const text = render("list.hbs", context);
    expect(text).not.toContain("defaultSort");
    expect(text).not.toContain('field: "productId"');
  });
});
