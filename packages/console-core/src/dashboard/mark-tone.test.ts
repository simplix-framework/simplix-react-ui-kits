import { describe, expect, it } from "vitest";

import { markToneOf, seriesTone } from "./mark-tone";

describe("markToneOf", () => {
  it("draws a module's status tone in the same colour on a chart, and a state in motion as info", () => {
    expect(markToneOf("danger")).toBe("danger");
    expect(markToneOf("success")).toBe("success");
    expect(markToneOf("pending")).toBe("info");
    expect(markToneOf("processing")).toBe("info");
  });
});

describe("seriesTone", () => {
  it("rotates the three series colours by place", () => {
    expect([0, 1, 2, 3, 4].map(seriesTone)).toEqual(["series-1", "series-2", "series-3", "series-1", "series-2"]);
  });
});
