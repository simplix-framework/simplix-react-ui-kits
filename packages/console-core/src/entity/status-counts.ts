import { useMemo } from "react";

import { enumValueOf } from "./record-contract";

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
