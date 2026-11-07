import type { ReactNode } from "react";
import {
  CrudList,
  type ActionVariant,
  type FilterDef,
  type RowActionDef,
  type UseCrudListResult,
} from "@simplix-react/ui";

import { filteredEmptySlots } from "../entity/filtered-empty-slots";
import { listTotal } from "../entity/list-total";

/** Props for {@link PanelList}. */
export interface PanelListProps<T> {
  /** The list controller — `useCrudList` over the parent-bound hook. */
  readonly list: UseCrudListResult<T>;
  /** The narrowing this list offers. At least the axis the reader searches by. */
  readonly filters: FilterDef[];
  /** `CrudList.Column` elements. */
  readonly children: ReactNode;
  /** The key the reader's column widths are remembered under. */
  readonly resizableColumns?: string;
  /** What the tab draws when the collection is genuinely empty. */
  readonly emptyState: {
    readonly icon?: ReactNode;
    readonly title: string;
    readonly description?: string;
  };
  /** Row actions, where the tab offers any. */
  readonly actions?: RowActionDef<T>[];
  /** How those actions are drawn. */
  readonly actionVariant?: ActionVariant;
  /** What pressing a row does. */
  readonly onRowClick?: (row: T) => void;
  /** Which row is drawn as the open one. */
  readonly activeRowId?: string | null;
  /** Whatever else belongs on the toolbar row — a 「추가」 button, a note. */
  readonly toolbar?: ReactNode;
  /**
   * The element whose width decides which columns are drawn, for a caller that has to know.
   *
   * <p>`CrudList` drops a column by `minTableWidth` on its own, and a value in a dropped column is
   * gone unless the row carries it somewhere else — so a caller rendering that fallback has to
   * measure the same element the table measures. `useWideList` gives the ref and the verdict; this
   * is where the ref lands.
   */
  readonly rootRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * A growing collection inside a detail panel or a tab, drawn as the list it is.
 *
 * <p><b>Two shapes exist and one question picks between them</b> (frontend invariant #71): does
 * the set grow? A catalogue that will never have more rows than it has today — the four sharing
 * modes, the eleven states a record moves through — is a bordered card with no pager. Everything
 * else is a list: a history, the accounts holding a role, the sessions on an account, the grants
 * on a range. A reader who can page through those on a list screen expects to page through them
 * here, and expects the three things that come with paging — the total, a way to search, a way to
 * sort.
 *
 * <p><b>What this replaces is a pager and nothing else.</b> `CrudDetail.List` and
 * `CrudDetail.Table` hand a growing collection its pages and stop there, so a reader looking at
 * 「전체 240건」 has no way to find one of them: no search box, no sortable header, no filter. The
 * pager under such a table is the proof that the set grows, which is exactly why the rest has to
 * be there.
 *
 * <p><b>Bind the list to the parent with a forced request parameter</b> — `adaptForcedList` — and
 * never with `transformFilters`. The list state machine only puts a `filters` object into the
 * request once the reader has committed one, so a parent id passed that way narrows nothing on
 * first view: the whole register comes back, the tab's count and its rows disagree, and nothing
 * errors.
 *
 * <p>The pager is withheld when the collection is empty, for the reason the list screens use it:
 * a pager under an empty state reads as a list that failed to load rather than as one with
 * nothing in it.
 *
 * @typeParam T the row type
 * @param props the list, its narrowing, its columns and its empty state
 * @returns the tab's list
 */
export function PanelList<T>({
  list,
  rootRef,
  filters,
  children,
  resizableColumns,
  emptyState,
  actions,
  actionVariant,
  onRowClick,
  activeRowId,
  toolbar,
}: PanelListProps<T>) {
  return (
    <CrudList ref={rootRef}>
      <CrudList.FilterBar
        maxBadges={3}
        count={listTotal(list)}
        countLoading={listTotal(list) === undefined}
        filters={filters}
        state={list.filters}
        trailing={toolbar}
      />

      <CrudList.Table
        resizableColumns={resizableColumns}
        data={list.data}
        isLoading={list.isLoading}
        emptyReason={list.emptyReason}
        emptyState={emptyState}
        // A list narrowed to nothing is not an empty collection, and the two read identically
        // unless the reader is told which one they are looking at.
        slots={filteredEmptySlots({
          emptyReason: list.emptyReason,
          icon: emptyState.icon,
          filterCount: Object.keys(list.filters.committedValues).length,
          onClear: list.filters.clear,
        })}
        density="compact"
        // The header a column declares `sortable` on is a button, and a button that cannot
        // reorder the rows is worse than a header that never offered to: the reader presses it,
        // nothing moves, and the list reads as broken rather than as unsorted. Sorting is one of
        // the four things invariant #71 says a growing collection carries, so the compound that
        // exists to satisfy that invariant wires it rather than leaving it to each tab.
        sort={list.sort.field ? { field: list.sort.field, direction: list.sort.direction } : null}
        onSortChange={(next) => list.sort.setSort(next.field, next.direction)}
        actions={actions}
        actionVariant={actionVariant}
        onRowClick={onRowClick}
        activeRowId={activeRowId}
      >
        {children}
      </CrudList.Table>

      {list.emptyReason !== "no-data" && (
        <CrudList.Pagination
          page={list.pagination.page}
          pageSize={list.pagination.pageSize}
          total={listTotal(list)}
          totalPages={list.pagination.totalPages}
          onPageChange={list.pagination.setPage}
          onPageSizeChange={list.pagination.setPageSize}
        />
      )}
    </CrudList>
  );
}
