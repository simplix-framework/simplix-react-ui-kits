import { describe, expect, it } from "vitest";

import { figureTiles, type FigureWords } from "./figure-tiles";

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
