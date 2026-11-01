import type { TimeRangeCountQuery } from "../datetime/list-time-range";

/**
 * The time range's per-slice counts over a mockup screen's sample rows, as the screen's counts read
 * answers them: the window from `from` to `to` cut into `buckets` equal slices, each counting the
 * rows whose `field` falls in it.
 *
 * @param rows the sample rows, the current ones a `useMockRecords` holds
 * @param field the instant field the time range narrows
 */
export function mockCounts<Row>(rows: readonly Row[], field: string): (query: TimeRangeCountQuery) => Promise<number[]> {
  return (query) => {
    const from = Date.parse(query.from);
    const to = Date.parse(query.to);
    const counts = Array.from({ length: Math.max(query.buckets, 0) }, () => 0);
    const width = (to - from) / Math.max(query.buckets, 1);
    for (const row of rows) {
      const at = Date.parse(String((row as Record<string, unknown>)[field] ?? ""));
      if (Number.isNaN(at) || at < from || at >= to || width <= 0) continue;
      counts[Math.min(Math.floor((at - from) / width), counts.length - 1)] += 1;
    }
    return Promise.resolve(counts);
  };
}
