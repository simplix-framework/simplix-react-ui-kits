import { describe, expect, it } from "vitest";

import { aggregateValue, statusCounts, statusTiles } from "./status-counts";

describe("statusCounts", () => {
  it("reads the generic value and count shape", () => {
    expect(statusCounts([{ value: "FAILED", count: 3 }, { value: "QUEUED", count: 1 }])).toEqual({ FAILED: 3, QUEUED: 1 });
  });
  it("reads a row that names the enum's own field", () => {
    expect(statusCounts([{ status: "RUNNING", count: 2 }], { field: "status" })).toEqual({ RUNNING: 2 });
  });
  it("resolves a server enum object to its constant", () => {
    expect(statusCounts([{ status: { type: "BackgroundJobStatus", value: "FAILED", label: "Failed" }, count: 4 }], { field: "status" })).toEqual({ FAILED: 4 });
  });
  it("fills every declared value no row counts with 0", () => {
    expect(statusCounts([{ value: "FAILED", count: 3 }], { options: ["QUEUED", "FAILED", "SUCCEEDED"] })).toEqual({ QUEUED: 0, FAILED: 3, SUCCEEDED: 0 });
  });
  it("answers the zero-filled set before the read answers", () => {
    expect(statusCounts(undefined, { options: ["QUEUED"] })).toEqual({ QUEUED: 0 });
  });
  it("leaves out a row without a value and reads a missing count as 0", () => {
    expect(statusCounts([{ count: 9 }, { value: "QUEUED" }, null])).toEqual({ QUEUED: 0 });
  });
});

describe("statusTiles", () => {
  it("draws one counted tile per value, each narrowing the list to it", () => {
    const tiles = statusTiles({ field: "status", values: ["FAILED", "QUEUED"], counts: { FAILED: 2 }, label: (value) => value.toLowerCase(), tones: { FAILED: "danger", QUEUED: "warning" } });
    expect(tiles).toEqual([
      { key: "FAILED", label: "failed", value: 2, counted: true, tone: "danger", filter: { field: "status", value: "FAILED" } },
      { key: "QUEUED", label: "queued", value: 0, counted: true, filter: { field: "status", value: "QUEUED" } },
    ]);
  });
  it("leaves each figure unread before the counts answer", () => {
    expect(statusTiles({ field: "status", values: ["FAILED"], counts: undefined, label: String })[0]?.value).toBeUndefined();
  });
});

describe("aggregateValue", () => {
  const rows = [{ field: "amount", op: "sum", value: 1200 }, { field: "exceptionType", op: "countDistinct", value: 3 }, { field: "amount", op: "max", value: null }];
  it("reads the figure of one field and operation", () => {
    expect(aggregateValue(rows, "amount", "sum")).toBe(1200);
    expect(aggregateValue(rows, "exceptionType", "countDistinct")).toBe(3);
  });
  it("reads a max of no rows as unknown and a missing figure as unknown", () => {
    expect(aggregateValue(rows, "amount", "max")).toBeUndefined();
    expect(aggregateValue(rows, "amount", "min")).toBeUndefined();
  });
  it("reads a sum of no rows as 0", () => {
    expect(aggregateValue([{ field: "amount", op: "sum", value: null }], "amount", "sum")).toBe(0);
  });
  it("answers nothing before the read answers", () => {
    expect(aggregateValue(undefined, "amount", "sum")).toBeUndefined();
  });
});
