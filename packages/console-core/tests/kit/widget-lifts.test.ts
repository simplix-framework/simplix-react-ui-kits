import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";
import { KIT_NAME } from "../../../../testing/template-harness/lib/kit";

/**
 * What the widget templates take from the generator instead of a screen writing it by hand: a holder
 * tab drawn with the holder list's own columns, a header badge from any enum field, the list's column
 * choice as one constant, and the tones and signs SimpliX Meta declares on each field.
 */

const status = { name: "status", contractKind: "enum", enumTypeName: "ProductStatus", options: ["ACTIVE", "RETIRED"], tones: { RETIRED: "danger" } };
const kind = { name: "kind", contractKind: "enum", enumTypeName: "ProductKind", options: ["PLAIN", "BUNDLE"] };
const amount = { name: "amount", contractKind: "credits", signed: true };
const name = { name: "name", contractKind: "text" };

const context = {
  entity: "product",
  EntityPascal: "Product",
  entityKebab: "product",
  entityPath: "/api/v1/product",
  packageName: "@test/domain-product",
  rowIdField: "productId",
  displayNameField: "name",
  displayNameFields: ["name"],
  nameContractFields: [{ name: "name", contractKind: "text" }],
  fields: [name, status, kind, amount],
  listFields: [name, status, kind, amount],
  detailFields: [name, status, kind, amount],
  contractFilters: [],
  hookList: "useListProduct",
  hookGet: "useGetProduct",
  listRowType: "ProductListRow",
  holders: [],
};

const holder = {
  entity: "member",
  EntityPascal: "Member",
  key: "memberByProductId",
  hookList: "useListMembers",
  accessList: "listMembersAccess",
  packageName: "@test/domain-member",
  filterKey: "productId.equals",
  rowIdField: "memberId",
  fields: [{ name: "name", contractKind: "text" }],
  hasKeywordSearch: false,
};

const widgetsDir = join(virtualRoot, "modules", "mymod", "src", "widgets", "product");
const memberWidgets = join(virtualRoot, "modules", "other", "src", "widgets", "index.ts");

const domainStub = `
export interface ProductDetail { readonly productId: string; readonly name?: string; readonly status?: string; readonly kind?: string }
export declare function useGetProduct(id: string, options?: unknown): { readonly data?: ProductDetail; readonly isLoading: boolean; readonly isError: boolean };
export interface ProductListRow { readonly productId: string; readonly name?: string }
export declare function useListProduct(params?: unknown, options?: unknown): { data: unknown; isLoading: boolean; error: unknown };
`;
const memberDomainStub = `
import type { useAllowed } from "${KIT_NAME}/entity";
export declare function useListMembers(params?: unknown, options?: unknown): { data: unknown; isLoading: boolean; error: unknown };
export declare const listMembersAccess: Parameters<typeof useAllowed>[0];
`;
const memberWidgetsStub = `
import type { ContractOverrides, RecordColumn } from "${KIT_NAME}/entity";
export interface MemberRow { readonly memberId: string; readonly productId?: string; readonly name?: string }
export declare function useMemberColumns(overrides?: ContractOverrides, options?: { readonly omit?: readonly string[] }): RecordColumn<MemberRow>[];
`;

function check(file: string, source: string): string[] {
  return typecheck(
    {
      [file]: source,
      [join(virtualRoot, "domain-product.ts")]: domainStub,
      [join(virtualRoot, "domain-member.ts")]: memberDomainStub,
      [memberWidgets]: memberWidgetsStub,
    },
    [file],
  );
}

describe("a detail's holder tab", () => {
  const source = render("detail.hbs", {
    ...context,
    holders: [holder],
    holderImports: [{ packageName: "@test/domain-member", names: "listMembersAccess, useListMembers" }],
    holderColumnsHooks: [{ hook: "useMemberColumns", from: "@test/member-widgets", field: "productId" }],
  });

  it("draws the holder's rows with its own list's columns, less the key that repeats this record, and copies no field table", () => {
    expect(source).toContain('import { useMemberColumns as useHolder0Columns, type MemberRow as Holder0Row } from "@test/member-widgets";');
    expect(source).toContain('const holder0Columns = useHolder0Columns(undefined, { omit: ["productId"] });');
    expect(source).toContain("columns: holder0Columns,");
    expect(source).toContain("useCrudList<Holder0Row>(adaptForcedList<Holder0Row>(useListMembers");
    expect(source).not.toMatch(/HolderFields_|as never/);
  });

  it("type-checks against the holder's widgets barrel", () => {
    expect(check(join(widgetsDir, "detail.tsx"), source)).toEqual([]);
  });
});

describe("a holder whose list exports no column hook", () => {
  it("gets no tab, no import and no read, and the detail still type-checks", () => {
    const source = render("detail.hbs", {
      ...context,
      holders: [holder],
      holderImports: [{ packageName: "@test/domain-member", names: "listMembersAccess, useListMembers" }],
      holderColumnsHooks: [null],
    });
    expect(source).not.toMatch(/useHolder0Columns|holder0List|HolderFields_/);
    expect(source).toContain('{ key: "overview", label: words.overview');
  });
});

/** Runs the rendered `generatedActions` statement the way the screen does, with the three values it reads. */
function drawnVerbs(source: string, scope: { record: object | undefined; onDelete?: boolean; onEdit?: boolean }): string[] {
  const statement = source.match(/const generatedActions =[\s\S]*?;\n/)?.[0];
  if (!statement) throw new Error("the rendered detail has no generatedActions statement");
  const js = ts.transpileModule(`${statement}\nreturn generatedActions;`, { compilerOptions: { target: ts.ScriptTarget.ES2022 }, reportDiagnostics: false }).outputText;
  const props = { onDelete: scope.onDelete ? () => undefined : undefined, onEdit: scope.onEdit ? () => undefined : undefined };
  const run = new Function("record", "props", "words", "recordName", js) as (...args: unknown[]) => { label: string }[];
  return run(scope.record, props, { delete: "Delete", edit: "Edit" }, "Name").map((verb) => verb.label);
}

describe("a detail's footer verbs", () => {
  const source = render("detail.hbs", context);

  it("are drawn once the record has answered", () => {
    expect(drawnVerbs(source, { record: { productId: "p1" }, onDelete: true, onEdit: true })).toEqual(["Delete", "Edit"]);
  });

  it("are not drawn while the read is held or has failed, so Delete never names a record nobody can see", () => {
    expect(drawnVerbs(source, { record: undefined, onDelete: true, onEdit: true })).toEqual([]);
  });

  it("still withholds a verb the screen passes no handler for", () => {
    expect(drawnVerbs(source, { record: { productId: "p1" }, onEdit: true })).toEqual(["Edit"]);
  });
});

describe("a detail's header badge", () => {
  it("is drawn from any enum field the screen's entry names, through the kit's badgeOf", () => {
    const source = render("detail.hbs", { ...context, statusBadgeField: "kind", statusField: "status" });
    expect(source).toContain('const BADGE_FIELD = ProductDetailFields.find((field) => field.name === "kind");');
    expect(source).toContain("badgeOf(contract.value(BADGE_FIELD, row))");
    expect(source).not.toContain("function statusBadge");
    expect(check(join(widgetsDir, "detail.tsx"), source)).toEqual([]);
  });

  it("is drawn from a boolean field the entry names, carrying the tones Meta declares for its two values", () => {
    const offered = { name: "offered", contractKind: "boolean", tones: { true: "success", false: "neutral" } };
    const source = render("detail.hbs", { ...context, detailFields: [...context.detailFields, offered], statusBadgeField: "offered", statusField: "status" });
    expect(source).toContain('{ name: "offered", kind: "boolean", tones: { "true": "success", "false": "neutral" } }');
    expect(source).toContain('const BADGE_FIELD = ProductDetailFields.find((field) => field.name === "offered");');
    expect(source).toContain("badgeOf(contract.value(BADGE_FIELD, row))");
    expect(check(join(widgetsDir, "detail.tsx"), source)).toEqual([]);
  });

  it("falls back to the entity's status field", () => {
    expect(render("detail.hbs", { ...context, statusField: "status" })).toContain('field.name === "status"');
  });
});

describe("the generated list's columns", () => {
  const source = render("list.hbs", context);

  it("names its columns once, in the order the fields arrive, and draws them through pickFields", () => {
    expect(source).toContain('const COLUMNS: readonly string[] = [\n  "name",\n  "status",\n  "kind",\n  "amount",\n];');
    expect(source).toContain("pickFields(ProductColumnFields, COLUMNS.filter((name) => !omit.includes(name)))");
    expect(source).not.toMatch(/findIndex|generatedBy|\.sort\(/);
  });

  it("takes the generator's column list where it states one", () => {
    expect(render("list.hbs", { ...context, columns: ["status", "name"] })).toContain('const COLUMNS: readonly string[] = [\n  "status",\n  "name",\n];');
  });

  it("carries the tones and the sign SimpliX Meta declares, so no screen writes a tone map", () => {
    expect(source).toContain('options: ["ACTIVE", "RETIRED"], tones: { "RETIRED": "danger" }');
    expect(source).toContain('{ name: "amount", kind: "credits", signed: true }');
    expect(check(join(widgetsDir, "list.tsx"), source)).toEqual([]);
  });
});

describe("the page's sum figures", () => {
  it("carry the sign SimpliX Meta declares on a ledger amount", () => {
    const page = render("crud-page.hbs", { ...context, hasForm: false, figureTiles: { aggregates: { hook: "useGetProductAggregates", figures: [{ field: "amount", op: "sum", kind: "credits", signed: true }] } } });
    expect(page).toContain('{ field: { name: "amount", kind: "credits", signed: true }, op: "sum" }');
  });
});
