import { describe, expect, it } from "vitest";
import { isBlankSecret, secretFormField } from "./record-contract";

const common = { key: "apiKey", label: "API key", required: true };

describe("secret fields", () => {
  it("open as an empty password input, required only for a new record", () => {
    expect(secretFormField(common, false, "keep")).toEqual({ ...common, kind: "password", value: "" });
    expect(secretFormField(common, true, "keep")).toEqual({ ...common, kind: "password", value: "", required: false, placeholder: "keep" });
  });

  it("treat a blank entry as keeping the stored value", () => {
    expect(isBlankSecret("")).toBe(true);
    expect(isBlankSecret("   ")).toBe(true);
    expect(isBlankSecret(undefined)).toBe(true);
    expect(isBlankSecret("sk-1234")).toBe(false);
  });
});
