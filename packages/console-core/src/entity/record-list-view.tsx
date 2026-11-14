import type { ReactNode } from "react";
import { type CrudListViewMode, type FilterDef, SearchOperator, type UseCrudListResult } from "@simplix-react/ui";

import { DEFAULT_TEXT_FILTER_OPERATORS, NUMBER_FILTER_OPERATORS } from "./filter-operators";
import { FLUID_COLUMN_MIN } from "./column-priority";
import type { RecordColumn, RecordFilter, RecordPresentation } from "./record-list-types";
import { type RecordValue, RecordValueView } from "./record-value";

/**
 * The positions a drag writes: the order values the rows held, handed out again in the new
 * sequence, so rows on other pages keep their places and only the dragged rows' values move.
 */
export function orderUpdates<Row>(before: readonly Row[], after: readonly Row[], idField: keyof Row & string, orderField: keyof Row & string): Readonly<Record<string, unknown>>[] {
  const values = before
    .map((row, index) => {
      const value = Number((row as Record<string, unknown>)[orderField]);
      return Number.isFinite(value) ? value : index;
    })
    .sort((a, b) => a - b);
  // Equal values would leave the dragged rows tied; spread them so the sequence is strict.
  for (let at = 1; at < values.length; at += 1) {
    if (values[at]! <= values[at - 1]!) values[at] = values[at - 1]! + 1;
  }
  return after.flatMap((row, index) => {
    const id = (row as Record<string, unknown>)[idField];
    const was = (before.find((one) => (one as Record<string, unknown>)[idField] === id) as Record<string, unknown> | undefined)?.[orderField];
    return values[index] === Number(was) ? [] : [{ [idField]: id, [orderField]: values[index] }];
  });
}

/**
 * The column a card is titled by and the columns that fill the card under it.
 *
 * @param columns the list's columns in their declared order
 * @param cardTitle the key of the title column; absent, the first column titles the card
 * @throws Error when `cardTitle` names no column of the list
 */
export function splitCardColumns<Row>(
  columns: readonly RecordColumn<Row>[],
  cardTitle?: string,
): { readonly title: RecordColumn<Row> | undefined; readonly lines: readonly RecordColumn<Row>[] } {
  if (cardTitle === undefined) return { title: columns[0], lines: columns.slice(1) };
  const title = columns.find((column) => column.key === cardTitle);
  if (!title) throw new Error(`RecordList cardTitle "${cardTitle}" names no column; the columns are ${columns.map((column) => column.key).join(", ")}`);
  return { title, lines: columns.filter((column) => column !== title) };
}

/**
 * Whether a list offers the reader the switch between the table and the cards. A list drawn as cards
 * always does; a table list does when its design asked for it.
 *
 * @param presentation what the screen decided the rows are drawn as
 * @param viewToggle the switch the screen asked for
 */
export function offersViewSwitch(presentation: RecordPresentation, viewToggle: boolean): boolean {
  return presentation === "cards" || viewToggle;
}

/**
 * The key a list's view is remembered under when the screen names none: a short hash of the column
 * keys in order. A column key is a code constant, so the key is the same on every visit and differs
 * between lists that show different columns.
 *
 * @param columns the list's columns
 */
export function derivedViewKey(columns: readonly { readonly key: string }[]): string {
  let hash = 0x811c9dc5;
  for (const char of columns.map((column) => column.key).join("\u001f")) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `columns-${hash.toString(16).padStart(8, "0")}`;
}

/**
 * The view a list opens in. The presentation names it, and the reader's saved view replaces it only
 * where the list offers the switch: a list without one draws its presentation and nothing else.
 *
 * @param presentation what the screen decided the rows are drawn as
 * @param viewToggle whether the list offers the reader a switch
 * @param saved the view the reader last chose for this list, if any
 */
export function openingView(presentation: RecordPresentation, viewToggle: boolean, saved: CrudListViewMode | undefined): CrudListViewMode {
  if (viewToggle && saved !== undefined) return saved;
  return presentation === "cards" ? "grid" : "list";
}

/**
 * The width a table needs to hold every column it always draws, which is where a row stops fitting
 * on one line and a card reads better.
 */
export function tableWidth<Row>(columns: readonly RecordColumn<Row>[], actionCell: number): number {
  const drawn = columns.filter((column) => column.minTableWidth === undefined);
  const cells = drawn.reduce((sum, column) => sum + (column.width ?? column.minWidth ?? FLUID_COLUMN_MIN), 0);
  return cells + actionCell;
}

/** A column's value for one row as a {@link RecordValue}, for the card, which places it by its shape. */
export function valueOf<Row>(column: RecordColumn<Row>, row: Row): RecordValue {
  if (column.value) return column.value(row);
  if (!column.field) return null;
  const raw = (row as Record<string, unknown>)[column.field];
  return raw === undefined || raw === null ? null : String(raw);
}

/** What a column shows for one row: its own value, or the field's text. */
export function cellOf<Row>(column: RecordColumn<Row>, row: Row): ReactNode {
  if (column.value) return <RecordValueView value={column.value(row)} />;
  if (!column.field) return null;
  const raw = (row as Record<string, unknown>)[column.field];
  return raw === undefined || raw === null ? null : String(raw);
}

/**
 * A cell inside a table column. A fluid column's content fills the cell so its spare width shows;
 * a wrapping one breaks onto more lines, any other ellipsizes at the column's edge.
 */
export function cellIn<Row>(column: RecordColumn<Row>, row: Row): ReactNode {
  if (column.wrap) return <div className="whitespace-normal break-words">{cellOf(column, row)}</div>;
  if (column.minWidth !== undefined) return <div className="block truncate-halo">{cellOf(column, row)}</div>;
  return cellOf(column, row);
}

export function filterDef<Row>(filter: RecordFilter<Row>): FilterDef {
  if (filter.kind === "entity") {
    return {
      type: "faceted",
      field: filter.field,
      label: filter.label,
      options: filter.facet.options,
      multiSelect: true,
      display: "dropdown",
      onSearch: filter.facet.onSearch,
      loading: filter.facet.loading,
      selectedOptions: filter.facet.selectedOptions,
    };
  }
  if (filter.kind === "choice") {
    return { type: "faceted", field: filter.field, label: filter.label, options: [...filter.options], multiSelect: true };
  }
  if (filter.kind === "dateRange") {
    return { type: "dateRange", field: filter.field, label: filter.label, dateOnly: filter.dateOnly ?? true };
  }
  if (filter.kind === "toggle") {
    return { type: "toggle", field: filter.field, label: filter.label };
  }
  if (filter.kind === "number") {
    return {
      type: "number",
      field: filter.field,
      label: filter.label,
      operators: [...NUMBER_FILTER_OPERATORS],
      defaultOperator: SearchOperator.EQUALS,
    } as FilterDef;
  }
  const operators = filter.operators && filter.operators.length > 0 ? [...filter.operators] : [...DEFAULT_TEXT_FILTER_OPERATORS];
  return {
    type: "text",
    field: filter.field,
    label: filter.label,
    operators,
    defaultOperator: operators[0],
  };
}

/**
 * Whether a search or a filter narrows the rows. In memory that is fewer rows than given; on a server
 * list, whose unfiltered total is unknown, it is any search text or filter value.
 */
export function isNarrowed(list: Pick<UseCrudListResult<unknown>, "filters" | "pagination">, given: number, server: boolean): boolean {
  if (!server) return list.pagination.total < given;
  if (list.filters.search.trim() !== "") return true;
  return Object.values(list.filters.committedValues).some((value) => value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0));
}

/**
 * The chip options with each option's count after its label, where the chips carry counts.
 *
 * @param chips the chip row
 * @param format how a label and its count are joined, in the reader's language
 * @returns the options the chip row draws
 */
export function countedChips(
  chips: { readonly options: readonly { readonly value: string; readonly label: string }[]; readonly counts?: Readonly<Record<string, number>> },
  format: (label: string, count: number) => string,
): { value: string; label: string }[] {
  const { counts } = chips;
  return chips.options.map((option) => {
    const count = counts?.[option.value];
    return { value: option.value, label: count === undefined ? option.label : format(option.label, count) };
  });
}
