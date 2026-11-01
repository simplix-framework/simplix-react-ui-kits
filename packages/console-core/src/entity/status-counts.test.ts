import { describe, expect, it } from "vitest";

import { statusCounts } from "./status-counts";

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
