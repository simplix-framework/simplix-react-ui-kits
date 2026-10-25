/** How wide a {@link CrudPage} opens its record. */
export type DetailWidth = "regular" | "wide";

/** The framework's detail width (ListDetail's DETAIL_PANEL_WIDTH), which a regular record opens at. */
export const REGULAR_DETAIL_WIDTH = 768;
/**
 * The width a dialog opens a record at. A dialog covers the list rather than sharing the row with
 * it, so it opens at a reading width of its own instead of the narrow side-panel width the theme
 * names for `--detail-panel-width`; it shrinks with the viewport below that.
 */
export const DIALOG_DETAIL_WIDTH = 960;
/** The width a dialog opens a record at when its tab strip or its parts need more than the regular width. */
export const WIDE_DETAIL_WIDTH = 1120;

/**
 * The width a record opens at in a drawer, whatever its tabs. A drawer lies over the list, so a
 * little more than the panel's width reads as a sheet rather than a strip; widened further it
 * covers the list it was opened from. A tab strip wider than this scrolls with arrows instead.
 */
export const DRAWER_DETAIL_WIDTH = 720;

/**
 * The width a record opens at beside the list, whatever its tabs: wide enough for a two-column
 * field grid, narrow enough that the list keeps its table at console widths.
 */
export const PANEL_DETAIL_WIDTH = 600;

/** The px a record opens at, by presentation and width; undefined leaves the framework's own. */
export function detailWidthPx(presentation: string, width: DetailWidth): number | undefined {
  if (presentation === "drawer") return DRAWER_DETAIL_WIDTH;
  // A panel takes its width from the list beside it, so it keeps one width and lets a wide tab
  // strip scroll; only a dialog, which covers nothing it needs, opens wider.
  if (presentation === "panel") return PANEL_DETAIL_WIDTH;
  if (presentation === "dialog") return width === "wide" ? WIDE_DETAIL_WIDTH : DIALOG_DETAIL_WIDTH;
  return undefined;
}

/**
 * The width a record should open at, from its tab labels: wide when the strip of underline tabs
 * would not fit the regular detail, so a record with many tabs opens with all of them in sight
 * rather than scrolled. Estimated from the label lengths (a Hangul syllable is about one em, a
 * Latin letter about half) plus each tab's padding, against the regular width less the detail's
 * own inset.
 */
export function detailWidthFor(tabLabels: readonly string[]): DetailWidth {
  const em = 14;
  const tabPadding = 32;
  const labelWidth = (label: string) => [...label].reduce((sum, ch) => sum + (/[\u3131-\uD79D]/.test(ch) ? em : em * 0.55), 0);
  const strip = tabLabels.reduce((sum, label) => sum + labelWidth(label) + tabPadding, 0);
  return strip > REGULAR_DETAIL_WIDTH - 48 ? "wide" : "regular";
}
