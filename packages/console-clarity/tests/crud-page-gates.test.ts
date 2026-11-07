import { describe, expect, it } from "vitest";

import { render } from "./template-typecheck";

/** The context the CLI hands `crud-page.hbs`, with the write operations chosen per case. */
function page(writes: { readonly hasCreate: boolean; readonly hasUpdate: boolean; readonly hasDelete: boolean; readonly timeBuckets?: { readonly field: string; readonly fetch: string } }): string {
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

describe("crud-page.hbs header and time range", () => {
  it("lays down the gated create action as the header's verb", () => {
    const text = page({ hasCreate: true, hasUpdate: false, hasDelete: false });
    expect(text).toContain('actions: headerActions(canCreate ? <PageAction kind="add"');
    expect(text).toContain("blocks.headerActions?.(list)),");
  });

  it("offers the time range over the field the Meta names, counted by the list's counts read", () => {
    const text = page({ hasCreate: false, hasUpdate: false, hasDelete: false, timeBuckets: { field: "runAt", fetch: "getJobCounts" } });
    expect(text).toContain('field: "runAt",');
    expect(text).toContain("readCounts(getJobCounts(");
    expect(text).toContain("          timeRange: blocks.timeRange ? { ...blocks.timeRange, filters: list.filters } : timeRange,");
  });

  it("draws no time range and no header verb of its own where the entity has neither, and leaves both to the blocks", () => {
    const text = page({ hasCreate: false, hasUpdate: false, hasDelete: false });
    expect(text).not.toContain("readCounts");
    expect(text).not.toContain("PageAction");
    expect(text).toContain("          actions: blocks.headerActions?.(list),");
    expect(text).toContain("          timeRange: blocks.timeRange ? { ...blocks.timeRange, filters: list.filters } : undefined,");
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
