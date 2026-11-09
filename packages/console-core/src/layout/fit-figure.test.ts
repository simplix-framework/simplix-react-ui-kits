import { describe, expect, it } from "vitest";

import { FIT_FLOOR, fitScale } from "./fit-figure";

describe("fitScale", () => {
  it("leaves a figure that fits at its own size", () => {
    expect(fitScale(200, 190)).toBe(1);
    expect(fitScale(190, 190)).toBe(1);
  });

  it("draws a figure wider than its room at the share that fits", () => {
    expect(fitScale(150, 200)).toBe(0.75);
  });

  it("never goes below the floor", () => {
    expect(fitScale(60, 200)).toBe(FIT_FLOOR);
  });

  it("leaves a figure at its own size where there is nothing to measure", () => {
    expect(fitScale(0, 200)).toBe(1);
    expect(fitScale(150, 0)).toBe(1);
    expect(fitScale(Number.NaN, 200)).toBe(1);
  });
});
