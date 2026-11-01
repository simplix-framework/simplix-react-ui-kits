import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  addToast,
  Button,
  CrudList,
  EmptyState,
  Flex,
  Grid,
  Stack,
  Text,
  ListTotalBadge,
  SearchOperator,
  useCrudList,
  type ActionType,
  type CrudListFilters,
  type FilterDef,
  type ListHook,
  type RowActionDef,
  type UseCrudListResult,
} from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";
import { BulkActionBar } from "@simplix-react/ui/interaction";
import { FlaskConical, RotateCcw, TimerReset } from "lucide-react";

import { useReflowFlip } from "../layout/use-reflow-flip";
import { PACKAGE_NAMESPACE } from "./locales";
import { recordListStyle, recordListToolbarStyle } from "./record-list.style";
import { cardLayout, isBadge, isEmpty, keptColumns, packedLines, wideColumns, type CardPlace } from "./record-card";
import { RecordValueView, type RecordValue } from "./record-value";
import { enumValueOf } from "./record-contract";
import { missingTileFacets, useTileFacets } from "./tile-facets";

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
  /** A fixed width in px, for a value of known size: a time, an identifier, a status. */
  readonly width?: number;
  /**
   * A floor in px for free text (a title, a reason, a summary): the column never draws narrower and
   * takes the table's spare width, so the key text gets the room a short column would waste.
   * Ignored when {@link width} is set.
   */
  readonly minWidth?: number;
  /** Lets the cell's text wrap onto more lines instead of being cut, for long text: a clause, a scope. */
  readonly wrap?: boolean;
  /**
   * `"end"` sets the header and the cells against the end edge in tabular numerals, for a figure a
   * reader compares down the column: an amount, a balance, a count. Absent, the start edge.
   */
  readonly align?: "start" | "end";
  /** The width the table needs before this column is drawn; it is dropped from a narrow pane. */
  readonly minTableWidth?: number;
  /** Whether the header sorts the rows; on for a column with a field unless said otherwise. */
  readonly sortable?: boolean;
  /**
   * Where the value goes when the row is drawn as a card: in the unlabelled badge row under the
   * title, in the labelled grid, or left off. By default a value drawn as badges joins the badge
   * row and any other takes the grid.
   */
  readonly cardPlace?: CardPlace;
  /**
   * Whether a card whose own value is empty keeps this column's cell when other cards fill it.
   * Default true; false for a column drawn only on some rows (a due date on open rows only), whose
   * absence is the point rather than a gap.
   */
  readonly cardKeep?: boolean;
}

/** A filter the list's filter bar offers. */
export type RecordFilter<Row> =
  | {
      readonly kind: "text";
      readonly field: keyof Row & string;
      readonly label: string;
      /**
       * The operators the endpoint accepts on this field, first one the default. A field the server
       * matches only whole (an address found through its hash) takes `[EQUALS]`: offered `contains`,
       * the search answers an empty page and no error. Absent, contains and equals.
       */
      readonly operators?: readonly SearchOperator[];
    }
  | { readonly kind: "number"; readonly field: keyof Row & string; readonly label: string }
  /** A period: rows whose `yyyy-MM-dd` (or ISO date-time) value falls between the picked days. */
  | { readonly kind: "dateRange"; readonly field: keyof Row & string; readonly label: string; readonly dateOnly?: boolean }
  /** On or off: rows whose boolean value is true while the toggle is on. */
  | { readonly kind: "toggle"; readonly field: keyof Row & string; readonly label: string }
  | {
      readonly kind: "choice";
      readonly field: keyof Row & string;
      readonly label: string;
      readonly options: readonly { readonly value: string; readonly label: string }[];
    };

/**
 * The verbs the kit names beyond the framework's action types, each with its own glyph, so a screen
 * never borrows an unrelated type (`duplicate` for a retry) to reach the icon strip.
 */
export type RecordVerbType = "retry" | "reset" | "test";

const VERB_GLYPHS: Record<RecordVerbType, { readonly type: ActionType; readonly icon: ReactNode }> = {
  retry: { type: "view", icon: <RotateCcw /> },
  reset: { type: "view", icon: <TimerReset /> },
  test: { type: "view", icon: <FlaskConical /> },
};

/** A row action, in the row's action cell. */
export interface RecordAction<Row> {
  readonly type: ActionType | RecordVerbType;
  readonly label: string;
  readonly onClick?: (row: Row) => void;
  /** Rows the action is drawn for but cannot run on, with the reason a reader hovers to see. */
  readonly disabled?: (row: Row) => string | false | undefined;
  /**
   * The glyph the icon strip draws instead of the type's. An action with its own glyph is told
   * apart from another of its type by that glyph, so the strip stays icon-only.
   */
  readonly icon?: ReactNode;
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
 * screen goes without search, filters, sorting or paging by accident. The row count never turns
 * one off: the toolbar and the pager stay put as the reader moves between tabs.
 */
export interface RecordListFeatures {
  readonly search?: boolean;
  readonly filters?: boolean;
  readonly chips?: boolean;
  readonly sort?: boolean;
  readonly groups?: boolean;
  readonly rowActions?: boolean;
  /**
   * The count of rows. `"filtered"` draws it only while a search or a filter narrows the rows, for
   * a list whose tab already carries the same total; the screen says so, the list never decides it.
   */
  readonly count?: boolean | "filtered";
  readonly pagination?: boolean;
}

/** Props for {@link RecordList}. */
export interface RecordListProps<Row> {
  /** The rows, filtered, sorted and paged in memory. Ignored when {@link list} is given. */
  readonly rows?: readonly Row[];
  /**
   * A list the server pages: a `useCrudList` result in `"server"` mode. The search, the filters, the
   * sort and the pager then drive its request instead of the rows in memory, and the count is the
   * server's total.
   */
  readonly list?: UseCrudListResult<Row>;
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
    /**
     * How many rows each option holds, drawn after its label (「Failed · 12」). An option the
     * record leaves out draws its bare label; `useStatusCounts` gives one with every value filled.
     */
    readonly counts?: Readonly<Record<string, number>>;
  };
  /**
   * Group headings by one field, in this order. An enum field groups by its constant, whatever
   * shape the server sends it in, and `label` names a heading (the enum's translated label).
   */
  readonly groupBy?: { readonly field: keyof Row & string; readonly order?: readonly string[]; readonly label?: (key: string) => string };
  readonly actions?: readonly RecordAction<Row>[];
  readonly searchPlaceholder?: string;
  readonly pageSize?: number;
  readonly empty?: { readonly title: string; readonly description?: string };
  /** Features to turn off; everything not named is on. */
  readonly features?: RecordListFeatures;
  /**
   * A narrowing of the screen's own, drawn as a chip row before the list's chips: the field it
   * writes, the filter state the screen holds and reads into its request, and the choices. The
   * list draws the row; a screen never hands it a drawn control.
   */
  readonly narrowing?: {
    readonly field: string;
    readonly state: CrudListFilters;
    readonly options: readonly { readonly value: string; readonly label: string }[];
  };
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
  /**
   * Lets the reader put the rows in order by dragging them. A toolbar control turns the arrangement
   * on: the list then sorts by {@link RecordReorder.orderField}, draws a drag handle on each row and
   * drops its group headings, since the order is one sequence across every group. Turned off, the
   * list returns to the sort and the headings it had.
   */
  readonly reorder?: RecordReorder<Row>;
  /**
   * Marks {@link rows} as a window that grows by a cursor the server names rather than a set the
   * list can count: every loaded row is drawn, the count and the pager are left out (neither has a
   * total to state), and a 「Show more」 control under the rows reads the next page.
   */
  readonly more?: RecordListMore;
}

/** The cursor half of a {@link RecordList} whose rows arrive a page at a time. */
export interface RecordListMore {
  /** Whether the server named a further page. The control is drawn only then. */
  readonly hasMore: boolean;
  /** Whether the next page is being read; the control is disabled meanwhile. */
  readonly loading?: boolean;
  readonly onMore: () => void;
}

/** How a {@link RecordList} writes a new order: the field, the row key, and the request. */
export interface RecordReorder<Row> {
  readonly orderField: keyof Row & string;
  readonly idField: keyof Row & string;
  /** Sends the rows' new positions, as {@link orderUpdates} computes them. */
  readonly onReorder: (updates: readonly Readonly<Record<string, unknown>>[]) => unknown;
}

/**
 * The positions a drag writes: the order values the rows held, handed out again in the new
 * sequence, so rows on other pages keep their places and only the dragged rows' values move.
 */
export function orderUpdates<Row>(before: readonly Row[], after: readonly Row[], idField: keyof Row & string, orderField: keyof Row & string): Readonly<Record<string, unknown>>[] {
  const values = before
    .map((row, index) => {
      const value = Number((row as Record<string, unknown>)[orderField]);
      return Number.isFinite(value) ? value : index;
    })
    .sort((a, b) => a - b);
  // Equal values would leave the dragged rows tied; spread them so the sequence is strict.
  for (let at = 1; at < values.length; at += 1) {
    if (values[at]! <= values[at - 1]!) values[at] = values[at - 1]! + 1;
  }
  return after.flatMap((row, index) => {
    const id = (row as Record<string, unknown>)[idField];
    const was = (before.find((one) => (one as Record<string, unknown>)[idField] === id) as Record<string, unknown> | undefined)?.[orderField];
    return values[index] === Number(was) ? [] : [{ [idField]: id, [orderField]: values[index] }];
  });
}

const DEFAULT_PAGE_SIZE = 20;

/** The least a column with no fixed width is given before its text is cut. */
const FLUID_COLUMN_MIN = 200;

/** What one row action takes in the action cell, the cell's own inset included once. */
const ACTION_WIDTH = 36;
const ACTION_CELL_INSET = 24;

/** Per character and per button inset of a labelled row action, for the action column's width. */
const LABEL_CHAR_WIDTH = 13;
const LABEL_BUTTON_INSET = 20;
const LABEL_GAP = 8;

/**
 * Whether the row actions must carry their labels. An icon stands for the action's type, so two
 * actions drawing the type's own icon for one type would show the same glyph for different verbs;
 * then every action is a labelled button instead, which the region contract refuses: give the
 * second verb its own icon. An action carrying its own icon is distinct by that icon and never forces labels.
 */
export function actionsNeedLabels(actions: readonly { readonly type: string; readonly icon?: unknown }[]): boolean {
  const typeGlyphs = actions.filter((action) => (action.icon === undefined || action.icon === null) && !(action.type in VERB_GLYPHS)).map((action) => action.type);
  return new Set(typeGlyphs).size < typeGlyphs.length;
}

/** The framework type and glyph an action draws with: a kit verb maps to its own glyph. */
export function actionGlyph(action: { readonly type: ActionType | RecordVerbType; readonly icon?: ReactNode }): { type: ActionType; icon?: ReactNode } {
  if (action.type in VERB_GLYPHS) {
    const verb = VERB_GLYPHS[action.type as RecordVerbType];
    return { type: verb.type, icon: action.icon ?? verb.icon };
  }
  return { type: action.type as ActionType, icon: action.icon };
}

/** The action column's width when every action is a labelled button. */
function labelledActionWidth(labels: readonly string[]): number {
  const buttons = labels.reduce((sum, label) => sum + label.length * LABEL_CHAR_WIDTH + LABEL_BUTTON_INSET, 0);
  return buttons + Math.max(labels.length - 1, 0) * LABEL_GAP + ACTION_CELL_INSET;
}

/**
 * The width a table needs to hold every column it always draws, which is where a row stops fitting
 * on one line and a card reads better.
 */
function tableWidth<Row>(columns: readonly RecordColumn<Row>[], actionCell: number): number {
  const drawn = columns.filter((column) => column.minTableWidth === undefined);
  const cells = drawn.reduce((sum, column) => sum + (column.width ?? column.minWidth ?? FLUID_COLUMN_MIN), 0);
  return cells + actionCell;
}

/** A column's value for one row as a {@link RecordValue}, for the card, which places it by its shape. */
function valueOf<Row>(column: RecordColumn<Row>, row: Row): RecordValue {
  if (column.value) return column.value(row);
  if (!column.field) return null;
  const raw = (row as Record<string, unknown>)[column.field];
  return raw === undefined || raw === null ? null : String(raw);
}

/** What a column shows for one row: its own value, or the field's text. */
function cellOf<Row>(column: RecordColumn<Row>, row: Row): ReactNode {
  if (column.value) return <RecordValueView value={column.value(row)} />;
  if (!column.field) return null;
  const raw = (row as Record<string, unknown>)[column.field];
  return raw === undefined || raw === null ? null : String(raw);
}

/**
 * A cell inside a table column. A fluid column's content fills the cell so its spare width shows;
 * a wrapping one breaks onto more lines, any other ellipsizes at the column's edge.
 */
function cellIn<Row>(column: RecordColumn<Row>, row: Row): ReactNode {
  if (column.wrap) return <div className="whitespace-normal break-words">{cellOf(column, row)}</div>;
  if (column.minWidth !== undefined) return <div className="block truncate">{cellOf(column, row)}</div>;
  return cellOf(column, row);
}

function filterDef<Row>(filter: RecordFilter<Row>): FilterDef {
  if (filter.kind === "choice") {
    return { type: "faceted", field: filter.field, label: filter.label, options: [...filter.options], multiSelect: true };
  }
  if (filter.kind === "dateRange") {
    return { type: "dateRange", field: filter.field, label: filter.label, dateOnly: filter.dateOnly ?? true };
  }
  if (filter.kind === "toggle") {
    return { type: "toggle", field: filter.field, label: filter.label };
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
  const operators = filter.operators && filter.operators.length > 0 ? [...filter.operators] : [SearchOperator.CONTAINS, SearchOperator.EQUALS];
  return {
    type: "text",
    field: filter.field,
    label: filter.label,
    operators,
    defaultOperator: operators[0],
  };
}


/**
 * Whether a search or a filter narrows the rows. In memory that is fewer rows than given; on a server
 * list, whose unfiltered total is unknown, it is any search text or filter value.
 */
export function isNarrowed(list: Pick<UseCrudListResult<unknown>, "filters" | "pagination">, given: number, server: boolean): boolean {
  if (!server) return list.pagination.total < given;
  if (list.filters.search.trim() !== "") return true;
  return Object.values(list.filters.committedValues).some((value) => value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0));
}

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

/**
 * The chip options with each option's count after its label, where the chips carry counts.
 *
 * @param chips the chip row
 * @param format how a label and its count are joined, in the reader's language
 * @returns the options the chip row draws
 */
export function countedChips(
  chips: { readonly options: readonly { readonly value: string; readonly label: string }[]; readonly counts?: Readonly<Record<string, number>> },
  format: (label: string, count: number) => string,
): { value: string; label: string }[] {
  const { counts } = chips;
  return chips.options.map((option) => {
    const count = counts?.[option.value];
    return { value: option.value, label: count === undefined ? option.label : format(option.label, count) };
  });
}

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
  features = {},
  narrowing,
  cardBreakpoint,
  bulkActions,
  keyboard = false,
  reorder,
  more,
}: RecordListProps<Row>) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const nested = useContext(RecordListNestingContext);
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

  const rowActions: RowActionDef<Row>[] = on("rowActions")
    ? actions.map((action) => ({
        ...actionGlyph(action),
        label: action.label,
        onClick: (row: Row) => action.onClick?.(row),
        disabled: action.disabled ? (row: Row) => Boolean(action.disabled?.(row)) : undefined,
        disabledReason: action.disabled ? (row: Row) => action.disabled?.(row) || undefined : undefined,
      }))
    : [];

  const labelled = rowActions.length > 0 && actionsNeedLabels(actions);
  const actionCell =
    rowActions.length === 0 ? 0 : labelled ? labelledActionWidth(rowActions.map((action) => action.label ?? "")) : rowActions.length * ACTION_WIDTH + ACTION_CELL_INSET;

  const [titleColumn, ...lineColumns] = columns;
  // Decided over the page's rows, so a label holds the same cell on every card.
  const wideCards = wideColumns(
    lineColumns.map((column) => column.key),
    list.data,
    (key, row) => {
      const column = lineColumns.find((one) => one.key === key);
      return column ? valueOf(column, row) : null;
    },
  );
  // A labelled column some card fills keeps its cell on every card.
  const keptCards = keptColumns(
    lineColumns.filter((column) => column.cardKeep !== false).map((column) => column.key),
    list.data,
    (key, row) => {
      const column = lineColumns.find((one) => one.key === key);
      return column ? valueOf(column, row) : null;
    },
    nested,
  );
  // A list whose labelled values are all short sets them in one line from the left on every card.
  const packedCards =
    !nested &&
    wideCards.size === 0 &&
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
  const breakpoint = cardBreakpoint === false ? undefined : cardBreakpoint ?? tableWidth(columns, actionCell);

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
  const filterDefs: FilterDef[] = [
    ...filters.map(filterDef),
    ...tileFacets.map((facet): FilterDef => ({ type: "faceted", field: facet.field, label: facet.label, options: [...facet.options], multiSelect: true })),
  ];
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
    <CrudList>
      {filtered ? (
        <CrudList.FilterBar
          filters={filterDefs}
          state={list.filters}
          count={counted ? list.pagination.total : undefined}
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
      ) : counted || leading || chipRow || search || arrangeControl ? (
        // No filters to offer: the count, the chips and the search stand on their own row rather
        // than beside a filter control that would open onto nothing.
        // The same inset as the filter bar, so the toolbar's first item lines up with the table's
        // first-column text whatever the toolbar holds.
        <Flex align="center" gap="sm" wrap justify="between" {...partAttributes(recordListToolbarStyle, {})}>
          <Flex align="center" gap="sm" wrap>
            {counted ? <ListTotalBadge count={list.pagination.total} /> : null}
            {leading}
            {chipRow}
            {arrangeControl}
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
            ? { of: (row: Row) => enumValueOf((row as Record<string, unknown>)[groupBy.field]), order: groupBy.order, label: groupBy.label }
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
        slots={nested ? { empty: ({ reason }) => (empty && reason === "no-data" ? <EmptyState size="sm" title={empty.title} description={empty.description} /> : <CrudList.Empty reason={reason} />) } : undefined}
        cardBreakpoint={titleColumn ? breakpoint : undefined}
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
                      <Grid columns={2} gap="xs">
                        {layout.lines.map((line) => (
                          <Flex key={line.key} align="center" gap="sm" minSize className={line.wide ? "col-span-2" : undefined}>
                            {/* A fixed label measure, so the values line up down each column of the grid. */}
                            <Text as="span" size="caption" tone="muted" className="w-16 shrink-0">
                              {line.header}
                            </Text>
                            <Flex flex minSize align="center">
                              <RecordValueView value={line.value} />
                            </Flex>
                          </Flex>
                        ))}
                      </Grid>
                    ) : null}
                  </Stack>
                );
              }
            : undefined
        }
      >
        {columns.map((column) => (
          <CrudList.Column<Row>
            key={column.key}
            field={column.field}
            header={column.header}
            width={column.width}
            minWidth={column.width === undefined ? column.minWidth : undefined}
            minTableWidth={column.minTableWidth}
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
          total={list.pagination.total}
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
