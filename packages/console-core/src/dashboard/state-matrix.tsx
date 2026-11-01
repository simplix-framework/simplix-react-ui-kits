import { StatusBadge, type StatusTone } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";

import { stateMatrixCellStyle, stateMatrixHeadStyle, stateMatrixStateStyle, stateMatrixStyle, stateMatrixSubStyle } from "./figure-parts.style";

/** The state at one row and column: what is offered on that channel for that platform. */
export interface StateMatrixCell {
  readonly label: string;
  readonly tone?: StatusTone;
  /** A second line under the state, such as a version. */
  readonly sub?: string;
}

/** Props for {@link StateMatrix}. */
export interface StateMatrixProps {
  /** What the grid shows, as its caption for a screen reader. */
  readonly label: string;
  readonly rows: readonly { readonly key: string; readonly label: string }[];
  readonly columns: readonly { readonly key: string; readonly label: string }[];
  /** The cell at a row and a column; `undefined` draws the empty mark. */
  readonly cell: (row: string, column: string) => StateMatrixCell | undefined;
  /** What an empty cell says (「Not offered」). */
  readonly emptyLabel: string;
}

/**
 * The cells of a grid in reading order, row by row, so a caller can count or check what a grid
 * holds without drawing it.
 *
 * @param rows the row keys
 * @param columns the column keys
 * @param cell the cell at a row and a column
 */
export function matrixCells<T>(rows: readonly string[], columns: readonly string[], cell: (row: string, column: string) => T): T[][] {
  return rows.map((row) => columns.map((column) => cell(row, column)));
}

/**
 * Rows by columns of states, one badge per cell: which release each channel offers on each
 * platform, which plan carries each allowance. Every cell is drawn, an empty one with its words,
 * so a gap reads as a gap rather than a missing column.
 */
export function StateMatrix({ label, rows, columns, cell, emptyLabel }: StateMatrixProps) {
  const cells = matrixCells(
    rows.map((one) => one.key),
    columns.map((one) => one.key),
    cell,
  );
  return (
    <table {...slotAttributes(stateMatrixStyle, {})}>
      <caption className="sr-only">{label}</caption>
      <thead>
        <tr>
          <th scope="col" {...slotAttributes(stateMatrixHeadStyle, {})} />
          {columns.map((column) => (
            <th key={column.key} scope="col" {...slotAttributes(stateMatrixHeadStyle, {})}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={row.key}>
            <th scope="row" {...slotAttributes(stateMatrixHeadStyle, {})}>
              {row.label}
            </th>
            {columns.map((column, c) => {
              const one = cells[r]?.[c];
              return (
                <td key={column.key} {...slotAttributes(stateMatrixCellStyle, {})}>
                  {one ? (
                    <span {...slotAttributes(stateMatrixStateStyle, {})}>
                      <StatusBadge tone={one.tone ?? "neutral"} label={one.label} />
                      {one.sub ? <span {...slotAttributes(stateMatrixSubStyle, {})}>{one.sub}</span> : null}
                    </span>
                  ) : (
                    <span {...slotAttributes(stateMatrixSubStyle, {})}>{emptyLabel}</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
