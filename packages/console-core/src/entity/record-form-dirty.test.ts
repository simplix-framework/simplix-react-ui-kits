import { describe, expect, it } from "vitest";

import { valuesChanged } from "./record-form";

describe("valuesChanged", () => {
  const baseline = { name: "", enabled: true, tags: ["a"], title: { en: "Hello", ko: "" } };

  it("is false for the values the form started with, however they are rebuilt", () => {
    expect(valuesChanged(baseline, { name: "", enabled: true, tags: ["a"], title: { en: "Hello", ko: "" } })).toBe(false);
  });

  it("is true once any value differs, a text, a switch, a list or a per-language map", () => {
    expect(valuesChanged(baseline, { ...baseline, name: "Ada" })).toBe(true);
    expect(valuesChanged(baseline, { ...baseline, enabled: false })).toBe(true);
    expect(valuesChanged(baseline, { ...baseline, tags: ["a", "b"] })).toBe(true);
    expect(valuesChanged(baseline, { ...baseline, title: { en: "Hello", ko: "안녕" } })).toBe(true);
  });

  it("does not count a field the form did not start with", () => {
    expect(valuesChanged(baseline, { ...baseline, later: "typed" })).toBe(false);
  });
});
