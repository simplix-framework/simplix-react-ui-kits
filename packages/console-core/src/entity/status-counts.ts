import { useMemo } from "react";

import { enumValueOf } from "./record-contract";
import type { StatusTone } from "@simplix-react/ui";

import type { FilterSettingsTile } from "../layout/settings-tiles";

/** How {@link statusCounts} reads the rows a `GET <base>/status-counts` read answers with. */
export interface StatusCountsOptions {
  /**
   * The row field holding the counted value: `value` in the generic `[{ value, count }]` shape, or
   * the enum's own field name (`status`) where the endpoint names it so. Defaults to `value`.
   */
  readonly field?: string;
  /**
   * Every value the enum declares, so a value no row counts reads as 0 rather than as absent: a
   * chip or a card for a state with no rows says 「0」, never nothing.
   */
  readonly options?: readonly string[];
}

/**
 * The counts a status-counts read answered with, by value, with every declared value present.
 *
 * <p>The value may arrive as the enum's constant or as the server's enum object; both resolve to
 * the constant. A row whose value resolves to nothing is left out, and a count that is not a
 * number reads as 0.
 *
 * @param rows what the read answered with, or anything else while it has not answered
 * @param options which field holds the value, and the values to fill with 0
 * @returns the count of each value
 */
export function statusCounts(rows: unknown, options: StatusCountsOptions = {}): Readonly<Record<string, number>> {
  const field = options.field ?? "value";
  const counts: Record<string, number> = {};
  for (const value of options.options ?? []) counts[value] = 0;
  if (!Array.isArray(rows)) return counts;
  for (const row of rows) {
    if (row === null || typeof row !== "object") continue;
    const record = row as Readonly<Record<string, unknown>>;
    const value = enumValueOf(record[field]);
    if (!value) continue;
    const count = Number(record.count ?? 0);
    counts[value] = (counts[value] ?? 0) + (Number.isFinite(count) ? count : 0);
  }
  return counts;
}

/**
 * The counts of a status-counts read, for a chip row ({@link RecordListProps.chips}'s `counts`)
 * and a card strip.
 *
 * <p>Takes the generated query's result rather than reading itself: the kit has no fetch layer, and
 * the generated hook's key sits under the entity's path, so the invalidation that refreshes the
 * list after a write refreshes these counts with it. `undefined` while the read has not answered,
 * so a caller can tell 「not counted yet」 from 「counted, zero」.
 *
 * @param query the generated status-counts hook's result
 * @param options which field holds the value, and the values to fill with 0
 * @returns the count of each value, or `undefined` before the first answer
 */
export function useStatusCounts(
  query: { readonly data?: unknown },
  options: StatusCountsOptions = {},
): Readonly<Record<string, number>> | undefined {
  const { data } = query;
  const field = options.field;
  const declared = options.options?.join("\u0000");
  return useMemo(
    () => (data === undefined ? undefined : statusCounts(data, { field, options: declared ? declared.split("\u0000") : [] })),
    [data, field, declared],
  );
}

/** What {@link statusTiles} draws one figure tile per value from. */
export interface StatusTilesInput {
  /** The field's name as the filter bar labels it, where the list offers no filter of its own on it. */
  readonly fieldLabel?: string;
  /** The field the counts are by, which is the filter each tile writes. */
  readonly field: string;
  /** The values to draw a tile for, in order; every value the enum declares, or the ones a screen leads with. */
  readonly values: readonly string[];
  /** The counts by value, `undefined` while the read has not answered. */
  readonly counts: Readonly<Record<string, number>> | undefined;
  /** The value's label, the enum's translated one. */
  readonly label: (value: string) => string;
  /**
   * The tone of a value's tile: `danger` only for a set the reader must act on now (frontend
   * invariant #48). A tile counting 0 is drawn without it.
   */
  readonly tones?: Readonly<Record<string, StatusTone>>;
  /** What each figure counts, under it. */
  readonly basis?: (value: string) => string | undefined;
}

/**
 * One figure tile per value for the page's figure row (`spec.tiles`), each counting its rows and
 * narrowing the list under it to them on a press, as its chip does.
 *
 * @param input the field, the values, the counts and how each value is named and toned
 */
export function statusTiles(input: StatusTilesInput): FilterSettingsTile[] {
  return input.values.map((value) => {
    const count = input.counts === undefined ? undefined : (input.counts[value] ?? 0);
    const tone = count ? input.tones?.[value] : undefined;
    const basis = input.basis?.(value);
    return {
      key: value,
      label: input.label(value),
      value: count,
      counted: true as const,
      ...(tone ? { tone } : {}),
      ...(basis ? { basis } : {}),
      filter: { field: input.field, value, ...(input.fieldLabel ? { fieldLabel: input.fieldLabel } : {}) },
    };
  });
}

/** The figures an aggregates read computes over a list's rows: `[{ field, op, value }]`. */
export type AggregateOp = "sum" | "count" | "countDistinct" | "min" | "max";

/**
 * One figure of an aggregates read, or `undefined` where the read has not answered or holds no
 * such figure. A sum or a count of no rows is 0; a min or a max of no rows is `undefined`.
 *
 * @param rows what the read answered with
 * @param field the entity field the figure is over
 * @param op how it is computed
 */
export function aggregateValue(rows: unknown, field: string, op: AggregateOp): number | undefined {
  if (!Array.isArray(rows)) return undefined;
  for (const row of rows) {
    if (row === null || typeof row !== "object") continue;
    const record = row as Readonly<Record<string, unknown>>;
    if (record.field !== field || record.op !== op) continue;
    if (record.value === null || record.value === undefined) return op === "sum" || op === "count" || op === "countDistinct" ? 0 : undefined;
    const value = Number(record.value);
    return Number.isFinite(value) ? value : undefined;
  }
  return undefined;
}
