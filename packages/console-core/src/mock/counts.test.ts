import { describe, expect, it } from "vitest";
import { mockCounts } from "./counts";

const rows = [{ at: "2026-01-01T00:00:00Z" }, { at: "2026-01-01T00:59:59Z" }, { at: "2026-01-01T03:30:00Z" }, { at: "2026-01-01T04:00:00Z" }, { at: "" }];

describe("mockCounts", () => {
  it("counts each row in the slice its instant falls in, the window's end excluded", async () => {
    const counts = await mockCounts(rows, "at")({ from: "2026-01-01T00:00:00Z", to: "2026-01-01T04:00:00Z", buckets: 4, conditions: {} });
    expect(counts).toEqual([2, 0, 0, 1]);
  });
  it("counts nothing outside the window", async () => {
    const counts = await mockCounts(rows, "at")({ from: "2026-01-02T00:00:00Z", to: "2026-01-02T04:00:00Z", buckets: 2, conditions: {} });
    expect(counts).toEqual([0, 0]);
  });
});
