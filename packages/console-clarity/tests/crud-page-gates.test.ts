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
