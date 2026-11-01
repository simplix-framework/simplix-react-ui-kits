import { describe, expect, it } from "vitest";
import { balancedTileColumns, lengthPx, tilesThatFit } from "./tile-columns";

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

describe("balancedTileColumns", () => {
  it("evens the rows: six at five draw 3 + 3, seven 4 + 3, nine 5 + 4", () => {
    expect(balancedTileColumns(6, 5)).toBe(3);
    expect(balancedTileColumns(7, 5)).toBe(4);
    expect(balancedTileColumns(9, 5)).toBe(5);
  });
  it("lets fewer tiles than columns take the row", () => {
    expect(balancedTileColumns(4, 5)).toBe(4);
    expect(balancedTileColumns(2, 5)).toBe(2);
    expect(balancedTileColumns(1, 5)).toBe(1);
  });
  it("uses as few rows as the limit allows, and the fewest columns that keep them", () => {
    for (let fit = 1; fit <= 5; fit++) {
      for (let tiles = 1; tiles <= 30; tiles++) {
        const columns = balancedTileColumns(tiles, fit);
        const rows = Math.ceil(tiles / fit);
        expect(columns).toBeLessThanOrEqual(fit);
        expect(Math.ceil(tiles / columns)).toBe(rows);
        // One column fewer would need another row, so the rows are as even as they can be.
        if (columns > 1) expect(Math.ceil(tiles / (columns - 1))).toBeGreaterThan(rows);
      }
    }
  });
  it("leaves a lone tile on the last row only where every column count at the limit does", () => {
    expect(balancedTileColumns(7, 3)).toBe(3);
    expect(balancedTileColumns(5, 2)).toBe(2);
    expect(balancedTileColumns(8, 5)).toBe(4);
    expect(balancedTileColumns(10, 5)).toBe(5);
    expect(balancedTileColumns(11, 5)).toBe(4);
  });
  it("draws one column when only one fits", () => {
    expect(balancedTileColumns(6, 1)).toBe(1);
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
