/** The least a column with no fixed width is given before its text is cut. */
export const FLUID_COLUMN_MIN = 200;

/** What the priority rule reads of a list column. */
export interface PrioritisedColumn {
  readonly key: string;
  readonly field?: string;
  readonly width?: number;
  readonly minWidth?: number;
  readonly minTableWidth?: number;
  /** A column the screen keeps on screen at every width. */
  readonly keep?: boolean;
}

/** The width a column asks for in a table. */
function span(column: PrioritisedColumn): number {
  return column.width ?? column.minWidth ?? FLUID_COLUMN_MIN;
}

/**
 * The columns of a list with a width tier on every column after the leading ones.
 *
 * <p>The contract gives each column after the leading ones the width of the table up to it, so a
 * wide list narrows column by column. A column a screen adds of its own (a derived marker after the
 * contract's columns) comes with no tier and would draw at every width; with the leading columns and
 * the sorted one it can make the narrowest table wider than a tablet's pane, and the list then falls
 * to cards although its design is a table. Such a column takes the tier its place in the order gives
 * it. A tier the column states, and a column the screen keeps, are left as they are.
 *
 * @param columns the list's columns in field order
 * @param alwaysDrawn how many leading columns draw at every width
 * @returns the columns with the same keys and order, every later column with a tier
 */
export function ladderColumns<C extends PrioritisedColumn>(columns: readonly C[], alwaysDrawn: number): C[] {
  let running = 0;
  return columns.map((column, index) => {
    running += span(column);
    if (index < alwaysDrawn || column.minTableWidth !== undefined || column.keep === true) return column;
    return { ...column, minTableWidth: running };
  });
}

/**
 * The columns of a list with the ones that must stay on screen made unconditional.
 *
 * <p>A list drops the columns whose `minTableWidth` is wider than its pane, last column first. That
 * order is the field order, and the order says nothing about which column the reader needs: a list
 * sorted by a time column that comes last reads as sorted by nothing at an ordinary width. Three
 * columns never drop:
 *
 * <ul>
 *   <li>the leading column, which names the row;
 *   <li>the column the rows are sorted by, so the order on screen can be checked against a column
 *       on screen;
 *   <li>a column the screen keeps (`keep`), without which another drawn column reads wrong.
 * </ul>
 *
 * The row-action column is not a list column and is always drawn by the table.
 *
 * <p>A kept column leaves the tier ladder, and every tier before it grows by the width the kept
 * column now always takes: a column further left is drawn only where it fits beside the kept
 * columns, which is how the remaining columns still drop from the end and never overflow the pane.
 *
 * @param columns the list's columns in field order, each with the tier its generator gave it
 * @param sortField the field the rows are sorted by, if any
 * @returns the columns with the same keys and order, and the tiers recomputed around the kept ones
 */
export function keepColumnsDrawn<C extends PrioritisedColumn>(columns: readonly C[], sortField: string | null | undefined): C[] {
  const kept = columns.map((column, index) => index === 0 || column.keep === true || (sortField != null && (column.field === sortField || column.key === sortField)));
  return columns.map((column, index) => {
    if (column.minTableWidth === undefined) return column;
    if (kept[index]) return { ...column, minTableWidth: undefined };
    let beside = 0;
    for (let later = index + 1; later < columns.length; later += 1) {
      // A later column that already drew at every width was counted in no tier, so it is the
      // kept columns that used to carry a tier whose width is new to the ones before them.
      if (kept[later] && columns[later]!.minTableWidth !== undefined) beside += span(columns[later]!);
    }
    return beside === 0 ? column : { ...column, minTableWidth: column.minTableWidth + beside };
  });
}
