import { describe, expect, it } from "vitest";

import { render } from "./template-typecheck";

/**
 * A generated list page draws the figures its entity's SimpliX Meta says it counts and sums as its
 * figure row, and draws none where Meta says nothing. A blocks file that states `spec.tiles` wins.
 */
const base = {
  entity: "job",
  EntityPascal: "Job",
  entityKebab: "job",
  rowIdField: "jobId",
  packageName: "@test/domain-job",
  hasCreate: false,
  hasUpdate: false,
  hasDelete: false,
};

const figureTiles = {
  status: { hook: "useGetJobStatusCounts", field: "status", enumName: "JobStatus", options: ["QUEUED", "FAILED"] },
  aggregates: { hook: "useGetJobAggregates", figures: [{ field: "jobId", op: "count", kind: "number", isRowCount: true }, { field: "costMicros", op: "sum", kind: "money", money: { currency: "USD", scale: 6 }, isRowCount: false }] },
};

describe("crud-page.hbs default figure tiles", () => {
  it("reads the counts and sums Meta names and draws them as the page's figures", () => {
    const text = render("crud-page.hbs", { ...base, figureTiles });
    expect(text).toContain('import { useGetJobStatusCounts, useGetJobAggregates } from "@test/domain-job";');
    expect(text).toContain('status: { query: useGetJobStatusCounts({ field: "status" }), field: "status", enumName: "JobStatus", values: ["QUEUED", "FAILED"] },');
    expect(text).toContain('{ field: { name: "costMicros", kind: "money", currency: "USD", scale: 6 }, op: "sum" },');
    expect(text).toContain('{ field: { name: "jobId", kind: "number" }, op: "count", rowCount: true },');
    expect(text).toContain("tiles: figures.tiles,\n          tilesLoading: figures.loading,");
  });

  it("draws no figures where Meta names none", () => {
    const text = render("crud-page.hbs", base);
    expect(text).not.toContain("useFigureTiles");
    expect(text).not.toContain("figures.tiles");
  });

  it("draws the same figures in the board frame, counted over the sample rows", () => {
    const text = render("crud-page.stories.hbs", { ...base, figureTiles, listFields: [], detailFields: [], contractFilters: [], holders: [], fixtureRowsJson: "[]" });
    expect(text).toContain("statusCounts(records.rows.map((row) => ({ value: row.status, count: 1 }))");
    expect(text).toContain('{ field: "jobId", op: "count", value: records.rows.length },');
    expect(text).toContain("tiles: figures");
  });
});
