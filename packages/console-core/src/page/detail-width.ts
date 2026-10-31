import { useEffect, useMemo, useState } from "react";

/** How wide a {@link CrudPage} opens its record. Kept for screens that still name it; see {@link detailWidthPx}. */
export type DetailWidth = "regular" | "wide";

/** The width {@link detailWidthFor} judges a tab strip against; the framework's own detail width. */
export const REGULAR_DETAIL_WIDTH = 768;

/** The presentations whose width the reader can change; a page is the width of the window. */
export type ResizablePresentation = "panel" | "drawer" | "dialog";

/**
 * What a theme says about one presentation's width, in px. Each is absent when the theme names
 * none, which leaves the framework's own answer (its default width, its minimum, the room the
 * window has) in force.
 */
export interface DetailWidthLimits {
  /** The width the record opens at, and the one a double press on the handle returns to. */
  readonly width?: number;
  /** The narrowest the reader can drag the record to. */
  readonly min?: number;
  /** The widest the reader can drag the record to. */
  readonly max?: number;
}

/**
 * The theme variables that name a presentation's width: `--detail-<presentation>-width`, with
 * `-min-width` and `-max-width` beside it. A design writes them from the product's tokens
 * (`detail-panel`, `detail-panel-min`, `detail-panel-max`, and the same for the drawer and the
 * dialog), so the kit holds no width of its own.
 */
function propertyOf(presentation: string, bound: "width" | "min-width" | "max-width"): string {
  return `--detail-${presentation}-${bound}`;
}

const RESIZABLE: readonly string[] = ["panel", "drawer", "dialog"];

function readPx(style: CSSStyleDeclaration, property: string): number | undefined {
  const value = Number.parseFloat(style.getPropertyValue(property));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

/** The widths the theme names for a presentation, read from the document; none for a page or where there is no document. */
export function detailWidthLimits(presentation: string): DetailWidthLimits {
  if (!RESIZABLE.includes(presentation) || typeof document === "undefined") return {};
  const style = getComputedStyle(document.documentElement);
  return {
    width: readPx(style, propertyOf(presentation, "width")),
    min: readPx(style, propertyOf(presentation, "min-width")),
    max: readPx(style, propertyOf(presentation, "max-width")),
  };
}

/**
 * The px a record opens at in a presentation: the theme's `--detail-<presentation>-width`, so the
 * panel beside the list, the drawer over it and the dialog above it each take the width their
 * design token names. Undefined where the theme names none, which leaves the framework's width.
 * The record's tabs do not change it: a tab strip wider than the width scrolls with arrows, and the
 * reader can drag the record wider.
 *
 * <p>`width` is accepted so a screen that still names it compiles; it no longer changes anything.
 */
export function detailWidthPx(presentation: string, _width: DetailWidth): number | undefined {
  return detailWidthLimits(presentation).width;
}

/**
 * {@link detailWidthLimits}, read before the first paint and read again when the design changes,
 * so a record that opens with the page is not drawn at one width and then another.
 */
export function useDetailWidthLimits(presentation: string): DetailWidthLimits {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => setRevision((current) => current + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-design", "class", "style"] });
    return () => observer.disconnect();
  }, []);
  // `revision` is not read in the body: it is the signal that the document's variables changed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => detailWidthLimits(presentation), [presentation, revision]);
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
  const labelWidth = (label: string) => [...label].reduce((sum, ch) => sum + (/[ㄱ-힝]/.test(ch) ? em : em * 0.55), 0);
  const strip = tabLabels.reduce((sum, label) => sum + labelWidth(label) + tabPadding, 0);
  return strip > REGULAR_DETAIL_WIDTH - 48 ? "wide" : "regular";
}
