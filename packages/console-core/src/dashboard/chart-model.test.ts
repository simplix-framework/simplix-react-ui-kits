import { describe, expect, it } from "vitest";

import { axisDayLabel, heatStep, ringDash, ringReading, sparkChange, sparkPoints, stageSpans } from "./chart-model";

describe("stageSpans", () => {
  it("shares the bar by count and skips empty stages", () => {
    const spans = stageSpans([
      { key: "a", value: 2 },
      { key: "b", value: 0 },
      { key: "c", value: 6 },
    ]);
    expect(spans.map((s) => s.key)).toEqual(["a", "c"]);
    expect(spans[0].width).toBeCloseTo(0.25);
    expect(spans[1].start).toBeCloseTo(0.25);
    expect(spans.reduce((sum, s) => sum + s.width, 0)).toBeCloseTo(1);
  });

  it("keeps a small stage at the floor width and still fills the bar", () => {
    const spans = stageSpans([
      { key: "a", value: 1 },
      { key: "b", value: 99 },
    ]);
    expect(spans[0].width).toBeCloseTo(0.06);
    expect(spans[0].width + spans[1].width).toBeCloseTo(1);
  });

  it("draws nothing when every stage is empty", () => {
    expect(stageSpans([{ key: "a", value: 0 }])).toEqual([]);
  });
});

describe("ringReading", () => {
  it("is neutral with no percentage when nothing was due", () => {
    expect(ringReading(0, 0)).toEqual({ ratio: 0, percent: null, tone: "neutral" });
  });

  it("grades by the share done", () => {
    expect(ringReading(3, 3).tone).toBe("accent");
    expect(ringReading(2, 3).tone).toBe("warning");
    expect(ringReading(1, 3).tone).toBe("danger");
    expect(ringReading(5, 3).ratio).toBe(1);
    expect(ringReading(2, 3).percent).toBe(67);
  });

  it("fills the dash pattern by the ratio", () => {
    const { length, dasharray } = ringDash(0.5, 10);
    expect(length).toBeCloseTo(62.83, 1);
    expect(dasharray.split(" ")[0]).toBe((length / 2).toFixed(2));
  });
});

describe("heatStep", () => {
  it("keeps zero cold and any count at least warm", () => {
    expect(heatStep(0, 5)).toBe(0);
    expect(heatStep(1, 100)).toBe(1);
    expect(heatStep(5, 5)).toBe(4);
    expect(heatStep(3, 0)).toBe(0);
  });
});

describe("sparkPoints", () => {
  it("spreads points across the width with the largest at the top", () => {
    const points = sparkPoints([0, 5, 10], 100, 20, 2);
    expect(points.map((p) => p.x)).toEqual([0, 50, 100]);
    expect(points[2].y).toBe(2);
    expect(points[0].y).toBe(18);
    expect(sparkChange([4, 7, 2])).toBe(-2);
  });
});

describe("axisDayLabel", () => {
  it("writes the month and day from the day's own components, in the reader's language", () => {
    expect(axisDayLabel("2026-03-14", "en-US")).toBe("3/14");
    expect(axisDayLabel("2026-03-14", "ko")).toBe("3. 14.");
    // The first of a month stays the first whatever zone the test runs in.
    expect(axisDayLabel("2026-11-01", "en-US")).toBe("11/1");
  });

  it("gives back what is not a calendar day", () => {
    expect(axisDayLabel("today", "en-US")).toBe("today");
  });
});
