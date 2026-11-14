import { createContext, Fragment, useContext, useMemo, useRef, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Button,
  CrudList,
  EmptyState,
  TableCardFrameContext,
  useTableCardFrame,
  Flex,
  Grid,
  Stack,
  Text,
  ListTotalBadge,
  SearchOperator,
  filtersOutsideForced,
  useCrudList,
  type FilterDef,
  type ListHook,
  type RowActionDef,
} from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";
import { BulkActionBar } from "@simplix-react/ui/interaction";

import { useReflowFlip } from "../layout/use-reflow-flip";
import { PACKAGE_NAMESPACE } from "./locales";
import { recordListStyle, recordListToolbarStyle } from "./record-list.style";
import { CARD_LINES_GRID, CARD_LINE_WIDE_VALUE, cardLayout, isBadge, isEmpty, keptColumns, packedLines, wideColumns } from "./record-card";
import { RecordValueView } from "./record-value";
import { enumValueOf } from "./record-contract";
import { missingTileFacets, useTileFacets } from "./tile-facets";
import { tableColumnsOf } from "./column-priority";
import { useRememberedView } from "./list-view-memory";
import { listTotal } from "./list-total";
import {
  ACTION_CELL_INSET,
  ACTION_WIDTH,
  actionLabelFor,
  actionsNeedLabels,
  announceOutcome,
  labelledActionWidth,
  toRowAction,
} from "./record-list-actions";
import type { RecordBulkAction, RecordListFeatures, RecordListProps } from "./record-list-types";
import {
  cellIn,
  cellOf,
  countedChips,
  derivedViewKey,
  filterDef,
  isNarrowed,
  offersViewSwitch,
  openingView,
  orderUpdates,
  splitCardColumns,
  tableWidth,
  valueOf,
} from "./record-list-view";

/** Set by a record's tabs, so a list inside one is drawn as part of the record rather than as a card of its own. */
export const RecordListNestingContext = createContext(false);

const DEFAULT_PAGE_SIZE = 20;

/** The toolbar controls that move between rows when the list folds its toolbar. */
const TOOLBAR_ITEMS =
  "[data-part=list-total-badge], [data-flip-key=search], [data-slot=crud-filter-bar-trigger], [data-slot=crud-filter-bar-columns-button]";

/**
 * A list of records with everything a console list has: a filter bar with search, filters, a chip
 * row and the count; sortable headers; group headings; row actions; an empty state; and paging.
 *
 * <p>The list part of {@link CrudPage}. A screen declares the rows and what each column, filter and
 * action is; how each feature behaves is the kit's, processed in memory over the rows by the
 * framework's client-mode list, so a feature is never drawn by hand for one screen.
 */
const NO_ROWS: readonly never[] = [];

export function RecordList<Row>({
  rows = NO_ROWS,
  list: serverList,
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
  filteredEmpty,
  features = {},
  narrowing,
  cardBreakpoint,
  presentation = "table",
  viewToggle: viewToggleAsked = false,
  viewKey,
  cardTitle,
  bulkActions,
  keyboard = false,
  reorder,
  more,
}: RecordListProps<Row>) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const nested = useContext(RecordListNestingContext);
  const inheritedFrame = useTableCardFrame();
  // Own one surface while retaining a containing card's height and scroll constraints.
  const listFrame = useMemo(() => ({ ...inheritedFrame, framed: true }), [inheritedFrame]);
  // When the list narrows past the toolbar's fold (or widens back), the count, the search and the
  // filter controls glide to their new rows instead of jumping.
  const rootRef = useRef<HTMLDivElement>(null);
  useReflowFlip(rootRef, TOOLBAR_ITEMS, []);
  // A cursor window states no total, so neither the count nor the pager has anything true to say.
  const on = (feature: keyof RecordListFeatures) =>
    more !== undefined && (feature === "count" || feature === "pagination") ? false : features[feature] !== false;
  const useRows = useMemo<ListHook<Row>>(() => () => ({ data: [...rows], total: rows.length, isLoading: false, error: null }), [rows]);
  const clientList = useCrudList(useRows, { stateMode: "client", filterMode: "immediate", defaultPageSize: more ? Number.MAX_SAFE_INTEGER : pageSize });
  const list = serverList ?? clientList;
  const [arranging, setArranging] = useState(false);
  const arrange = (on: boolean) => {
    setArranging(on);
    if (on && reorder) list.sort.setSort(reorder.orderField, "asc");
  };
  const arranged = arranging && reorder !== undefined;
  const arrangeControl = reorder ? (
    <Button size="sm" variant={arranged ? "default" : "outline"} aria-pressed={arranged} onClick={() => arrange(!arranged)}>
      {arranged ? t("recordList.reorderDone") : t("recordList.reorder")}
    </Button>
  ) : null;

  const counted = features.count === "filtered" ? isNarrowed(list, rows.length, serverList !== undefined) : on("count");
  // The total is drawn as unknown until the read has answered, by the badge and the pager alike.
  const total = listTotal(list);

  const rowActions: RowActionDef<Row>[] = on("rowActions") ? actions.map(toRowAction) : [];

  const labelled = rowActions.length > 0 && actionsNeedLabels(actions);
  // A label read from the row is as wide as the widest one the rows hold.
  const widestLabels = actions.map((action) => (typeof action.label === "string" ? action.label : rows.map((row) => actionLabelFor(action, row)).sort((a, b) => b.length - a.length)[0] ?? ""));
  const actionCell = rowActions.length === 0 ? 0 : labelled ? labelledActionWidth(widestLabels) : rowActions.length * ACTION_WIDTH + ACTION_CELL_INSET;

  // The table's columns: the leading one and the one the rows are sorted by never drop for want of
  // width, the rest drop from the end, the contract's leading block last. The card keeps the declared
  // columns, which it places by shape.
  const sortedBy = on("sort") ? list.sort.field : null;
  const tableColumns = useMemo(() => tableColumnsOf(columns, sortedBy), [columns, sortedBy]);
  // A fixed column whose rows draw badges draws them whole: the width is a floor a longer label
  // widens, never a box that cuts the badge (the table then drops a tier or scrolls sideways).
  const wholeColumns = useMemo(
    () => new Set(columns.filter((column) => column.width !== undefined && list.data.some((row) => isBadge(valueOf(column, row)))).map((column) => column.key)),
    [columns, list.data],
  );
  const { title: titleColumn, lines: lineColumns } = splitCardColumns(columns, cardTitle);
  // A list drawn as cards always offers the switch to the table; the choice is kept under the key the
  // screen names, else under one derived from the columns.
  const viewToggle = offersViewSwitch(presentation, viewToggleAsked);
  // The view the list opens in: the presentation, unless the reader's saved choice replaces it where
  // the switch is offered. A list with no switch never reads a saved view.
  const remembered = useRememberedView(viewToggle ? (viewKey ?? derivedViewKey(columns)) : undefined);
  const openView = openingView(presentation, viewToggle, remembered.saved);
  // Decided over the page's rows, so a label holds the same cell on every card.
  const wideCards = wideColumns(
    lineColumns.map((column) => column.key),
    list.data,
    (key, row) => {
      const column = lineColumns.find((one) => one.key === key);
      return column ? valueOf(column, row) : null;
    },
  );
  // A labelled column some card fills keeps its cell on every card, and one that asks (`cardKeep`) keeps it whoever fills it.
  const alwaysKept = lineColumns.filter((column) => column.cardKeep === true && column.cardPlace !== "hidden" && column.cardPlace !== "badges").map((column) => column.key);
  const keptCards = keptColumns(
    lineColumns.filter((column) => column.cardKeep !== false).map((column) => column.key),
    list.data,
    (key, row) => {
      const column = lineColumns.find((one) => one.key === key);
      return column ? valueOf(column, row) : null;
    },
    nested,
    alwaysKept,
  );
  // A list whose labelled values are all short sets them in one line from the left on every card.
  const packedCards =
    !nested &&
    wideCards.size === 0 &&
    alwaysKept.length === 0 &&
    packedLines(
      lineColumns
        .filter((column) => column.cardPlace !== "hidden" && column.cardPlace !== "badges" && list.data.some((row) => { const value = valueOf(column, row); return !isEmpty(value) && !isBadge(value); }))
        .map((column) => column.key),
      list.data,
      (key, row) => {
        const column = lineColumns.find((one) => one.key === key);
        return column ? valueOf(column, row) : null;
      },
    );
  const breakpoint = cardBreakpoint === false ? undefined : cardBreakpoint ?? tableWidth(tableColumns, actionCell);

  const leading = narrowing ? <CrudList.ChipFilter field={narrowing.field} state={narrowing.state} options={[...narrowing.options]} /> : null;
  const chipRow =
    on("chips") && chips ? (
      <CrudList.ChipFilter field={`${chips.field}.${SearchOperator.IN}`} state={list.filters} options={countedChips(chips, (label, count) => t("recordList.chipCount", { label, count }))} />
    ) : null;
  // Beside a filter control the search starts narrow and grows to its full width, so a list beside a
  // detail panel keeps the count, the chips, the search and the filter on one row instead of wrapping
  // at the search's full width. Below the toolbar's fold the count keeps the first row and the search
  // takes the whole second row with its filter and column controls.
  // A field the page's figure tiles narrow and this list offers no way to narrow by gets a faceted
  // filter of its tiles' values, so a pressed tile shows in the bar as an active value and clears
  // there. A chip row on the field stays the one place it is chosen.
  const tileFacets = missingTileFacets(useTileFacets(), {
    filterFields: filters.map((filter) => filter.field),
    chipField: chips?.field,
    narrowingKey: narrowing?.field,
  });
  // A filter over a field the page forces (a tab pins `status.equals`) is not drawn: the forced value
  // wins in the request, so its control would open, take a choice and change not one row.
  const filterDefs: FilterDef[] = filtersOutsideForced({ ...serverList?.forced }, [
    ...filters.map(filterDef),
    ...tileFacets.map((facet): FilterDef => ({ type: "faceted", field: facet.field, label: facet.label, options: [...facet.options], multiSelect: true })),
  ]);
  const filtered = on("filters") && filterDefs.length > 0;
  const search = on("search") ? (
    <div
      data-flip-key="search"
      className={
        filtered
          ? "min-w-0 max-w-60 flex-1 basis-28 @max-md/record-list:max-w-none"
          : "w-60 shrink-0 @max-md/record-list:w-auto @max-md/record-list:min-w-0 @max-md/record-list:basis-full"
      }
    >
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
    // `data-pager="off"` marks a pager the caller turned off, so a check can tell it from a lost one.
    <div ref={rootRef} className="@container/record-list" data-pager={on("pagination") ? undefined : "off"} {...slotAttributes(recordListStyle, { nested })}>
    <TableCardFrameContext.Provider value={listFrame}>
    <CrudList defaultViewMode={openView} onViewModeChange={viewToggle ? remembered.remember : undefined}>
      {filtered ? (
        <CrudList.FilterBar
          filters={filterDefs}
          state={list.filters}
          count={counted ? total : undefined}
          countLoading={counted && total === undefined}
          leading={
            leading || chipRow || arrangeControl ? (
              <>
                {leading}
                {chipRow}
                {arrangeControl}
              </>
            ) : undefined
          }
          trailing={search ?? undefined}
          maxBadges={3}
          className="[&>[data-slot=crud-filter-bar-trailing]]:min-w-0 [&>[data-slot=crud-filter-bar-trailing]]:flex-1 [&>[data-slot=crud-filter-bar-trailing]]:basis-48 [&>[data-slot=crud-filter-bar-trailing]]:justify-end @max-md/record-list:[&>[data-slot=crud-filter-bar-trailing]]:ml-0 @max-md/record-list:[&>[data-slot=crud-filter-bar-trailing]]:basis-full @max-md/record-list:[&>[data-slot=crud-filter-bar-trailing]]:flex-nowrap"
        />
      ) : counted || leading || chipRow || search || arrangeControl || viewToggle ? (
        // No filters to offer: the count, the chips and the search stand on their own row rather
        // than beside a filter control that would open onto nothing.
        // The same inset as the filter bar, so the toolbar's first item lines up with the table's
        // first-column text whatever the toolbar holds.
        <Flex align="center" gap="sm" wrap justify="between" {...partAttributes(recordListToolbarStyle, {})}>
          <Flex align="center" gap="sm" wrap>
            {counted ? <ListTotalBadge count={total} /> : null}
            {leading}
            {chipRow}
            {arrangeControl}
            {viewToggle ? <CrudList.ViewToggle /> : null}
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
        reorder={
          arranged
            ? {
                orderField: reorder.orderField,
                idField: reorder.idField,
                onReorder: async (items: Row[]) => {
                  await reorder.onReorder(orderUpdates(list.data, items, reorder.idField, reorder.orderField));
                },
              }
            : undefined
        }
        groupBy={
          on("groups") && groupBy && !arranged
            ? {
                // An empty constant is no group: handed on as a key it is labelled as an enum value that does not exist.
                of: (row: Row) => enumValueOf((row as Record<string, unknown>)[groupBy.field]) || null,
                order: groupBy.order,
                label: groupBy.label,
                ungrouped: groupBy.ungrouped ?? t("recordList.ungrouped"),
              }
            : undefined
        }
        actions={rowActions.length > 0 ? rowActions : undefined}
        actionVariant={labelled ? "outline" : undefined}
        actionColumnWidth={labelled ? actionCell : undefined}
        // With no rows the table says why: the page's own empty state, or inside a record (where the
        // list is one part of the panel) the compact sentence centred in the list's place.
        emptyReason={list.emptyReason}
        isLoading={list.isLoading}
        emptyState={empty}
        filteredEmptyState={filteredEmpty}
        slots={
          nested
            ? {
                empty: ({ reason }) => {
                  const declared = reason === "no-data" ? empty : reason === "no-filter" ? filteredEmpty : undefined;
                  return declared ? <EmptyState size="sm" title={declared.title} description={declared.description} /> : <CrudList.Empty reason={reason} />;
                },
              }
            : undefined
        }
        cardBreakpoint={titleColumn ? breakpoint : undefined}
        gridView={viewToggle ? true : undefined}
        // A list inside a record has no table head above its cards, so there every value carries its
        // column header (「차수 1」) rather than standing bare.
        cardTitle={
          titleColumn
            ? ({ row }) =>
                nested ? (
                  <Flex align="center" gap="sm" minSize>
                    <Text as="span" size="caption" tone="muted" className="w-16 shrink-0">
                      {titleColumn.header}
                    </Text>
                    {cellOf(titleColumn, row)}
                  </Flex>
                ) : (
                  cellOf(titleColumn, row)
                )
            : undefined
        }
        cardContent={
          lineColumns.length > 0
            ? ({ row }) => {
                const layout = cardLayout(
                  lineColumns.map((column) => ({ key: column.key, header: column.header, place: nested ? "lines" : column.cardPlace, value: valueOf(column, row), wide: wideCards.has(column.key), keep: !packedCards && keptCards.has(column.key) })),
                );
                return (
                  <Stack gap="xs">
                    {layout.badges.length > 0 ? (
                      <Flex wrap align="center" gap="xs">
                        {layout.badges.map((badge) => (
                          <RecordValueView key={badge.key} value={badge.value} />
                        ))}
                      </Flex>
                    ) : null}
                    {layout.lines.length > 0 && packedCards ? (
                      <Flex wrap align="center" gap="md">
                        {layout.lines.map((line) => (
                          <Flex key={line.key} align="center" gap="xs">
                            <Text as="span" size="caption" tone="muted">
                              {line.header}
                            </Text>
                            <RecordValueView value={line.value} />
                          </Flex>
                        ))}
                      </Flex>
                    ) : layout.lines.length > 0 ? (
                      <Grid columns={2} gap="xs" gapX="sm" className={`items-center ${CARD_LINES_GRID}`}>
                        {/* A label and its value are two cells of one grid, so the label column is as wide as the longest label and no wider than the kit's cap. */}
                        {layout.lines.map((line) => (
                          <Fragment key={line.key}>
                            <Text as="span" size="caption" tone="muted" className={line.wide ? "col-start-1" : undefined}>
                              {line.header}
                            </Text>
                            <Flex flex minSize align="center" className={line.wide ? CARD_LINE_WIDE_VALUE : undefined}>
                              <RecordValueView value={line.value} />
                            </Flex>
                          </Fragment>
                        ))}
                      </Grid>
                    ) : null}
                  </Stack>
                );
              }
            : undefined
        }
      >
        {tableColumns.map((column) => (
          <CrudList.Column<Row>
            key={column.key}
            field={column.field}
            // A column with no field (a cell built from several) is known by its key, so the columns
            // menu can offer it and a narrower pane dropping the column before it cannot rename it.
            id={column.field === undefined ? column.key : undefined}
            header={column.header}
            width={column.width}
            minWidth={column.width === undefined ? column.minWidth : undefined}
            minTableWidth={column.minTableWidth}
            fitContent={wholeColumns.has(column.key)}
            align={column.align}
            sortable={on("sort") && column.field !== undefined && column.sortable !== false}
          >
            {column.value || column.wrap || column.minWidth !== undefined ? ({ row }) => cellIn(column, row) : undefined}
          </CrudList.Column>
        ))}
      </CrudList.Table>
      {on("pagination") ? (
        <CrudList.Pagination
          page={list.pagination.page}
          pageSize={list.pagination.pageSize}
          total={total}
          totalPages={list.pagination.totalPages}
          onPageChange={list.pagination.setPage}
          onPageSizeChange={list.pagination.setPageSize}
        />
      ) : null}
      {more?.hasMore ? (
        <Flex justify="center">
          <Button variant="outline" size="sm" onClick={more.onMore} disabled={more.loading}>
            {t(more.loading ? "recordList.loadingMore" : "recordList.more")}
          </Button>
        </Flex>
      ) : null}
    </CrudList>
    </TableCardFrameContext.Provider>
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

export * from "./record-list-types";
export * from "./record-list-actions";
export * from "./record-list-view";
