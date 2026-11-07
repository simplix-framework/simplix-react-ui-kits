import { useTranslation } from "@simplix-react/i18n/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text } from "@simplix-react/ui";

import { SizedHead } from "../layout/sized-head";
import { TableCard } from "../layout/table-card";

/** One column of a {@link HelpTable}: its heading's catalog key and, for a short value, its width. */
export interface HelpTableColumn {
  /** The heading's key in the table's catalog namespace. */
  readonly title: string;
  /** The column's width in pixels; absent, the column takes the spare width. */
  readonly width?: number;
}

/** One row of a {@link HelpTable}: a stable key and one catalog key per column, in column order. */
export interface HelpTableRow {
  readonly key: string;
  readonly cells: readonly string[];
}

/** Props for {@link HelpTable}. */
export interface HelpTableProps {
  /** The catalog namespace every key below is read from. */
  readonly namespace: string;
  readonly columns: readonly HelpTableColumn[];
  /** The rows in reading order; a bounded set, so the table has no pager. */
  readonly rows: readonly HelpTableRow[];
  /** A muted line under the table, by its catalog key. */
  readonly caption?: string;
}

/**
 * A reference table inside a help card's explanation: headings and cells read from catalog keys,
 * drawn as the kit's bordered table card, with an optional caption under it. A help card that
 * explains a set of states or kinds composes this instead of building the table by hand.
 */
export function HelpTable({ namespace, columns, rows, caption }: HelpTableProps) {
  const { t } = useTranslation(namespace);
  return (
    <>
      <TableCard>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) =>
                column.width === undefined ? <TableHead key={column.title}>{t(column.title)}</TableHead> : <SizedHead key={column.title} width={column.width}>{t(column.title)}</SizedHead>,
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                {columns.map((column, index) => (
                  <TableCell key={column.title}>{row.cells[index] === undefined ? null : t(row.cells[index] as string)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableCard>
      {caption ? (
        <Text size="caption" tone="muted">
          {t(caption)}
        </Text>
      ) : null}
    </>
  );
}
