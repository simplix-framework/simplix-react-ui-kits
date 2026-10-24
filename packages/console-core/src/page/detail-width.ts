/** How wide a {@link CrudPage} opens its record. */
export type DetailWidth = "regular" | "wide";

/** The framework's detail width (ListDetail's DETAIL_PANEL_WIDTH), which a regular record opens at. */
export const REGULAR_DETAIL_WIDTH = 768;
/** The width a record opens at when its tab strip or its parts need more than the regular width. */
export const WIDE_DETAIL_WIDTH = 1040;

/**
 * The width a record opens at in a drawer, whatever its tabs. A drawer lies over the list, so a
 * little more than the panel's width reads as a sheet rather than a strip; widened further it
 * covers the list it was opened from. A tab strip wider than this scrolls with arrows instead.
 */
export const DRAWER_DETAIL_WIDTH = 880;

/** The px a record opens at, by presentation and width; undefined leaves the framework's own. */
export function detailWidthPx(presentation: string, width: DetailWidth): number | undefined {
  if (presentation === "drawer") return DRAWER_DETAIL_WIDTH;
  return width === "wide" ? WIDE_DETAIL_WIDTH : undefined;
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
