import { describe, expect, it } from "vitest";

import { committedWindow, conditionsWithoutWindow, windowCommit, windowKeysOf } from "./list-time-range";

const NOW = new Date("2026-11-02T12:00:00.000Z");
const at = (iso: string) => new Date(iso);

describe("the window a list is committed to", () => {
  it("is nothing while no bound on the field is committed", () => {
    expect(committedWindow({}, "createdAt", NOW)).toBeNull();
    expect(committedWindow({ "status.in": ["FAILED"] }, "createdAt", NOW)).toBeNull();
  });

  it("is the strip's own pair", () => {
    const committed = { "createdAt.between": "2026-11-01T00:00:00.000Z,2026-11-02T00:00:00.000Z" };
    expect(committedWindow(committed, "createdAt", NOW)).toEqual({ from: at("2026-11-01T00:00:00.000Z"), to: at("2026-11-02T00:00:00.000Z") });
  });

  it("runs from a start another control committed to now, instead of leaving the strip on its default", () => {
    const committed = { "createdAt.greaterThanOrEqualTo": "2026-11-02T06:00:00.000Z" };
    expect(committedWindow(committed, "createdAt", NOW)).toEqual({ from: at("2026-11-02T06:00:00.000Z"), to: NOW });
  });

  it("reads the filter bar's pair", () => {
    const committed = { "createdAt.greaterThanOrEqualTo": "2026-11-02T06:00:00.000Z", "createdAt.lessThanOrEqualTo": "2026-11-02T09:00:00.000Z" };
    expect(committedWindow(committed, "createdAt", NOW)).toEqual({ from: at("2026-11-02T06:00:00.000Z"), to: at("2026-11-02T09:00:00.000Z") });
  });

  it("is the intersection when two controls hold a bound each, as the rows are", () => {
    const committed = {
      "createdAt.between": "2026-11-01T00:00:00.000Z,2026-11-02T00:00:00.000Z",
      "createdAt.greaterThanOrEqualTo": "2026-11-01T12:00:00.000Z",
    };
    expect(committedWindow(committed, "createdAt", NOW)).toEqual({ from: at("2026-11-01T12:00:00.000Z"), to: at("2026-11-02T00:00:00.000Z") });
  });

  it("is nothing for an end with no start, an empty window, or a value that is no instant", () => {
    expect(committedWindow({ "createdAt.lessThanOrEqualTo": "2026-11-02T09:00:00.000Z" }, "createdAt", NOW)).toBeNull();
    expect(committedWindow({ "createdAt.greaterThanOrEqualTo": "2026-11-03T00:00:00.000Z" }, "createdAt", NOW)).toBeNull();
    expect(committedWindow({ "createdAt.greaterThanOrEqualTo": "not a date" }, "createdAt", NOW)).toBeNull();
    expect(committedWindow({ "createdAt.greaterThanOrEqualTo": undefined }, "createdAt", NOW)).toBeNull();
  });

  it("leaves another field's bounds alone", () => {
    expect(committedWindow({ "occurredAt.greaterThanOrEqualTo": "2026-11-02T06:00:00.000Z" }, "createdAt", NOW)).toBeNull();
    expect(windowKeysOf("createdAt")).toContain("createdAt.lessThan");
    expect(windowKeysOf("createdAt").every((key) => key.startsWith("createdAt."))).toBe(true);
  });
});

describe("what the strip commits and counts under", () => {
  it("commits its pair and clears every other bound of the field in the same commit", () => {
    const written = windowCommit("createdAt", at("2026-11-01T00:00:00.000Z"), at("2026-11-01T06:00:00.000Z"));
    expect(written["createdAt.between"]).toBe("2026-11-01T00:00:00.000Z,2026-11-01T06:00:00.000Z");
    for (const key of windowKeysOf("createdAt").filter((one) => one !== "createdAt.between")) {
      expect(key in written && written[key] === undefined).toBe(true);
    }
  });

  it("counts under the other conditions, not under a window any control holds", () => {
    const committed = {
      "status.in": ["FAILED"],
      "createdAt.between": "a,b",
      "createdAt.greaterThanOrEqualTo": "2026-11-02T06:00:00.000Z",
      "createdAt.lessThanOrEqualTo": undefined,
      "provider.equals": "",
      "occurredAt.greaterThanOrEqualTo": "2026-11-02T06:00:00.000Z",
    };
    expect(conditionsWithoutWindow(committed, "createdAt")).toEqual({ "status.in": ["FAILED"], "occurredAt.greaterThanOrEqualTo": "2026-11-02T06:00:00.000Z" });
  });
});
