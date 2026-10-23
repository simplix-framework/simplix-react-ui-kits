import type { ReactNode } from "react";

interface HorizontalScrollProps {
  /** The wide thing — a table, a matrix, a strip of chips. */
  readonly children: ReactNode;
}

/**
 * A region that scrolls sideways instead of pushing the page wider.
 *
 * <p><b>The page must never scroll horizontally; the wide thing inside it must.</b> A matrix or a
 * comparison table is wider than a dialog on a narrow window, and without this the whole layout
 * takes the extra width — the header, the tiles and the banner all shift, and the reader scrolls
 * the page to read one table.
 *
 * <p><b>Only one axis is asked for and the browser grants both.</b> Setting `overflow-x` makes the
 * block axis `auto` as well, so content that overflows downward by a pixel paints a vertical
 * scrollbar here. Where that happens the arithmetic is wrong in the content, not here — this never
 * hides a scrollbar (invariant #58).
 */
export function HorizontalScroll({ children }: HorizontalScrollProps) {
  return <div className="overflow-x-auto">{children}</div>;
}
