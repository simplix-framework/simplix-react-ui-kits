import { describe, expect, it } from "vitest";

import { readRuleValue } from "./rule-value";

const rule = (value: unknown, comparator: string, status: "SOURCE" | "REVIEW_REQUIRED" | "APPROVED" = "SOURCE", unit = "m") => ({ value, comparator, status, unit });

describe("readRuleValue", () => {
  it("draws the comparison, value and unit", () => {
    expect(readRuleValue(rule(2, "GTE"), "en")).toEqual({ kind: "value", text: "≥ 2 m" });
    expect(readRuleValue(rule(1500, "<="), "en")).toEqual({ kind: "value", text: "≤ 1,500 m" });
    expect(readRuleValue({ value: 3, comparator: "EQ", status: "APPROVED" }, "en")).toEqual({ kind: "value", text: "= 3" });
  });

  it("holds the value while it awaits interpretation", () => {
    expect(readRuleValue(rule(2, "GTE", "REVIEW_REQUIRED"))).toEqual({ kind: "held" });
  });

  it("reads a missing value as missing, never as 0", () => {
    expect(readRuleValue(rule(null, "GTE"))).toEqual({ kind: "missing" });
    expect(readRuleValue(rule("", "GTE"))).toEqual({ kind: "missing" });
    expect(readRuleValue(rule(0, "GTE"), "en")).toEqual({ kind: "value", text: "≥ 0 m" });
  });

  it("reads ranges, including open ends", () => {
    expect(readRuleValue(rule({ min: 2, max: 5 }, "BETWEEN"), "en")).toEqual({ kind: "value", text: "2 ~ 5 m" });
    expect(readRuleValue(rule([2, 5], "RANGE"), "en")).toEqual({ kind: "value", text: "2 ~ 5 m" });
    expect(readRuleValue(rule({ min: 2 }, "BETWEEN"), "en")).toEqual({ kind: "value", text: "≥ 2 m" });
    expect(readRuleValue(rule({ max: 5 }, "BETWEEN"), "en")).toEqual({ kind: "value", text: "≤ 5 m" });
    expect(readRuleValue(rule({}, "BETWEEN"))).toEqual({ kind: "missing" });
    expect(readRuleValue(rule(null, "BETWEEN"))).toEqual({ kind: "missing" });
  });
});
