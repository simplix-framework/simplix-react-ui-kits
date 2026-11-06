/** The least a column with no fixed width is given before its text is cut. */
export const FLUID_COLUMN_MIN = 200;

/**
 * How many leading columns a list draws at every width: the one that names the row. Every column
 * after it narrows the table in turn, last first, so the leading block a generated list draws
 * ahead of the rest (`ALWAYS_DRAWN_COLUMNS`) is the last to go rather than a set that never goes.
 */
export const NAMING_COLUMNS = 1;

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
 * <p>The contract gives each column after its leading block the width of the table up to it, so a
 * wide list narrows column by column. A column with no tier would draw at every width: a column a
 * screen adds of its own (a derived marker after the contract's columns), and the contract's own
 * leading block. With the sorted column and the row actions they make a narrowest table that a
 * tablet's pane holds by a few pixels at best, and a classic scrollbar's width then drops the list to
 * cards although its design is a table. Such a column takes the tier its place in the order gives
 * it: the running width is monotone, so the leading block still drops after every later column, from
 * its own end. A tier the column states, and a column the screen keeps, are left as they are. A list
 * passes {@link NAMING_COLUMNS}, so only the column that names the row has no tier and the card
 * layout is left to a pane that cannot hold that column, the kept ones and the row actions.
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

/**
 * The columns a list's table draws from: every column after the naming one laddered, then the
 * naming, sorted and kept columns made unconditional. A list's table and its card breakpoint both
 * read this set, so the two can never disagree about which columns are always drawn.
 *
 * @param columns the list's columns in field order
 * @param sortField the field the rows are sorted by, if any
 */
export function tableColumnsOf<C extends PrioritisedColumn>(columns: readonly C[], sortField: string | null | undefined): C[] {
  return keepColumnsDrawn(ladderColumns(columns, NAMING_COLUMNS), sortField);
}
