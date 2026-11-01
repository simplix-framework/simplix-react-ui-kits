import { describe, expect, it } from "vitest";

import { labelAlign, timelinePositions } from "./event-timeline";
import { outcomeTally } from "./outcome-strip";
import { segmentShares } from "./segment-bar";
import { matrixCells } from "./state-matrix";
import { gaugePoint, gaugeTone } from "./threshold-gauge";

describe("segmentShares", () => {
  it("splits the bar by the parts' sum", () => {
    expect(segmentShares([{ value: 30 }, { value: 10 }, { value: 60 }])).toEqual([30, 10, 60]);
  });
  it("leaves the rest of a larger whole empty", () => {
    expect(segmentShares([{ value: 25 }], 100)).toEqual([25]);
  });
  it("gives no width to a part of 0 or less, and none to any part of an empty whole", () => {
    expect(segmentShares([{ value: -5 }, { value: 5 }])).toEqual([0, 100]);
    expect(segmentShares([{ value: 0 }])).toEqual([0]);
  });
});

describe("outcomeTally", () => {
  it("counts each way an attempt ended", () => {
    expect(outcomeTally([{ tone: "success" }, { tone: "danger" }, { tone: "success" }])).toEqual({ success: 2, warning: 0, danger: 1, neutral: 0 });
  });
});

describe("the threshold gauge", () => {
  it("runs from the left end to the right end of the half ring", () => {
    expect(gaugePoint(0).x).toBeCloseTo(10);
    expect(gaugePoint(1).x).toBeCloseTo(90);
    expect(gaugePoint(0.5)).toEqual({ x: expect.closeTo(50), y: expect.closeTo(10) });
  });
  it("is amber past its threshold and red at its limit", () => {
    expect(gaugeTone(70, 100, 0.8)).toBe("neutral");
    expect(gaugeTone(80, 100, 0.8)).toBe("warning");
    expect(gaugeTone(100, 100, 0.8)).toBe("danger");
    expect(gaugeTone(5, 0, 0.8)).toBe("neutral");
  });
});

describe("matrixCells", () => {
  it("reads the grid row by row", () => {
    expect(matrixCells(["a", "b"], ["x", "y"], (row, column) => row + column)).toEqual([["ax", "ay"], ["bx", "by"]]);
  });
});

describe("timelinePositions", () => {
  it("places instants between the earliest and the latest", () => {
    expect(timelinePositions([{ at: "2026-01-01T00:00:00Z" }, { at: "2026-01-03T00:00:00Z" }, { at: "2026-01-05T00:00:00Z" }])).toEqual([0, 50, 100]);
  });
  it("places instants on a given axis", () => {
    expect(timelinePositions([{ at: "2026-01-02T00:00:00Z" }], "2026-01-01T00:00:00Z", "2026-01-05T00:00:00Z")).toEqual([25]);
  });
  it("stands one instant in the middle", () => {
    expect(timelinePositions([{ at: "2026-01-02T00:00:00Z" }])).toEqual([50]);
  });
});

describe("labelAlign", () => {
  it("holds a label inside the axis at either end and centres it elsewhere", () => {
    expect(labelAlign(0)).toBe("start");
    expect(labelAlign(50)).toBe("middle");
    expect(labelAlign(100)).toBe("end");
  });
});
