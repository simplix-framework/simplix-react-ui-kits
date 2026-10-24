import type { RecordValue } from "./record-value";

/** Where a column's value goes on a row drawn as a card. */
export type CardPlace = "badges" | "lines" | "hidden";

/** What a card draws below its title: the badges in one row, then the labelled values in a grid. */
export interface CardLayout<K> {
  readonly badges: readonly { readonly key: K; readonly value: RecordValue }[];
  readonly lines: readonly { readonly key: K; readonly header: string; readonly value: RecordValue }[];
}

const isEmpty = (value: RecordValue) => value === null || value === undefined || value === "";
const isBadge = (value: RecordValue) => typeof value === "object" && value !== null && ("badges" in value || ("badge" in value && !("text" in value)));

/**
 * Splits a row's values for its card. A value drawn as badges says what it is by itself, so it
 * joins one unlabelled row under the title; any other value keeps its label and takes a cell of a
 * two-column grid. An empty value is left out, so a card is as tall as what the row has. A column
 * may name its place instead.
 *
 * @param columns the columns after the title column, with each one's value for the row
 */
export function cardLayout<K>(
  columns: readonly { readonly key: K; readonly header: string; readonly value: RecordValue; readonly place?: CardPlace }[],
): CardLayout<K> {
  const badges: { key: K; value: RecordValue }[] = [];
  const lines: { key: K; header: string; value: RecordValue }[] = [];
  for (const column of columns) {
    if (column.place === "hidden" || isEmpty(column.value)) continue;
    const place = column.place ?? (isBadge(column.value) ? "badges" : "lines");
    if (place === "badges") badges.push({ key: column.key, value: column.value });
    else lines.push({ key: column.key, header: column.header, value: column.value });
  }
  return { badges, lines };
}
