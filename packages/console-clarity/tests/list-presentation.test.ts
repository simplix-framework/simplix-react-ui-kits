import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * A screen's design decides how its list draws its rows (a table or cards), whether the reader may
 * switch, and which column titles a card. The scaffold hands those three decisions to the list and
 * to the board frame, and a list laid down without them is the plain table it always was.
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
  nameContractFields: [{ name: "name", contractKind: "text" }],
  fields: [field],
  listFields: [field],
  detailFields: [field],
  contractFilters: [{ kind: "choice", field: "name", options: ["a"] }],
  hookList: "useListProduct",
  listRowType: "ProductListRow",
  holders: [],
  hasKeywordSearch: true,
  fixtureRowsJson: "[]",
};

const widgetsDir = join(virtualRoot, "modules", "mymod", "src", "widgets", "product");

const domainStub = `
export interface ProductListRow { readonly productId: string; readonly name?: string }
export declare function useListProduct(params?: unknown, options?: unknown): { data: unknown; isLoading: boolean; error: unknown };
`;

function check(source: string): string[] {
  const file = join(widgetsDir, "list.tsx");
  return typecheck({ [file]: source, [join(virtualRoot, "domain-product.ts")]: domainStub }, [file]);
}

const decided = { listCards: true, viewToggle: true, cardTitle: "name" };

describe("the generated list's presentation", () => {
  it("draws cards with the switch and the card title the design decided", () => {
    const source = render("list.hbs", { ...context, ...decided });
    expect(source).toContain('presentation="cards"');
    expect(source).toMatch(/\n\s+viewToggle\n/);
    expect(source).toContain('viewKey="product"');
    expect(source).toContain('cardTitle="name"');
    expect(check(source)).toEqual([]);
  });

  it("draws the switch alone on a table, and cards alone without one", () => {
    const toggled = render("list.hbs", { ...context, viewToggle: true });
    expect(toggled).not.toContain("presentation=");
    expect(toggled).toMatch(/\n\s+viewToggle\n/);
    const plain = render("list.hbs", { ...context, listCards: true });
    expect(plain).toContain('presentation="cards"');
    expect(plain).not.toContain("viewToggle");
    expect(plain).not.toContain("viewKey");
    expect(check(toggled)).toEqual([]);
    expect(check(plain)).toEqual([]);
  });

  it("is checked against the list's real props, so a presentation it does not offer fails", () => {
    const source = render("list.hbs", { ...context, ...decided });
    expect(check(source.replace('presentation="cards"', 'presentation="grid"')).length).toBeGreaterThan(0);
  });

  it("is the plain table list when nothing is decided", () => {
    const source = render("list.hbs", context);
    expect(source).not.toContain("presentation=");
    expect(source).not.toContain("viewToggle");
    expect(source).not.toContain("cardTitle");
    expect(check(source)).toEqual([]);
  });
});

describe("the generated board frame's list", () => {
  it("draws the same decisions the generated list does", () => {
    const source = render("crud-page.stories.hbs", { ...context, ...decided });
    expect(source).toContain('presentation="cards"');
    expect(source).toMatch(/\n\s+viewToggle\n/);
    expect(source).toContain('viewKey="product"');
    expect(source).toContain('cardTitle="name"');
  });

  it("draws the plain table when nothing is decided", () => {
    const source = render("crud-page.stories.hbs", context);
    expect(source).not.toContain("presentation=");
    expect(source).not.toContain("viewToggle");
    expect(source).not.toContain("cardTitle");
  });
});

describe("the generated list's text filters", () => {
  const textFilters = [
    { kind: "text", field: "provider", operators: ["contains", "equals"] },
    { kind: "text", field: "planCode", operators: ["equals"] },
    { kind: "text", field: "label" },
  ];

  it("declares each text filter with the operators the endpoint accepts, and none when the contract names none", () => {
    const source = render("list.hbs", { ...context, contractFilters: textFilters });
    expect(source).toContain('{ kind: "text", field: "provider", operators: ["contains", "equals"] },');
    expect(source).toContain('{ kind: "text", field: "planCode", operators: ["equals"] },');
    expect(source).toContain('{ kind: "text", field: "label" },');
    expect(check(source)).toEqual([]);
  });

  it("draws the same filters in the board frame", () => {
    const source = render("crud-page.stories.hbs", { ...context, contractFilters: textFilters });
    expect(source).toContain('{ kind: "text", field: "planCode", operators: ["equals"] },');
    expect(source).toContain('{ kind: "text", field: "label" },');
  });

  it("is checked against the contract's filter type, so an operators value that is not a list fails", () => {
    const source = render("list.hbs", { ...context, contractFilters: textFilters });
    expect(check(source.replace('operators: ["equals"]', 'operators: "equals"')).length).toBeGreaterThan(0);
  });
});
