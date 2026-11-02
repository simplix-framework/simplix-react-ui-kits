import { createContext, type ReactNode, useContext, useRef } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { tilesThatFit, useColumnsThatFit } from "../layout/tile-columns";
import { useReflowFlip } from "../layout/use-reflow-flip";

import { dashboardGridStyle } from "./dashboard.style";

/**
 * How many of the grid's columns a dashboard card takes: 1 for a number or a meter, 2 for a series,
 * a breakdown or a short list, 4 for a wide table, an event list or a timeline. There is no 3: a
 * row of three columns has no half to fold into when the grid narrows to two.
 */
export type DashboardSpan = 1 | 2 | 4;

/** The spans a card may take. */
export const DASHBOARD_SPANS: readonly DashboardSpan[] = [1, 2, 4];

/** The column counts the grid draws: four on a wide page, two on a laptop or a tablet, one on a phone. */
export type DashboardColumnCount = 1 | 2 | 4;

/**
 * The columns a dashboard grid this wide draws: four where four cards of the minimum width fit,
 * two where two fit, one otherwise. Never three, so a row composed of halves stays whole.
 *
 * @param width the grid's width in px
 * @param gap the gap between two columns in px
 * @param min the narrowest a one-column card is drawn, in px
 */
export function dashboardColumnsThatFit(width: number, gap: number, min: number): DashboardColumnCount {
  return dashboardColumnsOf(tilesThatFit(width, gap, min, 4));
}

/** The column count for `fit` cards side by side: four, two or one, never three. */
function dashboardColumnsOf(fit: number): DashboardColumnCount {
  return fit >= 4 ? 4 : fit >= 2 ? 2 : 1;
}

/**
 * The columns a card of `span` takes in a grid of `columns`: its span, or the whole row where the
 * grid has fewer columns than the span.
 */
export function spanAt(span: DashboardSpan, columns: DashboardColumnCount): number {
  return Math.min(span, columns);
}

/**
 * Lays cards of these spans into rows of `columns`, in order, the way the grid's auto placement
 * does with no back-filling: a card that does not fit in what is left of a row starts the next.
 *
 * @returns the spans each row holds as drawn
 */
export function dashboardRows(spans: readonly DashboardSpan[], columns: DashboardColumnCount): number[][] {
  const rows: number[][] = [];
  let row: number[] = [];
  let used = 0;
  for (const span of spans) {
    const take = spanAt(span, columns);
    if (used + take > columns) {
      rows.push(row);
      row = [];
      used = 0;
    }
    row.push(take);
    used += take;
  }
  if (row.length > 0) rows.push(row);
  return rows;
}

/**
 * What is wrong with a dashboard's composition, as sentences; empty when every row is full at four,
 * two and one columns. A span other than 1, 2 or 4 is refused, and so is a row of four whose cards
 * do not split into two halves of two (1 + 2 + 1 leaves a gap when the grid narrows to two).
 *
 * @param spans the cards' spans in reading order
 */
export function dashboardRowProblems(spans: readonly number[]): string[] {
  const problems: string[] = [];
  spans.forEach((span, index) => {
    if (!DASHBOARD_SPANS.includes(span as DashboardSpan)) problems.push(`card ${index + 1}: span ${span} is not 1, 2 or 4`);
  });
  if (problems.length > 0) return problems;
  for (const columns of [4, 2] as const) {
    dashboardRows(spans as readonly DashboardSpan[], columns).forEach((row, index) => {
      const sum = row.reduce((total, n) => total + n, 0);
      if (sum !== columns) problems.push(`at ${columns} columns, row ${index + 1} holds ${sum} of ${columns} (${row.join(" + ")})`);
    });
  }
  return problems;
}

const GridColumns = createContext<DashboardColumnCount | null>(null);

/** The column count of the dashboard grid a card stands in, or null outside one. */
export function useDashboardGridColumns(): DashboardColumnCount | null {
  return useContext(GridColumns);
}

/** Props for {@link DashboardGrid}. */
export interface DashboardGridProps {
  /** `DashboardCard`s, each with its `span`, in reading order; every row sums to four. */
  readonly children: ReactNode;
}

/**
 * A dashboard's cards in a grid of four columns on a wide page, two on a laptop or a tablet and one
 * on a phone, decided by the grid's own width and the `--dashboard-card-min-width` token, never by
 * the window. Each card takes the columns its `span` names, and a span wider than the grid takes the
 * whole row, so a composition whose rows sum to four stays full at every width
 * ({@link dashboardRowProblems}).
 */
export function DashboardGrid({ children }: DashboardGridProps) {
  const grid = useRef<HTMLDivElement>(null);
  const fit = useColumnsThatFit(grid, "--dashboard-card-min-width", 4);
  const columns = fit === null ? 4 : dashboardColumnsOf(fit);
  // Crossing a width that changes the column count, the cards glide to their new places.
  useReflowFlip(grid, ":scope > *", [columns]);
  return (
    <GridColumns.Provider value={columns}>
      <div
        ref={grid}
        className="grid"
        data-columns={columns}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        {...slotAttributes(dashboardGridStyle, {})}
      >
        {children}
      </div>
    </GridColumns.Provider>
  );
}
