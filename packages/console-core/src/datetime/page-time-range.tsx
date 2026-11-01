import { useCallback, useRef } from "react";
import type { CrudListFilters } from "@simplix-react/ui";

import { ListTimeRange, useTimeWindowPresets, type TimeRangeCountQuery } from "./list-time-range";

/**
 * A page's time range region, stated as data: the template draws it over the list's filters, and a
 * screen switches it on by naming the field its rows are read by in time.
 */
export interface PageTimeRangeSlot {
  /** The searchable field the window narrows. */
  readonly field: string;
  /** The windows on offer, by key (`1h`, `1d`, `7d`, `1mo`, `quarter`); left out, the framework's own. */
  readonly presets?: readonly string[];
  /** Which window the strip opens on. @defaultValue "1d" */
  readonly defaultWindow?: string;
  /**
   * Counts per slice under the list's other conditions, from an endpoint that buckets them. Left
   * out, the strip selects a window without drawing how busy each slice was.
   */
  readonly counts?: (query: TimeRangeCountQuery) => Promise<number[]>;
}

const NO_COUNTS = (): Promise<number[]> => Promise.resolve([]);

/** Draws a {@link PageTimeRangeSlot} over the list it narrows. Templates draw it; screens never do. */
export function PageTimeRange({ filters, slot }: { readonly filters: CrudListFilters; readonly slot: PageTimeRangeSlot }) {
  const named = useTimeWindowPresets(slot.presets ?? []);
  // A blocks file states `counts` inline, so it is a new function on every render; the strip
  // refetches when its fetcher changes, so it gets one stable fetcher that calls the latest.
  const latest = useRef(slot.counts);
  latest.current = slot.counts;
  const counted = slot.counts !== undefined;
  const fetchCounts = useCallback((query: TimeRangeCountQuery) => (latest.current ?? NO_COUNTS)(query), []);
  return (
    <ListTimeRange
      filters={filters}
      field={slot.field}
      fetchCounts={counted ? fetchCounts : NO_COUNTS}
      presets={slot.presets ? named : undefined}
      defaultWindow={slot.defaultWindow}
    />
  );
}
