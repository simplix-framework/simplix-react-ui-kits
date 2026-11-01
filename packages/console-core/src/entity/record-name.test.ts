import { describe, expect, it } from "vitest";

import { recordNameOf } from "./record-contract";

describe("a record's name from its name fields' drawn values", () => {
  it("reads an enum by its badge label and joins the parts in order", () => {
    expect(recordNameOf([{ badge: { label: "Speech model" } }, "Nov 1, 2026, 9:03 AM"])).toBe("Speech model Nov 1, 2026, 9:03 AM");
  });

  it("reads text, code text and a reference's name", () => {
    expect(recordNameOf([{ text: "KEY", code: true }, { link: "Kim" }, 3])).toBe("KEY Kim 3");
  });

  it("leaves out the parts that draw nothing", () => {
    expect(recordNameOf([null, "model", undefined, ""])).toBe("model");
  });
});
