import { describe, expect, it } from "vitest";

import { render } from "./template-typecheck";

/** The context the CLI hands `crud-page.hbs`, with the write operations chosen per case. */
function page(writes: { readonly hasCreate: boolean; readonly hasUpdate: boolean; readonly hasDelete: boolean }): string {
  return render("crud-page.hbs", {
    entity: "ledgerEntry",
    EntityPascal: "LedgerEntry",
    entityKebab: "ledger-entry",
    rowIdField: "ledgerEntryId",
    displayNameField: "reason",
    displayNameFields: ["reason"],
    nameContractFields: [{ name: "reason", contractKind: "text" }],
    hookDelete: "useDeleteLedgerEntry",
    accessCreate: "createLedgerEntryAccess",
    accessUpdate: "updateLedgerEntryAccess",
    accessDelete: "deleteLedgerEntryAccess",
    hasForm: writes.hasCreate || writes.hasUpdate,
    ...writes,
  });
}

describe("crud-page.hbs permission gates", () => {
  it("draws no gate and no useAllowed import for an entity nothing writes", () => {
    const text = page({ hasCreate: false, hasUpdate: false, hasDelete: false });
    expect(text).not.toMatch(/\bcan(Create|Edit|Delete)\b/);
    expect(text).not.toContain("useAllowed");
  });

  it("gates each operation the entity has, and only those", () => {
    const text = page({ hasCreate: false, hasUpdate: true, hasDelete: false });
    expect(text).toContain("const canEdit = useAllowed(updateLedgerEntryAccess);");
    expect(text).not.toMatch(/\bcan(Create|Delete)\b/);
  });
});

describe("crud-page.hbs header actions", () => {
  it("hands the list to the blocks' header actions and draws them after the create action", () => {
    const text = page({ hasCreate: true, hasUpdate: false, hasDelete: false });
    expect(text).toContain("const listActions = blocks.headerActions?.(list);");
    expect(text).toContain("actions: listActions ? <>{ownActions}{listActions}</> : ownActions");
    expect(text).toMatch(/const ownActions = blocks\.spec && "actions" in blocks\.spec \? blocks\.spec\.actions : canCreate \?/);
  });

  it("hands the list to the blocks' window picker and draws it as the page's time range", () => {
    const text = page({ hasCreate: true, hasUpdate: false, hasDelete: false });
    expect(text).toContain("const timeRange = blocks.timeRange?.(list);");
    expect(text).toContain("...(timeRange ? { timeRange } : {})");
  });

  it("starts from no action where the entity has no create", () => {
    const text = page({ hasCreate: false, hasUpdate: false, hasDelete: false });
    expect(text).toContain('const ownActions = blocks.spec && "actions" in blocks.spec ? blocks.spec.actions : undefined;');
  });
});

describe("crud-page.hbs record name", () => {
  it("names the record by every declared field, joined in order", () => {
    const text = render("crud-page.hbs", {
      entity: "ledgerEntry",
      EntityPascal: "LedgerEntry",
      entityKebab: "ledger-entry",
      rowIdField: "ledgerEntryId",
      displayNameField: "reason",
      displayNameFields: ["reason", "period"],
      nameContractFields: [{ name: "reason", contractKind: "text" }, { name: "period", contractKind: "instant" }],
      hookDelete: "useDeleteLedgerEntry",
      accessDelete: "deleteLedgerEntryAccess",
      hasDelete: true,
    });
    expect(text).toContain('{ name: "reason", kind: "text" },\n  { name: "period", kind: "instant" },');
    expect(text).toContain("const nameOf = (row: object) => contract.recordName(NAME_FIELDS, row as Readonly<Record<string, unknown>>);");
  });
});
