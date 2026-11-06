import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * Every shape of reference the generator hands the list template: one named by a field beside it,
 * one named through a nested record, one by kind with a partial kind map, and one nothing names,
 * drawn by its id. The rendered table type-checks against the kit's own `ContractField`.
 */

const listFields = [
  { name: "creditAccountId", contractKind: "reference", peekKind: "creditAccount", nameField: "ownerName", sortable: true },
  { name: "planId", contractKind: "reference", peekKind: "plan", nameField: "plan.name", sortable: true },
  {
    name: "subjectId",
    contractKind: "reference",
    peekKinds: { field: "jobType", kinds: [{ value: "PAYMENT_EVENT", peekKind: "paymentEvent" }, { value: "VOICE_DELETE", peekKind: "userVoice" }] },
  },
  { name: "creditHoldId", contractKind: "reference", peekKind: "creditHold", sortable: true },
];

const context = {
  entity: "product",
  EntityPascal: "Product",
  entityPath: "/api/v1/product",
  packageName: "@test/domain-product",
  rowIdField: "productId",
  displayNameField: "name",
  displayNameFields: ["name"],
  nameContractFields: [{ name: "name", contractKind: "text" }],
  fields: listFields,
  listFields,
  contractFilters: [],
  hookList: "useListProduct",
  listRowType: "ProductListRow",
  holders: [],
};

const domainStub = `
export interface ProductListRow { readonly productId: string }
export declare function useListProduct(params?: unknown, options?: unknown): { data: unknown; isLoading: boolean; error: unknown };
`;

describe("the field table of a list over references", () => {
  it("draws each reference with its peek, its kind map and its name, and type-checks", () => {
    const source = render("list.hbs", context);
    expect(source).toContain('{ name: "creditAccountId", kind: "reference", peekKind: "creditAccount", nameField: "ownerName", sortable: true }');
    expect(source).toContain('{ name: "planId", kind: "reference", peekKind: "plan", nameField: "plan.name", sortable: true }');
    expect(source).toContain('{ name: "subjectId", kind: "reference", peekKinds: { field: "jobType", kinds: { PAYMENT_EVENT: "paymentEvent", VOICE_DELETE: "userVoice" } } }');
    expect(source).toContain('{ name: "creditHoldId", kind: "reference", peekKind: "creditHold", sortable: true }');
    const file = join(virtualRoot, "modules", "mymod", "src", "widgets", "product", "list.tsx");
    expect(typecheck({ [file]: source, [join(virtualRoot, "domain-product.ts")]: domainStub }, [file])).toEqual([]);
  });
});
