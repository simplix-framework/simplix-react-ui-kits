import { describe, expect, it } from "vitest";

import { countedChips } from "./record-list";
import { cardFilterKey, isCardPressed, narrowedValues, pressedCardKeys, pressedValue, pressedValues, shownCardTone, foldedSummary, readFolded, writeFolded } from "./status-card-strip";

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

describe("a card over a range or a threshold", () => {
  const serverErrors = { values: { "occurredAt.greaterThanOrEqualTo": "2026-11-01T00:00:00Z", "httpStatus.greaterThanOrEqualTo": 500 } };
  it("is pressed only when every key stands on its value", () => {
    expect(isCardPressed(serverErrors, { "occurredAt.greaterThanOrEqualTo": "2026-11-01T00:00:00Z", "httpStatus.greaterThanOrEqualTo": "500" })).toBe(true);
    expect(isCardPressed(serverErrors, { "occurredAt.greaterThanOrEqualTo": "2026-11-01T00:00:00Z" })).toBe(false);
  });
  it("writes every key on a press and lifts every key on a second", () => {
    expect(pressedValues(serverErrors, {})).toEqual(serverErrors.values);
    expect(pressedValues(serverErrors, { ...serverErrors.values })).toEqual({ "occurredAt.greaterThanOrEqualTo": undefined, "httpStatus.greaterThanOrEqualTo": undefined });
  });
  it("writes a one-value card as the chip row's key", () => {
    expect(pressedValues(failed, {})).toEqual({ "status.in": ["FAILED"] });
  });
});

describe("a strip whose cards narrow inside each other", () => {
  const day = { key: "day", filter: { values: { "occurredAt.greaterThanOrEqualTo": "D" } } };
  const serverDay = { key: "serverDay", filter: { values: { "occurredAt.greaterThanOrEqualTo": "D", "httpStatus.greaterThanOrEqualTo": 500 } } };
  const cards = [day, serverDay];
  it("draws only the narrower card pressed when both match", () => {
    expect([...pressedCardKeys(cards, { "occurredAt.greaterThanOrEqualTo": "D", "httpStatus.greaterThanOrEqualTo": 500 })]).toEqual(["serverDay"]);
  });
  it("draws the wider card pressed when only it matches", () => {
    expect([...pressedCardKeys(cards, { "occurredAt.greaterThanOrEqualTo": "D" })]).toEqual(["day"]);
  });
  it("lifts the keys only the other cards write when moving to a wider card", () => {
    expect(narrowedValues(day.filter, cards, { "occurredAt.greaterThanOrEqualTo": "D", "httpStatus.greaterThanOrEqualTo": 500 })).toEqual({
      "httpStatus.greaterThanOrEqualTo": undefined,
      "occurredAt.greaterThanOrEqualTo": "D",
    });
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

describe("folding the status cards", () => {
  const store = () => {
    const memory = new Map<string, string>();
    return { getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => void memory.set(k, v), removeItem: (k: string) => void memory.delete(k) };
  };
  it("remembers a fold per page and forgets it on unfold", () => {
    const storage = store();
    writeFolded(storage, "backgroundJob", true);
    expect(readFolded(storage, "backgroundJob")).toBe(true);
    expect(readFolded(storage, "paymentEvent")).toBe(false);
    writeFolded(storage, "backgroundJob", false);
    expect(readFolded(storage, "backgroundJob")).toBe(false);
  });
  it("starts unfolded with no storage, no page, or a storage that refuses", () => {
    expect(readFolded(undefined, "backgroundJob")).toBe(false);
    expect(readFolded(store(), undefined)).toBe(false);
    const refusing = { getItem: () => { throw new DOMException("denied"); }, setItem: () => { throw new DOMException("denied"); }, removeItem: () => {} };
    expect(readFolded(refusing, "backgroundJob")).toBe(false);
    expect(() => writeFolded(refusing, "backgroundJob", true)).not.toThrow();
  });
  it("reads as one line of every card's label and figure, leaving out a figure not read yet", () => {
    expect(foldedSummary([
      { key: "failed", label: "Failed", value: 1200 },
      { key: "spent", label: "Spent", value: 5, unit: "credits" },
      { key: "queued", label: "Queued", value: undefined },
    ])).toEqual([
      { key: "failed", label: "Failed", figure: (1200).toLocaleString() },
      { key: "spent", label: "Spent", figure: "5 credits" },
    ]);
  });
});
