import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { siteLegalTableCellStyle, siteLegalTableColumnStyle, siteLegalTableHeadStyle, siteLegalTableLabelStyle, siteLegalTableRowStyle, siteLegalTableStyle } from "./legal.style";

/** Props for {@link LegalTable}. */
export interface LegalTableProps {
  /** The table's name for a screen reader. */
  readonly label: string;
  /** Every column's name. */
  readonly head: readonly string[];
  /** The rows, one value per column; the first value names the row. */
  readonly rows: readonly (readonly ReactNode[])[];
}

/** A table on a document page; below the narrow tier each row becomes a card whose values carry their column's name. */
export function LegalTable({ label, head, rows }: LegalTableProps) {
  return (
    <div {...slotAttributes(siteLegalTableStyle, {})} role="table" aria-label={label}>
      <div {...slotAttributes(siteLegalTableHeadStyle, {})} role="row">
        {head.map((column) => (
          <div key={column} {...slotAttributes(siteLegalTableColumnStyle, {})} role="columnheader">
            {column}
          </div>
        ))}
      </div>
      {rows.map((row, rowIndex) => (
        // Rows of a fixed table; their order is their identity.
        <div key={`r-${String(rowIndex)}`} {...slotAttributes(siteLegalTableRowStyle, {})} role="row">
          {row.map((cell, cellIndex) => (
            <div key={head[cellIndex] ?? `c-${String(cellIndex)}`} {...slotAttributes(siteLegalTableCellStyle, { lead: cellIndex === 0 })} role="cell">
              <span {...slotAttributes(siteLegalTableLabelStyle, {})}>{head[cellIndex]}</span>
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
