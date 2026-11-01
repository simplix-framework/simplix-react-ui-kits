import { describe, expect, it } from "vitest";

import { daysAgoText } from "./days-ago-text";

describe("daysAgoText", () => {
  it("says one day in the singular and several in the plural", () => {
    expect(daysAgoText(1, "en")).toBe("1 day ago");
    expect(daysAgoText(2, "en")).toBe("2 days ago");
    expect(daysAgoText(1200, "en")).toBe("1,200 days ago");
  });

  it("says it in the reader's language", () => {
    expect(daysAgoText(1, "ko")).toBe("1일 전");
    expect(daysAgoText(30, "ko")).toBe("30일 전");
  });

  it("refuses a count it cannot word", () => {
    expect(() => daysAgoText(0, "en")).toThrow(RangeError);
    expect(() => daysAgoText(-1, "en")).toThrow(RangeError);
    expect(() => daysAgoText(1.5, "en")).toThrow(RangeError);
    expect(() => daysAgoText(Number.NaN, "en")).toThrow(RangeError);
  });
});
