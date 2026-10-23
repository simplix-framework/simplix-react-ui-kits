import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  addToast,
  Button,
  CrudList,
  Flex,
  Stack,
  Text,
  ListTotalBadge,
  SearchOperator,
  useCrudList,
  type ActionType,
  type FilterDef,
  type ListHook,
  type RowActionDef,
} from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";
import { BulkActionBar } from "@simplix-react/ui/interaction";

import { PACKAGE_NAMESPACE } from "./locales";
import { recordListStyle } from "./record-list.style";
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

/** What a bulk action reports once it has run: what changed, and how to take it back. */
export interface RecordOutcome {
  readonly message: string;
  readonly tone?: "success" | "info" | "warning";
  /** Restores what the action changed; given, the toast offers 「실행 취소」, which runs it once. */
  readonly undo?: () => void;
}

/** An action on the rows the reader has selected, in the bar that rises while any are. */
export interface RecordBulkAction<Row> {
  readonly label: string;
  readonly icon?: ReactNode;
  /**
   * Runs on the selected rows, which are then let go. Returning an outcome reports it in a toast;
   * an action that asks first (a dialog) reports through {@link announceOutcome} once it has run.
   */
  readonly run: (rows: readonly Row[]) => RecordOutcome | void;
}

/**
 * Reports what an action did in a toast, with 「실행 취소」 when it can be taken back.
 *
 * @param outcome what changed and how to restore it
 * @param undoLabel the undo button's wording
 */
export function announceOutcome(outcome: RecordOutcome, undoLabel: string): void {
  addToast({
    type: outcome.tone ?? "success",
    message: outcome.message,
    action: outcome.undo ? { label: undoLabel, run: outcome.undo } : undefined,
  });
}

/**
 * {@link announceOutcome} in the reader's language: what a screen calls once an action that asked
 * first (a dialog) has run.
 */
export function useAnnounceOutcome(): (outcome: RecordOutcome) => void {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  return useCallback((outcome: RecordOutcome) => announceOutcome(outcome, t("recordList.undo")), [t]);
}

/** Set by a record's tabs, so a list inside one is drawn as part of the record rather than as a card of its own. */
export const RecordListNestingContext = createContext(false);

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
  /**
   * The list's width in px below which each row is drawn as a card: the first column as the card's
   * title, the others as labelled lines under it, the row actions beside the title. Absent, it is
   * the width the table needs to hold its columns ({@link tableWidth}); `false` keeps the table.
   */
  readonly cardBreakpoint?: number | false;
  /**
   * Lets the reader select rows (a checkbox column with select-all) and act on the selection from
   * a bar that rises while any are selected.
   */
  readonly bulkActions?: readonly RecordBulkAction<Row>[];
  /**
   * Gives the page's keys to this list: `/` moves into the search, `j` and `k` step along the
   * rows, `x` selects the marked row and `Enter` opens it. One list per screen takes them.
   */
  readonly keyboard?: boolean;
}

const DEFAULT_PAGE_SIZE = 20;

/** The least a column with no fixed width is given before its text is cut. */
const FLUID_COLUMN_MIN = 200;

/** What one row action takes in the action cell, the cell's own inset included once. */
const ACTION_WIDTH = 36;
const ACTION_CELL_INSET = 24;

/**
 * The width a table needs to hold every column it always draws, which is where a row stops fitting
 * on one line and a card reads better.
 */
function tableWidth<Row>(columns: readonly RecordColumn<Row>[], actions: number): number {
  const drawn = columns.filter((column) => column.minTableWidth === undefined);
  const cells = drawn.reduce((sum, column) => sum + (column.width ?? FLUID_COLUMN_MIN), 0);
  return cells + (actions > 0 ? actions * ACTION_WIDTH + ACTION_CELL_INSET : 0);
}

/** What a column shows for one row: its own value, or the field's text. */
function cellOf<Row>(column: RecordColumn<Row>, row: Row): ReactNode {
  if (column.value) return <RecordValueView value={column.value(row)} />;
  if (!column.field) return null;
  const raw = (row as Record<string, unknown>)[column.field];
  return raw === undefined || raw === null ? null : String(raw);
}

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
  cardBreakpoint,
  bulkActions,
  keyboard = false,
}: RecordListProps<Row>) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const nested = useContext(RecordListNestingContext);
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

  const [titleColumn, ...lineColumns] = columns;
  const breakpoint = cardBreakpoint === false ? undefined : cardBreakpoint ?? tableWidth(columns, rowActions.length);

  const chipRow =
    on("chips") && chips ? (
      <CrudList.ChipFilter field={`${chips.field}.${SearchOperator.IN}`} state={list.filters} options={[...chips.options]} />
    ) : null;
  // A fixed width keeps the search beside the filter control rather than taking the whole row.
  const search = on("search") ? (
    <div className="w-60 shrink-0">
      <CrudList.Search
        value={list.filters.search}
        onChange={list.filters.setSearch}
        placeholder={searchPlaceholder}
        shortcut={keyboard ? "/" : undefined}
      />
    </div>
  ) : null;

  const selectable = bulkActions !== undefined && bulkActions.length > 0;
  const selectedRows = selectable ? [...list.selection.selected].sort((a, b) => a - b).flatMap((index) => (list.data[index] === undefined ? [] : [list.data[index]!])) : [];
  const runBulk = (action: RecordBulkAction<Row>) => {
    const outcome = action.run(selectedRows);
    list.selection.clear();
    if (outcome) announceOutcome(outcome, t("recordList.undo"));
  };

  return (
    <div {...slotAttributes(recordListStyle, { nested })}>
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
        selectable={selectable}
        selectedIndices={selectable ? list.selection.selected : undefined}
        onSelectionChange={selectable ? list.selection.toggle : undefined}
        onSelectAll={selectable ? () => list.selection.toggleAll(list.data) : undefined}
        keyboardNav={keyboard}
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
        cardBreakpoint={titleColumn ? breakpoint : undefined}
        cardTitle={titleColumn ? ({ row }) => cellOf(titleColumn, row) : undefined}
        cardContent={
          lineColumns.length > 0
            ? ({ row }) => (
                <Stack gap="xs">
                  {lineColumns.map((column) => (
                    <Flex key={column.key} align="center" gap="sm">
                      {/* A fixed label measure, so the values line up down the card. */}
                      <Text as="span" size="caption" tone="muted" className="w-20 shrink-0">
                        {column.header}
                      </Text>
                      <Flex flex minSize align="center">
                        {cellOf(column, row)}
                      </Flex>
                    </Flex>
                  ))}
                </Stack>
              )
            : undefined
        }
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
            {column.value ? ({ row }) => cellOf(column, row) : undefined}
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
    {selectable ? (
      // Over the foot of the window, centred; the bar takes the pointer only while it is open.
      <div className="pointer-events-none fixed bottom-12 left-1/2 z-40 -translate-x-1/2 [&>[data-open=true]]:pointer-events-auto">
      <BulkActionBar
        count={selectedRows.length}
        countLabel={t("recordList.selected")}
        onClear={list.selection.clear}
        clearLabel={t("recordList.clearSelection")}
      >
        {bulkActions.map((action) => (
          <Button key={action.label} variant="ghost" size="sm" onClick={() => runBulk(action)}>
            {action.icon}
            {action.label}
          </Button>
        ))}
      </BulkActionBar>
      </div>
    ) : null}
    </div>
  );
}
