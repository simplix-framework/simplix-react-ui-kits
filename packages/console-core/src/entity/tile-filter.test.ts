import { describe, expect, it } from "vitest";

import { countedChips } from "./record-list";
import { isTilePressed, narrowedValues, pressedTileKeys, pressedValue, pressedValues, tileFilterKey } from "./tile-filter";

const failed = { field: "status", value: "FAILED" };

describe("figure tiles and the chip row share one filter", () => {
  it("writes the chip row's key", () => {
    expect(tileFilterKey(failed)).toBe("status.in");
  });
  it("is pressed when the chips stand on its value alone", () => {
    expect(isTilePressed(failed, { "status.in": ["FAILED"] })).toBe(true);
  });
  it("is not pressed when the chips stand on several values", () => {
    expect(isTilePressed(failed, { "status.in": ["FAILED", "QUEUED"] })).toBe(false);
  });
  it("is not pressed with no narrowing", () => {
    expect(isTilePressed(failed, {})).toBe(false);
  });
  it("narrows to its rows on a press, and lifts the narrowing on a second", () => {
    expect(pressedValue(failed, {})).toEqual(["FAILED"]);
    expect(pressedValue(failed, { "status.in": ["FAILED"] })).toBeUndefined();
  });
  it("replaces a wider chip choice with its own rows", () => {
    expect(pressedValue(failed, { "status.in": ["FAILED", "QUEUED"] })).toEqual(["FAILED"]);
  });
});

describe("a tile over a range or a threshold", () => {
  const serverErrors = { values: { "occurredAt.greaterThanOrEqualTo": "2026-11-01T00:00:00Z", "httpStatus.greaterThanOrEqualTo": 500 } };
  it("is pressed only when every key stands on its value", () => {
    expect(isTilePressed(serverErrors, { "occurredAt.greaterThanOrEqualTo": "2026-11-01T00:00:00Z", "httpStatus.greaterThanOrEqualTo": "500" })).toBe(true);
    expect(isTilePressed(serverErrors, { "occurredAt.greaterThanOrEqualTo": "2026-11-01T00:00:00Z" })).toBe(false);
  });
  it("writes every key on a press and lifts every key on a second", () => {
    expect(pressedValues(serverErrors, {})).toEqual(serverErrors.values);
    expect(pressedValues(serverErrors, { ...serverErrors.values })).toEqual({ "occurredAt.greaterThanOrEqualTo": undefined, "httpStatus.greaterThanOrEqualTo": undefined });
  });
  it("writes a one-value card as the chip row's key", () => {
    expect(pressedValues(failed, {})).toEqual({ "status.in": ["FAILED"] });
  });
});

describe("a row whose tiles narrow inside each other", () => {
  const day = { key: "day", filter: { values: { "occurredAt.greaterThanOrEqualTo": "D" } } };
  const serverDay = { key: "serverDay", filter: { values: { "occurredAt.greaterThanOrEqualTo": "D", "httpStatus.greaterThanOrEqualTo": 500 } } };
  const cards = [day, serverDay];
  it("draws only the narrower card pressed when both match", () => {
    expect([...pressedTileKeys(cards, { "occurredAt.greaterThanOrEqualTo": "D", "httpStatus.greaterThanOrEqualTo": 500 })]).toEqual(["serverDay"]);
  });
  it("draws the wider card pressed when only it matches", () => {
    expect([...pressedTileKeys(cards, { "occurredAt.greaterThanOrEqualTo": "D" })]).toEqual(["day"]);
  });
  it("lifts the keys only the other cards write when moving to a wider card", () => {
    expect(narrowedValues(day.filter, cards, { "occurredAt.greaterThanOrEqualTo": "D", "httpStatus.greaterThanOrEqualTo": 500 })).toEqual({
      "httpStatus.greaterThanOrEqualTo": undefined,
      "occurredAt.greaterThanOrEqualTo": "D",
    });
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
