import { describe, expect, it } from "vitest";

import { meterShare, meterTone } from "./record-meter";

describe("a spent-of-limit reading", () => {
  it("states its share, capped at 100", () => {
    expect(meterShare({ value: 25, total: 100 })).toBe(25);
    expect(meterShare({ value: 150, total: 100 })).toBe(100);
  });
  it("has no share without a limit", () => {
    expect(meterShare({ value: 25, total: 0 })).toBeUndefined();
  });
  it("is neutral below the warning share, amber from it and red at the limit", () => {
    expect(meterTone({ value: 79, total: 100 })).toBe("neutral");
    expect(meterTone({ value: 80, total: 100 })).toBe("warning");
    expect(meterTone({ value: 100, total: 100 })).toBe("danger");
  });
  it("takes its own warning share", () => {
    expect(meterTone({ value: 50, total: 100, warnAt: 0.5 })).toBe("warning");
  });
  it("is neutral with no limit", () => {
    expect(meterTone({ value: 5, total: 0 })).toBe("neutral");
  });
});
