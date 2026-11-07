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
  displayNameFields: ["name"],
  nameContractFields: [{ name: "name", contractKind: "text" }],
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
    expect(source).toContain('{ type: "view", label: words.view, onClick: (row) => nav.showDetail(idOf(row)) },');
    expect(source).not.toContain("search: false");
  });

  it("draws no search box where the route declares no keyword field", () => {
    const source = render("crud-page.stories.hbs", { ...context, hasKeywordSearch: false });
    expect(source).toContain("features={ { search: false } }");
  });

  it("says rows are recorded elsewhere where the screen creates none, as the generated list does", () => {
    const readOnly = render("crud-page.stories.hbs", { ...context, hasCreate: false });
    expect(readOnly).toContain("title: words.emptyTitleRecorded, description: words.emptyDescriptionRecorded");
    expect(render("list.hbs", { ...context, hasCreate: false })).toContain("title: words.emptyTitleRecorded, description: words.emptyDescriptionRecorded");
    expect(render("crud-page.stories.hbs", { ...context, hasCreate: true })).toContain("title: words.emptyTitle, description: words.emptyDescription }");
    expect(render("list.hbs", { ...context, hasCreate: true })).toContain("title: words.emptyTitle, description: words.emptyDescription }");
  });

  it("draws the row and footer verbs and the drag the generated screen offers", () => {
    const full = render("crud-page.stories.hbs", { ...context, hasCreate: true, hasUpdate: true, hasDelete: true, hookOrder: "useOrderProducts", orderField: "sortOrder" });
    expect(full).toContain('{ type: "edit", label: words.edit, onClick: (row) => nav.showEdit(idOf(row)) },');
    expect(full).toContain('{ type: "delete", label: words.delete, onClick: (row) => records.remove(idOf(row)) },');
    expect(full).toContain('reorder={ { orderField: "sortOrder", idField: "productId"');
    expect(full).toContain('{ label: words.edit, onClick: () => nav.showEdit(id) },');
    const readOnly = render("crud-page.stories.hbs", { ...context });
    expect(readOnly).not.toContain("words.edit");
    expect(readOnly).not.toContain("reorder=");
    expect(readOnly).not.toContain("actions={[\n              { label");
  });

  it("draws the header standing and the audit strip the generated detail draws", () => {
    const full = render("crud-page.stories.hbs", { ...context, statusField: "status", hasAuditFields: true });
    expect(full).toContain('const BADGE_FIELD = DETAIL_FIELDS.find((field) => field.name === "status");');
    expect(full).toContain("status={row && BADGE_FIELD ? badgeOf(contract.value(BADGE_FIELD, row)) : undefined}");
    expect(full).toContain("audit={row ? { id: row.productId == null ? undefined : String(row.productId)");
    expect(full).toContain("import { badgeOf, ");
    const plain = render("crud-page.stories.hbs", { ...context });
    expect(plain).not.toContain("BADGE_FIELD");
    expect(plain).not.toContain("audit=");
  });

  it("draws a tab for each list of the records that hold this one, as the generated detail does", () => {
    const holder = { entity: "member", EntityPascal: "Member", key: "memberByProductId", rowIdField: "memberId", fields: [{ name: "name", contractKind: "text" }], hasKeywordSearch: false };
    const held = render("crud-page.stories.hbs", { ...context, holders: [holder], holderColumnsHooks: [{ hook: "useMemberColumns", from: "../member", field: "productId" }] });
    expect(held).toContain("const MemberHolderFields_0: readonly ContractField[] = [");
    expect(held).toContain('const holder0Contract = useRecordContract("member");');
    expect(held).toContain('key: "memberByProductId",');
    expect(held).toContain("columns: holder0Contract.columns<Row>(MemberHolderFields_0),");
    expect(held).not.toContain("            sections={[");
    const alone = render("crud-page.stories.hbs", { ...context, holders: [] });
    expect(alone).not.toContain("tabs={[");
    expect(alone).toContain("            sections={[");
  });

  it("mirrors the generated screen's tones, signs, header badge and holder tabs", () => {
    const toned = { name: "state", contractKind: "enum", enumTypeName: "ProductState", options: ["ON", "OFF"], tones: { ON: "success", OFF: "danger" } };
    const signed = { name: "amount", contractKind: "credits", signed: true };
    const holderField = { name: "label", contractKind: "text" };
    const holders = [
      { entity: "productNote", EntityPascal: "ProductNote", key: "notes", filterKey: "productId", rowIdField: "noteId", fields: [holderField] },
      { entity: "productTag", EntityPascal: "ProductTag", key: "tags", filterKey: "productId", rowIdField: "tagId", fields: [holderField] },
    ];
    const source = render("crud-page.stories.hbs", {
      ...context,
      listFields: [field, toned, signed],
      detailFields: [field, toned, signed],
      statusBadgeField: "state",
      statusField: "other",
      holders,
      holderColumnsHooks: [{ hook: "useProductNoteColumns", from: "../product-note", field: "productId" }, null],
    });
    expect(source).toContain('tones: { "ON": "success", "OFF": "danger" } },');
    expect(source).toContain('{ name: "amount", kind: "credits", signed: true },');
    expect(source).toContain('const BADGE_FIELD = DETAIL_FIELDS.find((field) => field.name === "state");');
    expect(source).toContain("badgeOf(contract.value(BADGE_FIELD, row))");
    expect(source).toContain('key: "notes"');
    expect(source).not.toContain('key: "tags"');
    expect(source).not.toContain("ProductTagHolderFields");
    expect(source).not.toContain("../product-note");
    const plain = render("crud-page.stories.hbs", { ...context });
    expect(plain).not.toContain("BADGE_FIELD");
    expect(plain).not.toContain("signed: true");
  });
});
