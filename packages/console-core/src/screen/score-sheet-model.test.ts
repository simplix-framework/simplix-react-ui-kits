import { describe, expect, it } from "vitest";

import { figureText, isScoreInRange, ratingOf, scoreVisibility, subtotalRows, type ScoreCriterion } from "./score-sheet-model";

const criteria: ScoreCriterion[] = [
  { key: "a1", categoryPath: ["A"], cells: ["item a1"], scoreRuleKey: "r10" },
  { key: "a2", categoryPath: ["A", "A-sub"], cells: ["item a2"], scoreRuleKey: "r10" },
  { key: "b1", categoryPath: ["B"], cells: ["item b1"], scoreRuleKey: "r5" },
];

describe("scoreVisibility", () => {
  const all = ["kim", "lee", "park"];

  it("shows an unconfirmed evaluator only their own column and hides resolved and totals", () => {
    expect(scoreVisibility("evaluator", all, "lee", false)).toEqual({ evaluators: ["lee"], editable: "lee", resolved: false, totals: false, resolveAction: false });
  });

  it("lifts the hiding once the round is confirmed, read-only", () => {
    expect(scoreVisibility("evaluator", all, "lee", true)).toEqual({ evaluators: all, editable: null, resolved: true, totals: true, resolveAction: false });
  });

  it("shows the contractor only its own entry column whatever the confirmation", () => {
    for (const confirmed of [false, true]) {
      expect(scoreVisibility("contractor", all, "co", confirmed)).toEqual({ evaluators: ["co"], editable: "co", resolved: false, totals: false, resolveAction: false });
    }
  });

  it("gives the resolver every column and a resolve action", () => {
    expect(scoreVisibility("resolver", all, undefined, false)).toEqual({ evaluators: all, editable: null, resolved: true, totals: true, resolveAction: true });
  });

  it("gives a reader everything but no editing", () => {
    expect(scoreVisibility("read", all, undefined, false)).toEqual({ evaluators: all, editable: null, resolved: true, totals: true, resolveAction: false });
  });
});

describe("isScoreInRange", () => {
  const rule = { min: 0, max: 10 };
  it("accepts the bounds and between", () => {
    expect([0, 5, 10].map((s) => isScoreInRange(s, rule))).toEqual([true, true, true]);
  });
  it("rejects outside the bounds, non-finite and a missing rule", () => {
    expect([-1, 10.5, Number.NaN].map((s) => isScoreInRange(s, rule))).toEqual([false, false, false]);
    expect(isScoreInRange(3, undefined)).toBe(false);
  });
  it("accepts clearing the score", () => {
    expect(isScoreInRange(null, rule)).toBe(true);
  });
});

describe("figureText", () => {
  it("draws a computed figure, including a real 0", () => {
    expect(figureText(0, [], criteria, [])).toEqual({ kind: "value", value: 0 });
  });
  it("draws a null total as held when a hold is listed", () => {
    expect(figureText(null, [{ conflictKey: "c1", label: "rule 3 reading" }], criteria, [])).toEqual({ kind: "held", labels: ["rule 3 reading"] });
  });
  it("draws a null total as the count of unresolved items otherwise, never 0", () => {
    const resolved = [{ criterionKey: "a1", score: 7, basis: "RAW" as const, by: "kim" }];
    expect(figureText(null, [], criteria, resolved)).toEqual({ kind: "unresolved", count: 2 });
  });
});

describe("subtotalRows", () => {
  it("places one subtotal after each category's last item with the server figure", () => {
    const rows = subtotalRows(criteria, { categories: { A: 15, B: null }, total: null, result: null }, [], []);
    expect(rows).toEqual([
      { afterKey: "a2", category: "A", figure: { kind: "value", value: 15 } },
      { afterKey: "b1", category: "B", figure: { kind: "unresolved", count: 1 } },
    ]);
  });
  it("keeps source order when a category reappears, placing its subtotal after its last run", () => {
    const split = [...criteria, { key: "a3", categoryPath: ["A"], cells: ["item a3"], scoreRuleKey: "r10" }];
    const rows = subtotalRows(split, { categories: { A: 20, B: 4 }, total: 24, result: "PASS" }, [], []);
    expect(rows.map((r) => r.afterKey)).toEqual(["b1", "a3"]);
  });
  it("treats a category the server did not list as not computed", () => {
    const rows = subtotalRows(criteria, { categories: {}, total: null, result: null }, [{ conflictKey: "c", label: "held" }], []);
    expect(rows.map((r) => r.figure.kind)).toEqual(["held", "held"]);
  });
});

describe("ratingOf", () => {
  const rule = { min: 0, max: 100, ratings: [{ label: "우수", score: 90 }, { label: "보통", score: 80 }] };
  it("returns the grade a label names", () => {
    expect(ratingOf(rule, "보통")).toEqual({ label: "보통", score: 80 });
  });
  it("returns nothing for a label outside the table or a rule without one", () => {
    expect(ratingOf(rule, "불량")).toBeUndefined();
    expect(ratingOf({ min: 0, max: 10 }, "우수")).toBeUndefined();
  });
});
