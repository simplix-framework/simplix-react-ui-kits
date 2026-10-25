import type { RecordValue } from "./record-value";

/** Where a column's value goes on a row drawn as a card. */
export type CardPlace = "badges" | "lines" | "hidden";

/** What a card draws below its title: the badges in one row, then the labelled values in a grid. */
export interface CardLayout<K> {
  readonly badges: readonly { readonly key: K; readonly value: RecordValue }[];
  readonly lines: readonly { readonly key: K; readonly header: string; readonly value: RecordValue; readonly wide: boolean }[];
}

/** Characters past which a labelled value takes the card's full width rather than a grid cell. */
export const CARD_WIDE_TEXT = 14;

/** The text a value shows, for judging its length. */
export const textOf = (value: RecordValue): string =>
  typeof value === "string" || typeof value === "number" ? String(value) : value && typeof value === "object" && "link" in value ? value.link : value && typeof value === "object" && "text" in value ? value.text : "";

/** Whether a value draws nothing. */
export const isEmpty = (value: RecordValue) => value === null || value === undefined || value === "";
/** Whether a value draws as badges, which say what they are without a label. */
export const isBadge = (value: RecordValue) => typeof value === "object" && value !== null && ("badges" in value || ("badge" in value && !("text" in value)));

/**
 * Splits a row's values for its card. A value drawn as badges says what it is by itself, so it
 * joins one unlabelled row under the title; any other value keeps its label and takes a cell of a
 * two-column grid, or the grid's full width when its text would wrap in a cell. An empty value
 * is left out, so a card is as tall as what the row has, unless its column is kept (`keep`, a
 * column some other card fills): then it holds its cell empty, so every label stands in the same
 * cell down the list. A column may name its place instead.
 *
 * <p>A column that says whether it is wide keeps that width on every card, so the same label
 * stands in the same cell down the list whatever one row's value measures ({@link wideColumns}).
 *
 * @param columns the columns after the title column, with each one's value for the row
 */
export function cardLayout<K>(
  columns: readonly { readonly key: K; readonly header: string; readonly value: RecordValue; readonly place?: CardPlace; readonly wide?: boolean; readonly keep?: boolean }[],
): CardLayout<K> {
  const badges: { key: K; value: RecordValue }[] = [];
  const lines: { key: K; header: string; value: RecordValue; wide: boolean }[] = [];
  for (const column of columns) {
    if (column.place === "hidden") continue;
    if (isEmpty(column.value)) {
      if (column.keep && (column.place ?? "lines") === "lines") lines.push({ key: column.key, header: column.header, value: null, wide: column.wide ?? false });
      continue;
    }
    const place = column.place ?? (isBadge(column.value) ? "badges" : "lines");
    if (place === "badges") badges.push({ key: column.key, value: column.value });
    else lines.push({ key: column.key, header: column.header, value: column.value, wide: column.wide ?? textOf(column.value).length > CARD_WIDE_TEXT });
  }
  return { badges, lines };
}

/**
 * The columns whose value is too long for a grid cell on any of the rows, so a list's cards give
 * those columns the full width on every card rather than only on the rows where they run long.
 *
 * @param keys the columns after the title column
 * @param rows the rows the cards draw
 * @param value each row's value for a column
 */
export function wideColumns<K, Row>(keys: readonly K[], rows: readonly Row[], value: (key: K, row: Row) => RecordValue): ReadonlySet<K> {
  return new Set(keys.filter((key) => rows.some((row) => textOf(value(key, row)).length > CARD_WIDE_TEXT)));
}

/** Characters up to which every labelled value of a list counts as short enough to sit in one line. */
export const CARD_PACKED_TEXT = 12;
/** Labelled values past which a card keeps its grid even when each is short. */
export const CARD_PACKED_LINES = 3;

/**
 * Whether a list's cards set their labelled values in one line packed from the left (「개정 4 ·
 * 게시일 2026-10-14」) rather than in the two-column grid, whose cells would carry two short values
 * to the card's two ends. Decided over the page's rows, as {@link wideColumns} is, so every card of
 * the list is set the same way.
 *
 * @param keys the columns drawn as labelled values
 * @param rows the rows the cards draw
 * @param value each row's value for a column
 */
export function packedLines<K, Row>(keys: readonly K[], rows: readonly Row[], value: (key: K, row: Row) => RecordValue): boolean {
  if (keys.length === 0 || keys.length > CARD_PACKED_LINES) return false;
  return rows.every((row) => keys.every((key) => textOf(value(key, row)).length <= CARD_PACKED_TEXT));
}

/**
 * The labelled columns some card of the page fills, so every card keeps their cells even where its
 * own value is empty, and a label never moves from one card to the next.
 *
 * @param keys the columns after the title column
 * @param rows the rows the cards draw
 * @param value each row's value for a column
 * @param badgesInLines whether the cards draw badge values as labelled lines too (a list inside a record)
 */
export function keptColumns<K, Row>(keys: readonly K[], rows: readonly Row[], value: (key: K, row: Row) => RecordValue, badgesInLines = false): ReadonlySet<K> {
  // A column of badges joins the unlabelled badge row, which keeps no cells, unless the card draws every value labelled.
  return new Set(keys.filter((key) => rows.some((row) => { const v = value(key, row); return !isEmpty(v) && (badgesInLines || !isBadge(v)); })));
}
