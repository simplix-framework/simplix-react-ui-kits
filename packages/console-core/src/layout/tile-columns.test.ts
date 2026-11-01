import { describe, expect, it } from "vitest";
import { lengthPx, tileColumnsFor, tilesThatFit } from "./tile-columns";

describe("tilesThatFit", () => {
  it("steps down with the row's width at a 192px tile and a 16px gap, up to five", () => {
    expect(tilesThatFit(1124, 16, 192, 5)).toBe(5);
    expect(tilesThatFit(800, 16, 192, 5)).toBe(3);
    expect(tilesThatFit(400, 16, 192, 5)).toBe(2);
    expect(tilesThatFit(150, 16, 192, 5)).toBe(1);
  });
  it("changes count exactly where the next tile stops fitting", () => {
    // n tiles need n * 192 + (n - 1) * 16 px.
    expect(tilesThatFit(1024, 16, 192, 5)).toBe(5);
    expect(tilesThatFit(1023, 16, 192, 5)).toBe(4);
    expect(tilesThatFit(816, 16, 192, 5)).toBe(4);
    expect(tilesThatFit(815, 16, 192, 5)).toBe(3);
    expect(tilesThatFit(608, 16, 192, 5)).toBe(3);
    expect(tilesThatFit(607, 16, 192, 5)).toBe(2);
    expect(tilesThatFit(400, 16, 192, 5)).toBe(2);
    expect(tilesThatFit(399, 16, 192, 5)).toBe(1);
  });
  it("keeps to a screen's own cap", () => {
    expect(tilesThatFit(1124, 16, 192, 3)).toBe(3);
    expect(tilesThatFit(1124, 16, 192, 1)).toBe(1);
  });
  it("never answers below one, however narrow the column", () => {
    expect(tilesThatFit(10, 16, 192, 5)).toBe(1);
  });
  it("answers the cap while the width or the minimum cannot be read", () => {
    expect(tilesThatFit(0, 16, 192, 5)).toBe(5);
    expect(tilesThatFit(800, 16, 0, 5)).toBe(5);
  });
});

describe("tileColumnsFor", () => {
  it("draws every column that fits: six at five make 5 + 1, seven 5 + 2, nine 5 + 4", () => {
    expect(tileColumnsFor(6, 5)).toBe(5);
    expect(tileColumnsFor(7, 5)).toBe(5);
    expect(tileColumnsFor(9, 5)).toBe(5);
  });
  it("lets fewer tiles than columns take the row", () => {
    expect(tileColumnsFor(4, 5)).toBe(4);
    expect(tileColumnsFor(2, 5)).toBe(2);
    expect(tileColumnsFor(1, 5)).toBe(1);
  });
  it("steps down with the width alone", () => {
    expect(tileColumnsFor(6, 3)).toBe(3);
    expect(tileColumnsFor(4, 3)).toBe(3);
    expect(tileColumnsFor(9, 1)).toBe(1);
  });
  it("never draws more columns than fit or than there are tiles", () => {
    for (let fit = 1; fit <= 5; fit++) {
      for (let tiles = 1; tiles <= 30; tiles++) {
        const columns = tileColumnsFor(tiles, fit);
        expect(columns).toBe(Math.min(tiles, fit));
      }
    }
  });
});

describe("lengthPx", () => {
  it("reads rem against the root font size and px as it is", () => {
    expect(lengthPx("12rem", 16)).toBe(192);
    expect(lengthPx(" 12rem ", 20)).toBe(240);
    expect(lengthPx("192px", 16)).toBe(192);
  });
  it("reads an absent token as zero", () => {
    expect(lengthPx("", 16)).toBe(0);
  });
});
