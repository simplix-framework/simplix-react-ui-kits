import { useCallback, useMemo, useState } from "react";
import { addToast } from "@simplix-react/ui";

/** A collection of sample records a mockup screen reads and changes as the product's API would. */
export interface MockRecords<Row> {
  readonly rows: readonly Row[];
  /** The record with this id, or undefined once it is gone. */
  readonly find: (id: string) => Row | undefined;
  /** Adds a record at the end and returns it. */
  readonly add: (row: Row) => Row;
  /** Merges the changed fields into the record with this id. */
  readonly update: (id: string, patch: Partial<Row>) => void;
  readonly remove: (id: string) => void;
}

/**
 * Sample records held for as long as the story is open, so adding, editing and removing on a
 * mockup screen changes what its list, its figures and its record show.
 *
 * @param initial the fixture rows the screen opens with
 * @param idOf the value that names a row
 */
export function useMockRecords<Row>(initial: readonly Row[], idOf: (row: Row) => string): MockRecords<Row> {
  const [rows, setRows] = useState<readonly Row[]>(initial);
  const find = useCallback((id: string) => rows.find((row) => idOf(row) === id), [rows, idOf]);
  const add = useCallback((row: Row) => {
    setRows((current) => [...current, row]);
    return row;
  }, []);
  const update = useCallback(
    (id: string, patch: Partial<Row>) => setRows((current) => current.map((row) => (idOf(row) === id ? { ...row, ...patch } : row))),
    [idOf],
  );
  const remove = useCallback((id: string) => setRows((current) => current.filter((row) => idOf(row) !== id)), [idOf]);
  return useMemo(() => ({ rows, find, add, update, remove }), [rows, find, add, update, remove]);
}

/** A new record id that no fixture row carries. */
export function mockId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Tells the reader an action finished, as the console's toast does after a request succeeds. */
export function announce(message: string, tone: "success" | "info" | "warning" = "success"): void {
  addToast({ type: tone, message });
}

/**
 * Saves rows as a CSV file the browser downloads, as an export button does.
 *
 * @param name the file name, without the extension
 * @param header the column headers
 * @param rows the cells, one array per row
 */
export function downloadCsv(name: string, header: readonly string[], rows: readonly (readonly string[])[]): void {
  const quote = (cell: string) => (/[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell);
  // The byte-order mark makes a spreadsheet read the Korean as UTF-8.
  const text = "\uFEFF" + [header, ...rows].map((row) => row.map(quote).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
