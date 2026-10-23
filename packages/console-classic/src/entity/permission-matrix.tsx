import { CheckIcon } from "lucide-react";
import { Checkbox, EmptyValue, Flex, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@simplix-react/ui";

import { SizedHead } from "../layout/sized-head";
import { TableCard } from "../layout/table-card";

/** One cell: granted, not granted, or granted with a limit the cell names. */
export type PermissionCell = { readonly state: "on" } | { readonly state: "off" } | { readonly state: "limited"; readonly label: string };

/** Props for {@link PermissionMatrix}. */
export interface PermissionMatrixProps {
  /** What the rows are and what the columns are, in the corner. */
  readonly corner: string;
  readonly columns: readonly string[];
  readonly rows: readonly { readonly key: string; readonly label: string; readonly cells: readonly PermissionCell[] }[];
  /**
   * Makes every cell a checkbox: pressing one hands back the row and the column. A limited cell
   * stays checked and keeps its condition beside the box until it is turned off.
   */
  readonly onToggle?: (rowKey: string, column: number) => void;
}

/**
 * What a role may do, by area and action: a mark where it may, nothing where it may not, and the
 * limit named where it may only in part.
 */
export function PermissionMatrix({ corner, columns, rows, onToggle }: PermissionMatrixProps) {
  return (
    <TableCard>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{corner}</TableHead>
            {columns.map((column) => (
              <SizedHead key={column} width={96}>
                {column}
              </SizedHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key}>
              <TableCell>{row.label}</TableCell>
              {row.cells.map((cell, index) => (
                <TableCell key={`${row.key}-${columns[index]}`}>
                  {onToggle ? (
                    <Flex align="center" gap="xs">
                      <Checkbox
                        checked={cell.state !== "off"}
                        onCheckedChange={() => onToggle(row.key, index)}
                        aria-label={`${row.label} ${columns[index]}`}
                      />
                      {cell.state === "limited" ? <StatusBadge tone="warning" label={cell.label} /> : null}
                    </Flex>
                  ) : cell.state === "on" ? (
                    <CheckIcon className="size-4 text-success" aria-label={columns[index]} />
                  ) : cell.state === "limited" ? (
                    <StatusBadge tone="warning" label={cell.label} />
                  ) : (
                    <EmptyValue />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableCard>
  );
}
