import type { ReactNode } from "react";
import { type ActionType, type CrudListFilters, type EntityFacet, SearchOperator, type UseCrudListResult } from "@simplix-react/ui";

import type { CardPlace } from "./record-card";
import type { RecordValue } from "./record-value";

/**
 * The request a list was built under (`withForced`), which a page that pins a field (a tab's
 * `status.equals`) hands back with its list controller so the bar can leave that field's control out.
 */
interface ForcedBy {
  readonly forced?: Readonly<Record<string, unknown>>;
}

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
  /**
   * Drawn at every pane width, like the leading column and the one the rows are sorted by: a column
   * without which another drawn column reads wrong (a withdrawal beside "granted").
   */
  readonly keep?: boolean;
  /** Whether the header sorts the rows; on for a column with a field unless said otherwise. */
  readonly sortable?: boolean;
  /**
   * Where the value goes when the row is drawn as a card: in the unlabelled badge row under the
   * title, in the labelled grid, or left off. By default a value drawn as badges joins the badge
   * row and any other takes the grid.
   */
  readonly cardPlace?: CardPlace;
  /**
   * Whether a card whose own value is empty keeps this column's cell. Absent, a card keeps it when
   * some card of the page fills it, and no card draws a column that none fills. `false` for a
   * column drawn only on some rows (a due date on open rows only), whose absence is the point
   * rather than a gap. `true` for a column every card holds even when none fills it, so the cards
   * keep one height whatever the data (the line reads as a dash).
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
    }
  /**
   * The key of another record, filtered by that record's name: the options are a server search of
   * the referenced entity (a directory outgrows one page), and a picked value keeps its name. The
   * `facet` is what the project's `createEntityFacet` hook answers with for this list's filters.
   */
  | { readonly kind: "entity"; readonly field: keyof Row & string; readonly label: string; readonly facet: EntityFacet };

/**
 * The verbs the kit names beyond the framework's action types, each with its own glyph, so a screen
 * never borrows an unrelated type (`duplicate` for a retry) to reach the icon strip.
 */
export type RecordVerbType = "retry" | "reset" | "test" | "reprocess" | "enable" | "disable" | "suspend" | "reinstate" | "cancel" | "revoke" | "upload" | "grant" | "adjust" | "approve" | "reject";

/**
 * A row action, in the row's action cell.
 *
 * <p>One action serves a verb that flips with the row's state: give `label` and `type` as
 * functions of the row and the strip draws Disable on an enabled row and Enable on a disabled one,
 * each with its own glyph, so a list never carries two actions of which one is always disabled.
 * A function `type` returns a kit verb ({@link RecordVerbType}), because a framework type's glyph
 * is the framework's and cannot follow the row. A fixed `label` and `type` stay valid.
 */
export interface RecordAction<Row> {
  readonly type: ActionType | RecordVerbType | ((row: Row) => RecordVerbType);
  readonly label: string | ((row: Row) => string);
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
  readonly list?: UseCrudListResult<Row> & ForcedBy;
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
   * shape the server sends it in, and `label` names a heading (the enum's translated label). A row
   * whose field holds no value sits last under `ungrouped`, which reads "Not set" where the screen
   * names none.
   */
  readonly groupBy?: { readonly field: keyof Row & string; readonly order?: readonly string[]; readonly label?: (key: string) => string; readonly ungrouped?: string };
  readonly actions?: readonly RecordAction<Row>[];
  readonly searchPlaceholder?: string;
  readonly pageSize?: number;
  readonly empty?: { readonly title: string; readonly description?: string };
  /**
   * What the list says when lit filters or chips match nothing (the page's own words for an empty
   * chip: what the chip means and how to widen it). Absent, the framework's "No matching items" card
   * stays. {@link empty} says only that there is nothing yet, so a page that words both hands both.
   */
  readonly filteredEmpty?: { readonly title: string; readonly description?: string };
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
   * How the rows are drawn. `"table"` (the default) is the table, which falls to cards below
   * {@link cardBreakpoint}. `"cards"` draws every row as a card in a grid at every width, the same
   * card the narrow table falls to: the card title column, the badge row, the labelled lines and the
   * row actions beside the title, so every column declaration serves both presentations.
   */
  readonly presentation?: RecordPresentation;
  /**
   * Offers the reader a switch between the table and the cards, in the toolbar. The presentation is
   * what the list opens in; the reader's choice replaces it on the next visit. A list drawn as cards
   * always offers the switch (`presentation="cards"` makes this `true` whatever is passed), so a
   * cards list without it cannot exist; a table list offers it only where the screen's design says
   * its rows are also read as units.
   */
  readonly viewToggle?: boolean;
  /**
   * What names this list among the lists of the product, for the browser to remember the reader's
   * view under. Absent, the key is derived from the list's columns ({@link derivedViewKey}), so a
   * list that offers the switch remembers the choice without a key set by hand.
   */
  readonly viewKey?: string;
  /**
   * The key of the column drawn as the card's title, the first column when absent. The other columns
   * keep their order as the card's badges and labelled lines.
   */
  readonly cardTitle?: string;
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

/** How a {@link RecordList} draws its rows: as a table, or as a grid of cards. */
export type RecordPresentation = "table" | "cards";
