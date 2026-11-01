import { describe, expect, it } from "vitest";

import { figureTiles, listRequestParams, withListRequest, type FigureWords } from "./figure-tiles";

const words: FigureWords = {
  enumLabel: (_enum, value) => value.toLowerCase(),
  fieldLabel: (field) => `label:${field}`,
  value: (field, row) => (field.kind === "money" ? `$${String(Number(row[field.name]) / 1_000_000)}` : String(row[field.name])),
};

describe("figureTiles", () => {
  it("draws a tile per counted value, each narrowing the list, then the sums and row counts", () => {
    const tiles = figureTiles(
      {
        status: { query: {}, field: "status", enumName: "JobStatus", values: ["FAILED"] },
        aggregates: {
          query: { data: [{ field: "jobId", op: "count", value: 12 }, { field: "costMicros", op: "sum", value: 2_500_000 }] },
          figures: [
            { field: { name: "jobId", kind: "number" }, op: "count", rowCount: true },
            { field: { name: "costMicros", kind: "money", currency: "USD", scale: 6 }, op: "sum" },
          ],
        },
        rowsLabel: "Jobs",
      },
      words,
      { FAILED: 3 },
    );
    expect(tiles).toEqual([
      { key: "FAILED", label: "failed", value: 3, counted: true, filter: { field: "status", value: "FAILED", fieldLabel: "label:status" } },
      { key: "jobId:count", label: "Jobs", value: 12, counted: false },
      { key: "costMicros:sum", label: "label:costMicros", value: "$2.5", counted: false },
    ]);
  });
  it("leaves each figure unread before its read answers", () => {
    const tiles = figureTiles({ aggregates: { query: {}, figures: [{ field: { name: "amount", kind: "number" }, op: "sum" }] }, rowsLabel: "Rows" }, words, undefined);
    expect(tiles[0]?.value).toBeUndefined();
  });
});

describe("figureTiles while the sums are read again", () => {
  const spec = (isLoading: boolean) => ({
    status: { query: {}, field: "status", enumName: "JobStatus", values: ["FAILED"] },
    aggregates: { query: { data: [{ field: "amount", op: "sum", value: 7 }], isLoading }, figures: [{ field: { name: "amount", kind: "number" as const }, op: "sum" as const }] },
    rowsLabel: "Rows",
  });
  it("marks each sum tile as loading and leaves the status count alone", () => {
    const tiles = figureTiles(spec(true), words, { FAILED: 3 });
    expect(tiles.find((tile) => tile.key === "amount:sum")).toMatchObject({ loading: true });
    expect(tiles.find((tile) => tile.key === "FAILED")).not.toHaveProperty("loading");
  });
  it("carries no loading mark once the read has answered", () => {
    expect(figureTiles(spec(false), words, { FAILED: 3 }).some((tile) => "loading" in tile)).toBe(false);
  });
});

describe("listRequestParams", () => {
  const filters = (committedValues: Record<string, unknown>, search = "") => ({ committedValues, search });
  it("sends the committed filters flat, without paging or sorting", () => {
    expect(listRequestParams(filters({ "provider.equals": "openai", "outcome.in": ["FAILED", "REJECTED"] }))).toEqual({
      "provider.equals": "openai",
      "outcome.in": ["FAILED", "REJECTED"],
    });
  });
  it("sends the search text under the keyword key and drops it where the route has none", () => {
    expect(listRequestParams(filters({}, " tts "), { searchKey: "keyword" })).toEqual({ keyword: "tts" });
    expect(listRequestParams(filters({}, "tts"))).toEqual({});
  });
  it("leaves out empty values the way the list's own request does", () => {
    expect(listRequestParams(filters({ "a.equals": "", "b.in": [], "c.equals": undefined, "d.equals": null, "e.equals": 0 }))).toEqual({ "e.equals": 0 });
  });
  it("sends the window a time range committed as the field's between filter", () => {
    expect(listRequestParams(filters({ "occurredAt.between": ["2026-10-01T00:00:00Z", "2026-10-02T00:00:00Z"] }))).toEqual({
      "occurredAt.between": ["2026-10-01T00:00:00Z", "2026-10-02T00:00:00Z"],
    });
  });
  it("applies the transform the list applies, so a typed money amount goes out as the stored number", () => {
    const transformFilters = (all: Record<string, unknown>) => ({ ...all, "costMicros.greaterThan": Number(all["costMicros.greaterThan"]) * 1_000_000 });
    expect(listRequestParams(filters({ "costMicros.greaterThan": "2" }), { transformFilters })).toEqual({ "costMicros.greaterThan": 2_000_000 });
  });
  it("lets the forced parameters win over the reader's filters and skips one not known yet", () => {
    expect(
      listRequestParams(filters({ "type.in": ["A", "B"], "kind.equals": "x" }), { forced: { "type.in": ["MANUAL"], "scope.equals": undefined } }),
    ).toEqual({ "type.in": ["MANUAL"], "kind.equals": "x" });
  });
});

describe("withListRequest", () => {
  it("attaches the request conditions to the controller and keeps the controller's own state", () => {
    const list = { data: [1], filters: { committedValues: { "status.equals": "FAILED" }, search: "" } };
    const handed = withListRequest(list, { forced: { "tab.equals": "open" } });
    expect(handed.requestParams).toEqual({ "status.equals": "FAILED", "tab.equals": "open" });
    expect(handed.data).toBe(list.data);
    expect(handed.filters).toBe(list.filters);
  });
});
