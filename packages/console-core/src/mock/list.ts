import { useMemo } from "react";
import { matchesFilter } from "@simplix-react/headless";
import { useCrudList, type CrudListFilters, type ListHook, type UseCrudListResult } from "@simplix-react/ui";

/** A mock list: the list state plus every sample row the state's conditions leave in, across all pages. */
export type MockList<Row> = UseCrudListResult<Row> & {
  /** The rows the committed filters and the search text leave in, before paging. */
  readonly matched: readonly Row[];
};

/**
 * The sample rows a list's committed filters and search text leave in, as the in-memory list holds
 * them: the same test the list applies (`matchesFilter` per committed key, the search text
 * contained in any text value), before sorting and paging.
 *
 * @param rows the sample rows
 * @param filters the list's filter state
 */
export function matchMockRows<Row>(rows: readonly Row[], filters: Pick<CrudListFilters, "committedValues" | "search">): Row[] {
  const text = filters.search.toLowerCase();
  return rows.filter((row) => {
    const record = row as Record<string, unknown>;
    if (text !== "" && !Object.values(record).some((value) => typeof value === "string" && value.toLowerCase().includes(text))) return false;
    return Object.entries(filters.committedValues).every(([key, value]) => matchesFilter(record, key, value));
  });
}

/**
 * The list state a mockup screen holds itself: its sample rows searched, filtered, sorted and paged
 * in memory, as `RecordList` would hold them, but in the screen's hands. A board frame passes it to
 * `RecordList` as `list` and its `filters` to the page (`tileFilters`, a notice's action, a
 * `ListTimeRange`), so a pressed figure, a chosen chip and the rows under them are one state, as
 * they are on the generated page. Its `matched` rows are what a frame's sums are taken over, so a
 * sum follows the filters as the generated page's aggregates read does.
 *
 * @param rows the sample rows, the current ones a `useMockRecords` holds
 * @param pageSize how many rows a page shows
 */
export function useMockList<Row>(rows: readonly Row[], pageSize = 20): MockList<Row> {
  const useRows = useMemo<ListHook<Row>>(() => () => ({ data: [...rows], total: rows.length, isLoading: false, error: null }), [rows]);
  const list = useCrudList(useRows, { stateMode: "client", filterMode: "immediate", defaultPageSize: pageSize });
  const { search, committedValues } = list.filters;
  const matched = useMemo(() => matchMockRows(rows, { search, committedValues }), [rows, search, committedValues]);
  return { ...list, matched };
}
