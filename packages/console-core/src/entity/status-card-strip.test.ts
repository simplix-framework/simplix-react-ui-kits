import { describe, expect, it } from "vitest";

import { countedChips } from "./record-list";
import { cardFilterKey, isCardPressed, pressedValue, shownCardTone } from "./status-card-strip";

const failed = { field: "status", value: "FAILED" };

describe("status cards and the chip row share one filter", () => {
  it("writes the chip row's key", () => {
    expect(cardFilterKey(failed)).toBe("status.in");
  });
  it("is pressed when the chips stand on its value alone", () => {
    expect(isCardPressed(failed, { "status.in": ["FAILED"] })).toBe(true);
  });
  it("is not pressed when the chips stand on several values", () => {
    expect(isCardPressed(failed, { "status.in": ["FAILED", "QUEUED"] })).toBe(false);
  });
  it("is not pressed with no narrowing", () => {
    expect(isCardPressed(failed, {})).toBe(false);
  });
  it("narrows to its rows on a press, and lifts the narrowing on a second", () => {
    expect(pressedValue(failed, {})).toEqual(["FAILED"]);
    expect(pressedValue(failed, { "status.in": ["FAILED"] })).toBeUndefined();
  });
  it("replaces a wider chip choice with its own rows", () => {
    expect(pressedValue(failed, { "status.in": ["FAILED", "QUEUED"] })).toEqual(["FAILED"]);
  });
});

describe("shownCardTone", () => {
  it("mutes a figure of 0 whatever its tone", () => {
    expect(shownCardTone({ value: 0, tone: "danger" })).toBeUndefined();
  });
  it("keeps the tone of a figure above 0", () => {
    expect(shownCardTone({ value: 2, tone: "danger" })).toBe("danger");
  });
});

describe("countedChips", () => {
  const format = (label: string, count: number) => `${label} · ${count}`;
  it("draws each option's count after its label", () => {
    expect(countedChips({ options: [{ value: "FAILED", label: "Failed" }], counts: { FAILED: 12 } }, format)).toEqual([{ value: "FAILED", label: "Failed · 12" }]);
  });
  it("draws a bare label where no count is given", () => {
    expect(countedChips({ options: [{ value: "FAILED", label: "Failed" }] }, format)).toEqual([{ value: "FAILED", label: "Failed" }]);
  });
});
