import { useLayoutEffect, useState, type RefObject } from "react";
import { flushSync } from "react-dom";

/** The most figure tiles a row holds. */
export const MAX_TILE_COLUMNS = 5;

/** A figure row's column limit: one to five tiles to a row. */
export type TileColumns = 1 | 2 | 3 | 4 | 5;

/**
 * How many tiles fit side by side in a row this wide, each no narrower than the minimum.
 *
 * @param width the row's width in px
 * @param gap the gap between two tiles in px
 * @param min the narrowest a tile is drawn, in px
 * @param cap the most tiles a row may hold
 */
export function tilesThatFit(width: number, gap: number, min: number, cap: number): number {
  if (!(width > 0) || !(min > 0)) return cap;
  return Math.max(1, Math.min(cap, Math.floor((width + gap) / (min + gap))));
}

/**
 * The column count a row of `tiles` draws when `fit` columns fit: every column that fits, and no
 * more columns than there are tiles, so six tiles at five draw 5 + 1 and four tiles at five take
 * the row between them.
 *
 * @param tiles how many tiles the row draws
 * @param fit how many fit side by side
 */
export function tileColumnsFor(tiles: number, fit: number): number {
  if (tiles < 1) return fit;
  return Math.min(tiles, fit);
}

/** A CSS length the token holds (`12rem`, `192px`) in px, against the root font size for `rem`. */
export function lengthPx(value: string, rootFontSize: number): number {
  const text = value.trim();
  const n = Number.parseFloat(text);
  if (Number.isNaN(n)) return 0;
  return text.endsWith("rem") ? n * rootFontSize : n;
}

/** What {@link useTileColumns} reports. */
export interface TileColumnsResult {
  /** The column count to draw with. */
  readonly columns: number;
  /**
   * False until the grid has been measured once. Until then `columns` is a guess made without a
   * width, so anything that records where the tiles stand waits for this to turn true.
   */
  readonly measured: boolean;
}

/**
 * The column count a figure row draws at its own width: as many tiles as fit at the minimum tile
 * width (`--tile-min-width`), up to `cap`. Measured on the grid itself, so
 * it follows the page column rather than the window, and again whenever that column resizes.
 *
 * <p>The first measurement is taken before the first paint, so a narrow column never shows the
 * guess. A window resize commits its new count in the resize event, which runs before the frame's
 * layout, so no frame is drawn with tiles narrower than the minimum. A column that changes without
 * the window (the menu folding, a panel opening) is committed from the next animation frame,
 * because a commit made inside a resize observer's own callback resizes the observed grid again
 * and the browser reports that as an undelivered notification.
 *
 * @param grid the grid element
 * @param tiles how many tiles the row draws
 * @param cap the most tiles a row may hold
 */
export function useTileColumns(grid: RefObject<HTMLElement | null>, tiles: number, cap: TileColumns): TileColumnsResult {
  const [fit, setFit] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = grid.current;
    if (!el) return;
    const read = () => {
      const style = getComputedStyle(el);
      const root = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const gap = Number.parseFloat(style.columnGap) || 0;
      return tilesThatFit(el.clientWidth, gap, lengthPx(style.getPropertyValue("--tile-min-width"), root), cap);
    };
    const commit = () => flushSync(() => setFit(read()));
    setFit(read());
    window.addEventListener("resize", commit);
    let frame = 0;
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(commit);
    });
    observer?.observe(el);
    return () => {
      window.removeEventListener("resize", commit);
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [grid, cap]);
  return { columns: tileColumnsFor(tiles, fit ?? cap), measured: fit !== null };
}
