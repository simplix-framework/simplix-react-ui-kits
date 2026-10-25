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
  it("keeps the time as the second line and draws the holder in the step's detail", () => {
    const shown = stepIndicatorOf([{ ...step("검사", "now", "가상 담당자"), at: "10:20" }]).steps[0];
    expect(shown?.title).toBe("검사");
    expect(shown?.description).toBe("10:20");
    expect(shown?.detail).toBeTruthy();
  });
});
