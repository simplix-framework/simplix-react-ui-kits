import { describe, expect, it } from "vitest";
import { stepIndicatorOf } from "./approval-flow";

const step = (key: string, state: "done" | "now" | "wait" | "reject", who = "담당") => ({ key, label: key, who, state });

describe("stepIndicatorOf", () => {
  it("puts the step in hand as current, every step before it done", () => {
    expect(stepIndicatorOf([step("신청", "done"), step("검사", "now"), step("허가", "wait")]).currentStep).toBe(1);
  });
  it("marks a rejected step and stops there", () => {
    const read = stepIndicatorOf([step("신청", "done"), step("검사", "reject"), step("허가", "wait")]);
    expect(read).toMatchObject({ currentStep: 1, rejectedStep: 1 });
  });
  it("reads a chain with nothing in hand or waiting as done throughout", () => {
    expect(stepIndicatorOf([step("신청", "done"), step("검사", "done")]).currentStep).toBe(2);
  });
  it("carries the holder and the time as the second line", () => {
    expect(stepIndicatorOf([{ ...step("검사", "now", "가상 담당자"), at: "10:20" }]).steps[0]).toEqual({ title: "검사", description: "가상 담당자 · 10:20" });
  });
});
