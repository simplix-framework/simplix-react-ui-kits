import { describe, expect, it } from "vitest";

import {
  checkCellState,
  checkSummary,
  isCheckColumnEditable,
  measurementCellState,
  measurementSummary,
  nextDueState,
  parseReading,
  sampleKey,
} from "./grid-cells";

describe("measurementCellState", () => {
  it("draws a blank reading as empty, never as zero", () => {
    expect(measurementCellState(null, "SAFE")).toEqual({ kind: "empty" });
    expect(measurementCellState(undefined, undefined)).toEqual({ kind: "empty" });
  });
  it("keeps a zero reading as a reading", () => {
    expect(measurementCellState(0, "SAFE")).toEqual({ kind: "verdict", value: 0, verdict: "SAFE" });
  });
  it("draws a held verdict as held", () => {
    expect(measurementCellState(19.5, "REVIEW_REQUIRED")).toEqual({ kind: "held", value: 19.5 });
  });
  it("draws a reading with no verdict as held, not safe", () => {
    expect(measurementCellState(20.9, undefined)).toEqual({ kind: "held", value: 20.9 });
  });
  it("carries an unsafe verdict", () => {
    expect(measurementCellState(30, "UNSAFE")).toEqual({ kind: "verdict", value: 30, verdict: "UNSAFE" });
  });
});

describe("measurementSummary", () => {
  it("counts each state and leaves blanks out of every verdict", () => {
    const a = sampleKey("a", "p1");
    const b = sampleKey("a", "p2");
    const c = sampleKey("b", "p1");
    const summary = measurementSummary(
      ["a", "b"],
      ["p1", "p2"],
      { [a]: 1, [b]: 2, [c]: 3 },
      { [a]: "SAFE", [b]: "UNSAFE" },
    );
    expect(summary).toEqual({ safe: 1, unsafe: 1, held: 1, empty: 1 });
  });
});

describe("nextDueState", () => {
  it("shows the hold instead of a time when the interval is held", () => {
    expect(nextDueState("2026-10-24T10:00:00Z", true)).toEqual({ kind: "held" });
  });
  it("shows the time otherwise", () => {
    expect(nextDueState("2026-10-24T10:00:00Z", false)).toEqual({ kind: "due", at: "2026-10-24T10:00:00Z" });
    expect(nextDueState(undefined, false)).toEqual({ kind: "none" });
  });
});

describe("parseReading", () => {
  it("reads blank as null and junk as undefined", () => {
    expect(parseReading("  ")).toBeNull();
    expect(parseReading("abc")).toBeUndefined();
    expect(parseReading("0")).toBe(0);
    expect(parseReading("20.9")).toBe(20.9);
  });
});

describe("checkCellState", () => {
  it("draws null as not checked, distinct from every verdict", () => {
    expect(checkCellState(null)).toEqual({ kind: "empty" });
    expect(checkCellState("NOT_APPLICABLE")).toEqual({ kind: "verdict", verdict: "NOT_APPLICABLE" });
  });
});

describe("isCheckColumnEditable", () => {
  it("opens only listed rounds", () => {
    expect(isCheckColumnEditable("w2", ["w2"])).toBe(true);
    expect(isCheckColumnEditable("w1", ["w2"])).toBe(false);
    expect(isCheckColumnEditable("w1", [])).toBe(false);
  });
});

describe("checkSummary", () => {
  it("counts deficient and unchecked cells apart from not-applicable", () => {
    const summary = checkSummary(["r1", "r2"], ["w1", "w2"], {
      "r1:w1": "GOOD",
      "r1:w2": "BAD",
      "r2:w1": "NOT_APPLICABLE",
      "r2:w2": null,
    });
    expect(summary).toEqual({ good: 1, bad: 1, notApplicable: 1, unchecked: 1 });
  });
});
