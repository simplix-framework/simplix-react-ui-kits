import { Fragment, type ReactNode } from "react";
import { Flex, Stack, Text } from "@simplix-react/ui";

/** How one cell of the matrix is tinted, where it is tinted at all. */
export type MatrixCellTone = "warning" | "danger" | "muted";

/** One cell — what it holds, and whether it needs a reader's attention. */
export interface MatrixCell {
  /** What the cell says. Empty is a cell nobody filled, which is what a matrix exists to show. */
  readonly value?: ReactNode;
  /** The line under it, where the cell carries one. */
  readonly note?: ReactNode;
  /** The tint, where the cell needs one. */
  readonly tone?: MatrixCellTone;
}

/** One row — what it is called, and its cells in column order. */
export interface MatrixRow {
  /** A stable key, so React can tell the rows apart. */
  readonly key: string;
  /** What the row is called, in the first column. */
  readonly label: ReactNode;
  /** How far the row is indented, where the rows form a tree. */
  readonly depth?: number;
  /** The cells, one per column, in the columns' own order. */
  readonly cells: readonly MatrixCell[];
}

/** Props for {@link Matrix}. */
export interface MatrixProps {
  /** What the top-left cell says — 「자리 × 날짜」. */
  readonly corner?: ReactNode;
  /** The column heads, in order. */
  readonly columns: readonly ReactNode[];
  /** The rows. */
  readonly rows: readonly MatrixRow[];
  /** Column indexes the matrix paints as standing apart — a holiday, a closed period. */
  readonly markedColumns?: readonly number[];
  /** What the reader is told when there is no row at all. */
  readonly empty?: ReactNode;
  /**
   * Where a cell's content sits across its column. Row heads read as a list and stay at the start
   * either way; the cells are short values under a head of their own width, so a matrix of names or
   * marks is read down the column rather than along the row.
   */
  readonly align?: "start" | "center";
}

/** What each tone paints a cell with. */
const TONES: Readonly<Record<MatrixCellTone, string>> = {
  warning: "bg-warning/15",
  danger: "bg-destructive/15",
  muted: "bg-muted/40",
};

/**
 * Two axes crossed, with a cell where they meet — posts by days, roles by permissions, areas by
 * shifts.
 *
 * <p><b>Why a matrix rather than a list.</b> The question a reader brings to it is always about a
 * cell that is <b>missing</b> — is Saturday night covered, does this role hold that permission —
 * and a list answers that only by being read end to end. An empty cell in a grid is visible
 * without reading anything.
 *
 * <p><b>Here rather than in each screen.</b> Sixty-six frames on this board cross two axes, and a
 * copy per screen drifts on the parts a reader uses: whether the head sticks, whether an empty cell
 * looks empty or looks like a cell that failed to load, and how a marked column is painted.
 *
 * <p><b>It scrolls sideways inside its own frame.</b> Seven columns fit and thirty-one do not, and
 * a matrix that widened the page would push the rest of the screen off the side of it.
 *
 * @param props the corner, the columns, the rows and which columns stand apart
 * @returns the grid
 */
export function Matrix({
  corner,
  columns,
  rows,
  markedColumns = [],
  empty,
  align = "start",
}: MatrixProps) {
  const marked = new Set(markedColumns);
  const centered = align === "center";

  if (rows.length === 0 && empty) {
    return (
      <Text size="sm" tone="muted">
        {empty}
      </Text>
    );
  }

  return (
    // raw layout: a two-axis grid that scrolls sideways inside its own frame; the framework ships
    // no matrix primitive, and a table would put the row heads on the scrolling side
    <div className="overflow-x-auto rounded-md border">
      <div
        className="grid min-w-max"
        style={{ gridTemplateColumns: `minmax(10rem, auto) repeat(${columns.length}, minmax(7rem, 1fr))` }}
        role="table"
      >
        <div className="sticky left-0 z-10 border-b bg-muted/60 px-3 py-2" role="columnheader">
          <Text size="caption" tone="muted">
            {corner}
          </Text>
        </div>
        {columns.map((column, index) => (
          <div
            key={`head-${index}`}
            className={`border-b px-3 py-2 ${centered ? "text-center" : ""} ${marked.has(index) ? "bg-warning/10" : "bg-muted/60"}`}
            role="columnheader"
          >
            <Text size="caption" tone="muted">
              {column}
            </Text>
          </div>
        ))}

        {rows.map((row) => (
          <Fragment key={row.key}>
            <div
              className="sticky left-0 z-10 border-b bg-background px-3 py-2"
              style={row.depth ? { paddingLeft: `${0.75 + row.depth * 0.875}rem` } : undefined}
              role="rowheader"
            >
              <Text size="sm">{row.label}</Text>
            </div>
            {columns.map((_, index) => {
              const cell = row.cells[index];
              const tone = cell?.tone;
              return (
                <div
                  key={`${row.key}-${index}`}
                  className={`border-b px-3 py-2 ${tone ? TONES[tone] : marked.has(index) ? "bg-warning/5" : ""}`}
                  role="cell"
                >
                  <Stack gap="none" minSize align={centered ? "center" : undefined}>
                    <Flex align="center" gap="xs" wrap justify={centered ? "center" : undefined}>
                      {cell?.value}
                    </Flex>
                    {cell?.note ? (
                      <Text as="span" size="caption" tone="muted">
                        {cell.note}
                      </Text>
                    ) : null}
                  </Stack>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
