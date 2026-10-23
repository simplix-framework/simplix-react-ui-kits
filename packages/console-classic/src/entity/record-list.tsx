import type { ReactNode } from "react";
import { CrudList } from "@simplix-react/ui";

/** One column of a {@link RecordList}. */
export interface RecordColumn<Row> {
  /** What tells the column apart, among its siblings. */
  readonly key: string;
  /** The header, in the reader's language. */
  readonly header: string;
  /** The row field the cell shows when the column draws no cell of its own. */
  readonly field?: keyof Row & string;
  /** A fixed width in px; the column fills what is left when absent. */
  readonly width?: number;
  /** The width the table needs before this column is drawn; it is dropped from a narrow pane. */
  readonly minTableWidth?: number;
  /** The cell, for a value that is more than the field's text. */
  readonly cell?: (row: Row) => ReactNode;
}

/** Props for {@link RecordList}. */
export interface RecordListProps<Row> {
  readonly rows: readonly Row[];
  readonly columns: readonly RecordColumn<Row>[];
  /** The value that names a row, in the address and in the open panel. */
  readonly rowId: (row: Row) => string;
  /** The row whose record stands open beside the list. */
  readonly activeRowId?: string | null;
  readonly onRowClick?: (row: Row) => void;
  /** What sits over the table: a filter bar, a chip row, the count. */
  readonly toolbar?: ReactNode;
  readonly isLoading?: boolean;
}

/**
 * A list of records: the table a list page draws, from rows and column declarations.
 *
 * <p>The list part of {@link CrudPage}. A screen declares what each column shows and hands over the
 * rows; how a list looks, scrolls and narrows is the kit's.
 */
export function RecordList<Row>({ rows, columns, rowId, activeRowId, onRowClick, toolbar, isLoading }: RecordListProps<Row>) {
  return (
    <CrudList>
      {toolbar}
      <CrudList.Table<Row>
        data={[...rows]}
        rowId={rowId}
        activeRowId={activeRowId ?? null}
        onRowClick={onRowClick}
        isLoading={isLoading}
      >
        {columns.map((column) => (
          <CrudList.Column<Row>
            key={column.key}
            field={column.field}
            header={column.header}
            width={column.width}
            minTableWidth={column.minTableWidth}
          >
            {column.cell ? ({ row }) => column.cell?.(row) : undefined}
          </CrudList.Column>
        ))}
      </CrudList.Table>
    </CrudList>
  );
}
