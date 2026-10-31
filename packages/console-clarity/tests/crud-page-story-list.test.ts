import { describe, expect, it } from "vitest";

import { render } from "./template-typecheck";

/**
 * The board frame a scaffold writes draws the list the generated page draws: the contract's
 * filters, the one view row action, and a search box only where the route declares keyword fields.
 * A frame missing any of them differs from its screen before anybody customises either.
 */

const field = { name: "name", contractKind: "text" };

const context = {
  entity: "product",
  EntityPascal: "Product",
  rowIdField: "productId",
  displayNameField: "name",
  listFields: [field],
  detailFields: [field],
  contractFilters: [
    { kind: "choice", field: "status", enumTypeName: "ProductStatus", options: ["ON", "OFF"] },
    { kind: "dateRange", field: "createdOn", dateOnly: true },
  ],
  fixtureRowsJson: "[]",
};

describe("the generated board frame's list", () => {
  it("offers the contract's filters and the view row action", () => {
    const source = render("crud-page.stories.hbs", { ...context, hasKeywordSearch: true });
    expect(source).toContain('{ kind: "choice", field: "status", enumName: "ProductStatus", options: ["ON", "OFF"] },');
    expect(source).toContain('{ kind: "dateRange", field: "createdOn", dateOnly: true },');
    expect(source).toContain("filters={contract.filters<Row>(FILTERS)}");
    expect(source).toContain('actions={[{ type: "view", label: words.view, onClick: (row) => nav.showDetail(idOf(row)) }]}');
    expect(source).not.toContain("search: false");
  });

  it("draws no search box where the route declares no keyword field", () => {
    const source = render("crud-page.stories.hbs", { ...context, hasKeywordSearch: false });
    expect(source).toContain("features={ { search: false } }");
  });

  it("says rows are recorded elsewhere where the screen creates none, as the generated list does", () => {
    const readOnly = render("crud-page.stories.hbs", { ...context, hasCreate: false });
    expect(readOnly).toContain("description: words.emptyDescriptionRecorded");
    expect(render("list.hbs", { ...context, hasCreate: false })).toContain("description: words.emptyDescriptionRecorded");
    expect(render("crud-page.stories.hbs", { ...context, hasCreate: true })).toContain("description: words.emptyDescription }");
    expect(render("list.hbs", { ...context, hasCreate: true })).toContain("description: words.emptyDescription }");
  });
});
