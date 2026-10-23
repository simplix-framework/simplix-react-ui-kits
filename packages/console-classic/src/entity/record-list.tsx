import { useMemo, type ReactNode } from "react";
import {
  CrudList,
  Flex,
  ListTotalBadge,
  SearchOperator,
  useCrudList,
  type ActionType,
  type FilterDef,
  type ListHook,
  type RowActionDef,
} from "@simplix-react/ui";

import { RecordValueView, type RecordValue } from "./record-value";

/** One column of a {@link RecordList}. */
export interface RecordColumn<Row> {
  /** What tells the column apart, among its siblings. */
  readonly key: string;
  /** The header, in the reader's language. */
  readonly header: string;
  /** The row field the column shows, sorts by and searches. */
  readonly field?: keyof Row & string;
  /** What the cell shows when it is more than the field's text: a second line, a badge, a link. */
  readonly value?: (row: Row) => RecordValue;
  /** A fixed width in px; the column fills what is left when absent. */
  readonly width?: number;
  /** The width the table needs before this column is drawn; it is dropped from a narrow pane. */
  readonly minTableWidth?: number;
  /** Whether the header sorts the rows; on for a column with a field unless said otherwise. */
  readonly sortable?: boolean;
}

/** A filter the list's filter bar offers. */
export type RecordFilter<Row> =
  | { readonly kind: "text"; readonly field: keyof Row & string; readonly label: string }
  | { readonly kind: "number"; readonly field: keyof Row & string; readonly label: string }
  | {
      readonly kind: "choice";
      readonly field: keyof Row & string;
      readonly label: string;
      readonly options: readonly { readonly value: string; readonly label: string }[];
    };

/** A row action, in the row's action cell. */
export interface RecordAction<Row> {
  readonly type: ActionType;
  readonly label: string;
  readonly onClick?: (row: Row) => void;
  /** Rows the action is drawn for but cannot run on, with the reason a reader hovers to see. */
  readonly disabled?: (row: Row) => string | false | undefined;
}

/**
 * The list's features. Every one is on; a screen turns one off by naming it, so no list on any
 * screen goes without search, filters, sorting or paging by accident.
 */
export interface RecordListFeatures {
  readonly search?: boolean;
  readonly filters?: boolean;
  readonly chips?: boolean;
  readonly sort?: boolean;
  readonly groups?: boolean;
  readonly rowActions?: boolean;
  readonly count?: boolean;
  readonly pagination?: boolean;
}

/** Props for {@link RecordList}. */
export interface RecordListProps<Row> {
  readonly rows: readonly Row[];
  readonly columns: readonly RecordColumn<Row>[];
  /** The value that names a row, in the address and in the open panel. */
  readonly rowId: (row: Row) => string;
  /** The row whose record stands open beside the list. */
  readonly activeRowId?: string | null;
  readonly onRowClick?: (row: Row) => void;
  /** The filters the filter bar offers. */
  readonly filters?: readonly RecordFilter<Row>[];
  /** A chip row that narrows by one field. */
  readonly chips?: {
    readonly field: keyof Row & string;
    readonly options: readonly { readonly value: string; readonly label: string }[];
  };
  /** Group headings by one field, in this order. */
  readonly groupBy?: { readonly field: keyof Row & string; readonly order?: readonly string[] };
  readonly actions?: readonly RecordAction<Row>[];
  readonly searchPlaceholder?: string;
  readonly pageSize?: number;
  readonly empty?: { readonly title: string; readonly description?: string };
  /** Features to turn off; everything not named is on. */
  readonly features?: RecordListFeatures;
  /** What sits before the filter bar's controls, for a narrowing of the screen's own. */
  readonly leading?: ReactNode;
}

const DEFAULT_PAGE_SIZE = 20;

function filterDef<Row>(filter: RecordFilter<Row>): FilterDef {
  if (filter.kind === "choice") {
    return { type: "faceted", field: filter.field, label: filter.label, options: [...filter.options], multiSelect: true };
  }
  if (filter.kind === "number") {
    return {
      type: "number",
      field: filter.field,
      label: filter.label,
      operators: [SearchOperator.EQUALS, SearchOperator.GREATER_THAN_OR_EQUAL, SearchOperator.LESS_THAN_OR_EQUAL],
      defaultOperator: SearchOperator.EQUALS,
    } as FilterDef;
  }
  return {
    type: "text",
    field: filter.field,
    label: filter.label,
    operators: [SearchOperator.CONTAINS, SearchOperator.EQUALS],
    defaultOperator: SearchOperator.CONTAINS,
  };
}

/**
 * A list of records with everything a console list has: a filter bar with search, filters, a chip
 * row and the count; sortable headers; group headings; row actions; an empty state; and paging.
 *
 * <p>The list part of {@link CrudPage}. A screen declares the rows and what each column, filter and
 * action is; how each feature behaves is the kit's, processed in memory over the rows by the
 * framework's client-mode list, so a feature is never drawn by hand for one screen.
 */
export function RecordList<Row>({
  rows,
  columns,
  rowId,
  activeRowId,
  onRowClick,
  filters = [],
  chips,
  groupBy,
  actions = [],
  searchPlaceholder,
  pageSize = DEFAULT_PAGE_SIZE,
  empty,
  features = {},
  leading,
}: RecordListProps<Row>) {
  const on = (feature: keyof RecordListFeatures) => features[feature] !== false;
  const useRows = useMemo<ListHook<Row>>(() => () => ({ data: [...rows], total: rows.length, isLoading: false, error: null }), [rows]);
  const list = useCrudList(useRows, { stateMode: "client", filterMode: "immediate", defaultPageSize: pageSize });

  const rowActions: RowActionDef<Row>[] = on("rowActions")
    ? actions.map((action) => ({
        type: action.type,
        label: action.label,
        onClick: (row: Row) => action.onClick?.(row),
        disabled: action.disabled ? (row: Row) => Boolean(action.disabled?.(row)) : undefined,
        disabledReason: action.disabled ? (row: Row) => action.disabled?.(row) || undefined : undefined,
      }))
    : [];

  const chipRow =
    on("chips") && chips ? (
      <CrudList.ChipFilter field={`${chips.field}.${SearchOperator.IN}`} state={list.filters} options={[...chips.options]} />
    ) : null;
  // A fixed width keeps the search beside the filter control rather than taking the whole row.
  const search = on("search") ? (
    <div className="w-60 shrink-0">
      <CrudList.Search value={list.filters.search} onChange={list.filters.setSearch} placeholder={searchPlaceholder} />
    </div>
  ) : null;

  return (
    <CrudList>
      {on("filters") && filters.length > 0 ? (
        <CrudList.FilterBar
          filters={filters.map(filterDef)}
          state={list.filters}
          count={on("count") ? list.pagination.total : undefined}
          leading={
            leading || chipRow ? (
              <>
                {leading}
                {chipRow}
              </>
            ) : undefined
          }
          trailing={search ?? undefined}
          maxBadges={3}
        />
      ) : on("count") || leading || chipRow || search ? (
        // No filters to offer: the count, the chips and the search stand on their own row rather
        // than beside a filter control that would open onto nothing.
        <Flex align="center" gap="sm" wrap justify="between">
          <Flex align="center" gap="sm" wrap>
            {on("count") ? <ListTotalBadge count={list.pagination.total} /> : null}
            {leading}
            {chipRow}
          </Flex>
          {search}
        </Flex>
      ) : null}
      <CrudList.Table<Row>
        data={list.data}
        rowId={rowId}
        activeRowId={activeRowId ?? null}
        onRowClick={onRowClick}
        density="compact"
        sort={on("sort") && list.sort.field ? { field: list.sort.field, direction: list.sort.direction } : null}
        onSortChange={on("sort") ? (next) => list.sort.setSort(next.field, next.direction) : undefined}
        groupBy={
          on("groups") && groupBy
            ? { of: (row: Row) => String((row as Record<string, unknown>)[groupBy.field] ?? ""), order: groupBy.order }
            : undefined
        }
        actions={rowActions.length > 0 ? rowActions : undefined}
        emptyState={empty}
      >
        {columns.map((column) => (
          <CrudList.Column<Row>
            key={column.key}
            field={column.field}
            header={column.header}
            width={column.width}
            minTableWidth={column.minTableWidth}
            sortable={on("sort") && column.field !== undefined && column.sortable !== false}
          >
            {column.value ? ({ row }) => <RecordValueView value={column.value?.(row)} /> : undefined}
          </CrudList.Column>
        ))}
      </CrudList.Table>
      {on("pagination") ? (
        <CrudList.Pagination
          page={list.pagination.page}
          pageSize={list.pagination.pageSize}
          total={list.pagination.total}
          totalPages={list.pagination.totalPages}
          onPageChange={list.pagination.setPage}
          onPageSizeChange={list.pagination.setPageSize}
        />
      ) : null}
    </CrudList>
  );
}
