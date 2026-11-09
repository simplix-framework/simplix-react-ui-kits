import { useLayoutEffect, useRef } from "react";

/** The smallest share of its size a figure is drawn at before it wraps instead of shrinking further. */
export const FIT_FLOOR = 0.6;

/**
 * The share of its size a figure is drawn at so that it fits the room it has, one at its own size when
 * it already fits and never below `floor`.
 *
 * @param room the width the figure may take, in pixels
 * @param need the width the figure takes at its own size, in pixels
 * @param floor the smallest share to draw it at
 */
export function fitScale(room: number, need: number, floor: number = FIT_FLOOR): number {
  if (!(room > 0) || !(need > 0) || need <= room) return 1;
  return Math.max(floor, room / need);
}

/** The width an element's margin on the inline start adds to the line it stands in. */
function startMargin(element: Element): number {
  return Number.parseFloat(getComputedStyle(element).marginInlineStart) || 0;
}

/**
 * The width the figure may take: the card body's row less what stands beside the value (a plot)
 * and what stands beside the figure inside the value (its unit).
 */
function roomFor(figure: HTMLElement, value: HTMLElement, row: HTMLElement): number {
  const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0;
  const aside = [...row.children].filter((child) => child !== value);
  const beside = aside.reduce((sum, child) => sum + child.getBoundingClientRect().width + gap, 0);
  const unit = [...value.children].filter((child) => child !== figure).reduce((sum, child) => sum + child.getBoundingClientRect().width + startMargin(child), 0);
  return row.getBoundingClientRect().width - beside - unit;
}

/**
 * A figure of one piece (a money amount, a percentage, a number with its separators) kept on one
 * line: where the card leaves it less room than it needs it is drawn smaller, down to
 * {@link FIT_FLOOR} of its size, so it is never broken in the middle of its digits. Below that it
 * wraps wherever it must, which is the stat card's own rule that a figure is never cut.
 *
 * <p>A value of several words is left to wrap at its spaces.
 *
 * @param children the figure as text
 */
export function FitFigure({ children }: { readonly children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const onePiece = !/\s/.test(children);
  useLayoutEffect(() => {
    const figure = ref.current;
    const value = figure?.parentElement;
    const row = value?.parentElement;
    if (!figure || !value || !row || !onePiece) return;
    const fit = () => {
      // Measured at its own size, on one line.
      figure.style.fontSize = "";
      figure.style.whiteSpace = "nowrap";
      const need = figure.getBoundingClientRect().width;
      const room = roomFor(figure, value, row);
      const scale = fitScale(room, need);
      figure.style.fontSize = scale === 1 ? "" : `${scale * 100}%`;
      // Smaller than the floor allows, it wraps instead of running out of its card.
      figure.style.whiteSpace = need * scale > room + 0.5 ? "normal" : "nowrap";
    };
    fit();
    if (typeof ResizeObserver === "undefined") return;
    const watch = new ResizeObserver(fit);
    watch.observe(row);
    return () => watch.disconnect();
  }, [children, onePiece]);
  return (
    <span ref={ref} className={onePiece ? "whitespace-nowrap" : undefined}>
      {children}
    </span>
  );
}
