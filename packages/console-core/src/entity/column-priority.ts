/** The least a column with no fixed width is given before its text is cut. */
export const FLUID_COLUMN_MIN = 200;

/** What the priority rule reads of a list column. */
export interface PrioritisedColumn {
  readonly key: string;
  readonly field?: string;
  readonly width?: number;
  readonly minWidth?: number;
  readonly minTableWidth?: number;
}

/** The width a column asks for in a table. */
function span(column: PrioritisedColumn): number {
  return column.width ?? column.minWidth ?? FLUID_COLUMN_MIN;
}

/**
 * The columns of a list with the ones that must stay on screen made unconditional.
 *
 * <p>A list drops the columns whose `minTableWidth` is wider than its pane, last column first. That
 * order is the field order, and the order says nothing about which column the reader needs: a list
 * sorted by a time column that comes last reads as sorted by nothing at an ordinary width. Two
 * columns never drop:
 *
 * <ul>
 *   <li>the leading column, which names the row;
 *   <li>the column the rows are sorted by, so the order on screen can be checked against a column
 *       on screen.
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
  const kept = columns.map((column, index) => index === 0 || (sortField != null && (column.field === sortField || column.key === sortField)));
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
