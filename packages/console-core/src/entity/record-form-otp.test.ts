import { describe, expect, it } from "vitest";

import { otpBackspace, otpInsert, otpMove } from "./record-form-otp";
import { initialFieldValue, validateField } from "./record-form-rules";
import type { RecordFormField } from "./record-form-types";

describe("otpInsert", () => {
  it("typing a digit fills the box and moves to the next", () => {
    expect(otpInsert("20", 2, "4", 6)).toEqual({ code: "204", focus: 3 });
  });
  it("typing into a box past the code's end writes at the end", () => {
    expect(otpInsert("2", 4, "0", 6)).toEqual({ code: "20", focus: 2 });
  });
  it("pasting six digits fills every box from any box", () => {
    expect(otpInsert("", 3, "204917", 6)).toEqual({ code: "204917", focus: 5 });
    expect(otpInsert("11", 1, " 204-917 ", 6)).toEqual({ code: "204917", focus: 5 });
  });
  it("overwrites a digit in place", () => {
    expect(otpInsert("204917", 2, "8", 6)).toEqual({ code: "208917", focus: 3 });
  });
  it("ignores text without a digit and never grows past the length", () => {
    expect(otpInsert("20", 2, "ab", 6)).toBeNull();
    expect(otpInsert("2049", 4, "1234567", 6)?.code).toBe("123456");
  });
});

describe("otpBackspace", () => {
  it("clears the focused digit", () => {
    expect(otpBackspace("204917", 5)).toEqual({ code: "20491", focus: 5 });
  });
  it("on an empty box clears the one before and moves back", () => {
    expect(otpBackspace("204", 3)).toEqual({ code: "20", focus: 2 });
  });
  it("does nothing in the first empty box", () => {
    expect(otpBackspace("", 0)).toEqual({ code: "", focus: 0 });
  });
});

describe("otpMove", () => {
  it("moves with the arrows, Home and End, clamped to the boxes", () => {
    expect(otpMove("ArrowLeft", 0, 6)).toBe(0);
    expect(otpMove("ArrowRight", 2, 6)).toBe(3);
    expect(otpMove("ArrowRight", 5, 6)).toBe(5);
    expect(otpMove("Home", 4, 6)).toBe(0);
    expect(otpMove("End", 1, 6)).toBe(5);
    expect(otpMove("a", 1, 6)).toBeNull();
  });
});

describe("otp field rules", () => {
  const field: RecordFormField = { kind: "otp", key: "code", label: "Code", length: 6, required: true };
  it("starts empty and asks for every digit", () => {
    expect(initialFieldValue(field)).toBe("");
    expect(validateField(field, "")).toBe("required");
    expect(validateField(field, "20491")).toBe("required");
    expect(validateField(field, "204917")).toBeNull();
  });
});
