import { useMemo } from "react";
import { useCrudList, type ListHook, type UseCrudListResult } from "@simplix-react/ui";

/**
 * The list state a mockup screen holds itself: its sample rows searched, filtered, sorted and paged
 * in memory, as `RecordList` would hold them, but in the screen's hands. A board frame passes it to
 * `RecordList` as `list` and its `filters` to the page (`tileFilters`, a notice's action, a
 * `ListTimeRange`), so a pressed figure, a chosen chip and the rows under them are one state, as
 * they are on the generated page.
 *
 * @param rows the sample rows, the current ones a `useMockRecords` holds
 * @param pageSize how many rows a page shows
 */
export function useMockList<Row>(rows: readonly Row[], pageSize = 20): UseCrudListResult<Row> {
  const useRows = useMemo<ListHook<Row>>(() => () => ({ data: [...rows], total: rows.length, isLoading: false, error: null }), [rows]);
  return useCrudList(useRows, { stateMode: "client", filterMode: "immediate", defaultPageSize: pageSize });
}
