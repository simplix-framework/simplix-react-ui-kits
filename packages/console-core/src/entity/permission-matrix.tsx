import { CheckIcon } from "lucide-react";
import { Checkbox, EmptyValue, Flex, StatusBadge, Text, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@simplix-react/ui";

import { SizedHead } from "../layout/sized-head";
import { TableCard } from "../layout/table-card";
import { permissionCheckStyle } from "./permission-matrix.style";
import { slotAttributes } from "@simplix-react/ui/design";

/**
 * One cell: granted, not granted, granted with a limit the cell names, or `none`: a cell that
 * cannot be granted at all (nothing behind it carries the action), drawn as its `mark` and never
 * offered as a checkbox, so an edit cannot ask for what the server has no row to hold.
 */
export type PermissionCell =
  | { readonly state: "on" }
  | { readonly state: "off" }
  | { readonly state: "limited"; readonly label: string }
  | { readonly state: "none"; readonly mark: string; readonly label?: string };

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
      {/* No cell wraps: a matrix too wide for its card scrolls sideways inside it rather than
          breaking a header or an area name one character per line. */}
      <Table className="min-w-max">
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
                  {cell.state === "none" ? (
                    <Text as="span" size="sm" tone="muted" aria-label={cell.label}>
                      {cell.mark}
                    </Text>
                  ) : onToggle ? (
                    <Flex align="center" gap="xs">
                      <Checkbox
                        checked={cell.state !== "off"}
                        onCheckedChange={() => onToggle(row.key, index)}
                        aria-label={`${row.label} ${columns[index]}`}
                      />
                      {cell.state === "limited" ? <StatusBadge tone="warning" label={cell.label} /> : null}
                    </Flex>
                  ) : cell.state === "on" ? (
                    <CheckIcon className="size-4" aria-label={columns[index]} {...slotAttributes(permissionCheckStyle, {})} />
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
