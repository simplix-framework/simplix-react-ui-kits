import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * A generated list keeps its filters in its page's address: the hook takes the address as a second
 * argument and builds `addressedFilters` from the list's own declaration, the page writes the
 * reader's changes back with `replace`, and the route passes `replace` to the router. A page that
 * forces a field (a tab) gets the filter over that field neither applied nor drawn.
 */

const status = { name: "status", contractKind: "enum", enumTypeName: "JobStatus", options: ["FAILED", "PAUSED"] };
const owner = { name: "ownerUserId", contractKind: "reference", peekKind: "userAccount", nameField: "ownerUserName" };
const name = { name: "name", contractKind: "text" };

const context = {
  entity: "job",
  EntityPascal: "Job",
  entityKebab: "job",
  entityPath: "/api/v1/job",
  packageName: "@test/domain-product",
  rowIdField: "jobId",
  displayNameField: "name",
  displayNameFields: ["name"],
  nameContractFields: [name],
  fields: [name, status, owner],
  listFields: [name, status, owner],
  contractFilters: [
    { kind: "choice", field: "status", enumTypeName: "JobStatus", options: ["FAILED", "PAUSED"] },
    { kind: "toggle", field: "retried" },
    { kind: "dateRange", field: "startedAt", dateOnly: false },
  ],
  hookList: "useListJob",
  listRowType: "JobListRow",
  holders: [],
};

const widgetsDir = join(virtualRoot, "modules", "mymod", "src", "widgets", "job");

const domainStub = `
import type { CrudListFilters, EntityFacet } from "@simplix-react/ui";
export interface JobListRow { readonly jobId: string; readonly name?: string; readonly status?: string; readonly ownerUserId?: string; readonly ownerUserName?: string }
export declare function useListJob(params?: unknown, options?: unknown): { data: unknown; isLoading: boolean; error: unknown };
export declare function useGetJobAggregates(params?: unknown, options?: unknown): { data?: unknown; isLoading: boolean };
export declare function createUserFacet(idField: string): (state: CrudListFilters) => EntityFacet;
`;

const renderList = (extra: Record<string, unknown> = {}) => render("list.hbs", { ...context, ...extra });

/**
 * The compiler's messages for a rendered list, plus a probe that reads what the hook's result
 * carries and what the list's declaration offers to a screen that links to it.
 */
function checkList(source: string): string[] {
  const file = join(widgetsDir, "list.tsx");
  const probe = join(widgetsDir, "probe.ts");
  const probeSource = `
import type { CrudSearchFilters } from "@simplix-react/ui";
import { JobListAddress, useJobList } from "./list";

declare const list: ReturnType<typeof useJobList>;
/** A forced request rides on the controller, for the filter bar to leave a pinned field out. */
export const forced: Readonly<Record<string, unknown>> = list.forced;
/** A link's filters are narrowed by the very declaration the hook reads. */
export const narrowed: CrudSearchFilters | undefined = JobListAddress.narrow({ "status.in": "FAILED" });
export const controls: readonly { readonly field: string; readonly type: string }[] = JobListAddress.controls;
`;
  return typecheck({ [file]: source, [probe]: probeSource, [join(virtualRoot, "domain-product.ts")]: domainStub }, [file, probe]);
}

describe("the generated list's address", () => {
  it("takes the page's address as its second argument and hands the list the declaration's addressed filters", () => {
    const source = renderList();
    expect(source).toContain("export function useJobList(params?: Readonly<Record<string, unknown>>, address?: ListAddress) {");
    expect(source).toContain("addressedFilters: JobListAddress.useAddressed(address, params),");
    expect(source).toContain('filterMode: "immediate",');
  });

  // The declaration closes the file: a screen edits the imports, the filters and the columns above it,
  // and nothing below the list component, so a regeneration adds it without a conflict.
  it("declares the address once, from the filters the list states, after the list it reads", () => {
    const source = renderList();
    expect(source).toContain("export const JobListAddress = declareListAddress(JobDrawnFilters, { facetFields: [] });");
    expect(source.indexOf("const JobFilters")).toBeLessThan(source.indexOf("export const JobListAddress"));
    expect(source.indexOf("export function JobList(")).toBeLessThan(source.indexOf("export const JobListAddress"));
    expect(source.trimEnd().endsWith("declareListAddress(JobDrawnFilters, { facetFields: [] });")).toBe(true);
    expect(source.split("declareListAddress(").length - 1).toBe(1);
  });

  it("names the fields it supplies a facet for, so a reference filter without one carries no key", () => {
    const source = renderList({
      contractFilters: [{ kind: "reference", field: "ownerUserId" }],
      listFacets: [{ field: "ownerUserId", hook: "useOwnerUserIdFacet", factory: "createUserFacet", from: "@test/domain-product" }],
      listFacetImports: [{ from: "@test/domain-product", hooks: "createUserFacet" }],
    });
    expect(source).toContain('declareListAddress(JobDrawnFilters, { facetFields: ["ownerUserId"] });');
  });

  it("type-checks, and its result carries the request the page forces and its declaration to a screen that links to it", () => {
    expect(checkList(renderList())).toEqual([]);
  });

  it("type-checks with a facet field, with the keyword search, and with the sums a page reads", () => {
    const facets = {
      contractFilters: [{ kind: "reference", field: "ownerUserId" }, { kind: "number", field: "attempts" }],
      listFacets: [{ field: "ownerUserId", hook: "useOwnerUserIdFacet", factory: "createUserFacet", from: "@test/domain-product" }],
      listFacetImports: [{ from: "@test/domain-product", hooks: "createUserFacet" }],
    };
    expect(checkList(renderList({ ...facets, hasKeywordSearch: true }))).toEqual([]);
    const aggregates = { aggregates: { hook: "useGetJobAggregates", figures: [{ field: "attempts", op: "sum", kind: "number", isRowCount: false }] } };
    const summed = renderList({ ...facets, hasKeywordSearch: true, figureTiles: aggregates });
    expect(summed).toContain("return withForced(requested, { ...params });");
    expect(checkList(summed)).toEqual([]);
  });

  it("attaches the forced request to the controller in every shape, so the filter bar can leave a pinned field out", () => {
    expect(renderList()).toContain("return withForced(list, { ...params });");
    expect(renderList({ figureTiles: { aggregates: { hook: "useGetJobAggregates", figures: [] } } })).toContain("return withForced(requested, { ...params });");
  });
});

describe("the generated list's drawn filters and address", () => {
  /** The set an expression names: the identifier handed to `contract.filters` and to `declareListAddress`. */
  const drawnSet = (source: string) => /contract\.filters<\w+>\((\w+)\)/.exec(source)?.[1];
  const declaredSet = (source: string) => /declareListAddress\((\w+),/.exec(source)?.[1];

  it("builds the controls and declares the address from one set, so a key no control draws is not an address key", () => {
    for (const source of [renderList(), renderList({ timeBuckets: { field: "startedAt", fetch: "useGetJobTimeBuckets" } })]) {
      expect(drawnSet(source)).toBe("JobDrawnFilters");
      expect(declaredSet(source)).toBe(drawnSet(source));
      expect(source).toContain("const JobDrawnFilters: readonly ContractFilter[] = JobFilters;");
    }
  });

  it("names the field the page draws a time range over, so a window in a link is kept", () => {
    const source = renderList({ timeBuckets: { field: "startedAt", fetch: "useGetJobTimeBuckets" } });
    expect(source).toContain('declareListAddress(JobDrawnFilters, { facetFields: [], timeRangeField: "startedAt" });');
    expect(renderList()).not.toContain("timeRangeField");
    expect(checkList(source)).toEqual([]);
  });

  it("returns the list to its first page when the page forces another request, as a tab does", () => {
    const source = renderList();
    expect(source).toContain("scopeKey: params ? forcedScope({ ...params }) : undefined,");
    expect(source).toMatch(/import \{ adaptForcedList, adaptOrvalList, forcedScope, useCrudList \} from "@simplix-react\/ui";/);
    expect(checkList(source)).toEqual([]);
  });
});

describe("the generated list's empty words", () => {
  it("takes the page's words for an empty list and for lit chips that match nothing, and hands both to the kit's list", () => {
    const source = renderList();
    expect(source).toContain('readonly empty?: RecordListProps<JobRow>["empty"];');
    expect(source).toContain('readonly filteredEmpty?: RecordListProps<JobRow>["filteredEmpty"];');
    expect(source).toContain("empty={empty ?? {");
    expect(source).toContain("filteredEmpty={filteredEmpty}");
    expect(checkList(source)).toEqual([]);
  });
});

describe("the generated widget index", () => {
  it("exports the list's declaration beside its hook, for a screen that links to the list", () => {
    const text = render("feature-index.hbs", { EntityPascal: "Job", hasList: true });
    expect(text).toContain('export { JobList, JobListAddress, useJobColumns, useJobList } from "./list";');
  });
});

describe("the generated CRUD page's address", () => {
  const page = () =>
    render("crud-page.hbs", {
      ...context,
      hookDelete: "useDeleteJob",
      accessDelete: "deleteJobAccess",
      hasDelete: true,
    });

  it("hands the list its filters from the address and writes the reader's changes back with replace", () => {
    const text = page();
    expect(text).toContain("const list = useJobList(blocks.listParams, {");
    expect(text).toContain("value: search.filters,");
    expect(text).toContain("onChange: (next) => onNavigate({ ...search, filters: next }, { replace: true }),");
  });

  it("takes the router's navigation options in its props, so a replace reaches the router", () => {
    const text = page();
    expect(text).toContain("readonly onNavigate: (search: ConsoleSearch, options?: CrudNavigateOptions) => void;");
    expect(text).toContain("type CrudNavigateOptions,");
  });
});

describe("the generated route's navigation", () => {
  it("passes the page's replace option to the router, so narrowing a list does not fill the history", () => {
    const text = render("route.tanstack.hbs", { entity: "job", EntityPascal: "Job", packageName: "@test/domain-product", modulePackage: "@test/admin-job", routePath: "jobs" });
    expect(text).toContain('onNavigate={(next, options) => navigate({ to: "/jobs", search: next, replace: options?.replace })}');
    expect(text).not.toContain("onNavigate={(next) => navigate(");
  });
});
