import { useRef, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { DetailFieldWrapper, Dialog, DialogFooter, DialogHeader, DialogTitle, Flex, Grid } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";

import { RecordVerbs, type RecordVerb } from "./record-blocks";
import { BoundedDialogContent } from "../layout/bounded-dialog-content";
import { recordSublistStyle } from "./record-detail.style";
import {
  actionLabelFor,
  actionTypeFor,
  RecordList,
  RecordListNestingContext,
  type RecordAction,
  type RecordColumn,
  type RecordListProps,
} from "./record-list";
import { PACKAGE_NAMESPACE } from "./locales";
import { RecordValueView, type RecordValue } from "./record-value";

/**
 * The most rows a sub-list may hold and still be drawn compact. Above it, or when the record does
 * not carry every row its tab counts, the sub-list is the main list table.
 */
const COMPACT_LIMIT = 12;

/** Which of the two in-detail list forms a tab's rows take. */
export function sublistKind(rows: number, count: number | undefined): "compact" | "full" {
  const complete = count === undefined || count === rows;
  return complete && rows <= COMPACT_LIMIT ? "compact" : "full";
}

/**
 * A sub-list form that stays the main table once it has been one. The form is read from the rows the
 * list holds and a search narrows them, so without this a list that showed its search box would fall
 * back to the compact form, which has none, under the reader's first typed character.
 */
export function useStickyFull(decided: "compact" | "full"): "compact" | "full" {
  const wasFull = useRef(false);
  if (decided === "full") wasFull.current = true;
  return wasFull.current ? "full" : decided;
}

/** What a compact list leaves out: everything that exists to find a row among many. */
const COMPACT_FEATURES = { search: false, filters: false, chips: false, sort: false, count: false, pagination: false } as const;

/** What the main table always carries, whatever the screen asked for. */
const FULL_FEATURES = { search: true, sort: true, count: true, pagination: true } as const;

/** The value a column draws for a row, as {@link RecordValueView} reads it. */
function columnValue<Row>(column: RecordColumn<Row>, row: Row): RecordValue {
  if (column.value) return column.value(row);
  if (!column.field) return null;
  const raw = (row as Record<string, unknown>)[column.field];
  return raw === undefined || raw === null ? null : String(raw);
}

/** A row's name: the text of its first column. */
function rowTitle<Row>(columns: readonly RecordColumn<Row>[], row: Row): string {
  const first = columns[0];
  if (!first) return "";
  const value = columnValue(first, row);
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && "text" in value) return value.text;
  return first.header;
}

const DESTRUCTIVE_ACTIONS = new Set(["delete", "cancel"]);

/** Where a row opened over a record leads: the name of the control and what it does with the row. */
export interface RecordRowOpen<Row> {
  readonly label: string;
  readonly onOpen: (row: Row) => void;
}

/**
 * The verbs of a row opened over its record, split into the destructive ones (at the start) and the
 * rest (at the end): the list's row actions, and, where the list says where its rows lead, a verb
 * that goes there, first among the rest.
 *
 * @param row the opened row
 * @param actions the list's row actions
 * @param open where the row leads, when the list's screen names it
 * @param onClose closes the dialog, which every verb does after it runs
 */
export function rowDialogVerbs<Row>(
  row: Row,
  actions: readonly RecordAction<Row>[],
  open: RecordRowOpen<Row> | undefined,
  onClose: () => void,
): { readonly danger: RecordVerb[]; readonly plain: RecordVerb[] } {
  const verbs = (danger: boolean): RecordVerb[] =>
    actions
      .filter((action) => DESTRUCTIVE_ACTIONS.has(actionTypeFor(action, row)) === danger)
      .map((action) => ({
        label: actionLabelFor(action, row),
        kind: danger ? "danger" : "plain",
        disabled: action.disabled?.(row) || undefined,
        onClick: () => {
          action.onClick?.(row);
          onClose();
        },
      }));
  const leads: RecordVerb[] = open
    ? [
        {
          label: open.label,
          kind: "plain",
          onClick: () => {
            open.onOpen(row);
            onClose();
          },
        },
      ]
    : [];
  return { danger: verbs(true), plain: [...leads, ...verbs(false)] };
}

/**
 * One row of an in-detail list, opened over the record: its first column as the title, every
 * column as a labelled value, the list's row actions as the dialog's buttons, and the way to the
 * row's own record where the list's screen names it. A row click inside a detail opens this rather
 * than replacing the panel or leaving the page, so without that way the dialog is read-only with a
 * close button and nothing leads on from it.
 */
function RecordRowDialog<Row>({
  row,
  columns,
  actions,
  open,
  onClose,
}: {
  readonly row: Row | null;
  readonly columns: readonly RecordColumn<Row>[];
  readonly actions: readonly RecordAction<Row>[];
  readonly open?: RecordRowOpen<Row>;
  readonly onClose: () => void;
}) {
  const { danger, plain } = row === null ? { danger: [], plain: [] } : rowDialogVerbs(row, actions, open, onClose);
  return (
    <Dialog open={row !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
      {row !== null ? (
        <BoundedDialogContent width="md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{rowTitle(columns, row)}</DialogTitle>
          </DialogHeader>
          <Grid columns={1} gapY="sm">
            {columns.map((column) => (
              <DetailFieldWrapper key={column.key} label={column.header} layout="top">
                <RecordValueView value={columnValue(column, row)} />
              </DetailFieldWrapper>
            ))}
          </Grid>
          {danger.length + plain.length > 0 ? (
            <DialogFooter>
              <Flex justify="between" gap="sm" wrap flex>
                <RecordVerbs verbs={danger} />
                <RecordVerbs verbs={plain} end />
              </Flex>
            </DialogFooter>
          ) : null}
        </BoundedDialogContent>
      ) : null}
    </Dialog>
  );
}

/**
 * A tab's sub-list in one of its two forms (see {@link sublistKind}). Both open a row in
 * {@link RecordRowDialog}; a screen's own `onRowClick` is the dialog's way on to the row's record.
 */
export function SubList({ list, count }: { readonly list: RecordListProps<any>; readonly count: number | undefined }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const [opened, setOpened] = useState<unknown | null>(null);
  // A cursor window grows as it is read, so it is the main table from its first page: its shape does
  // not change under the reader when a press brings the row count past the compact limit.
  const decided = list.more ? "full" : sublistKind(list.list?.pagination.total ?? list.rows?.length ?? 0, count);
  // The form is decided from the rows the list holds, and a search narrows them: a list that was the main
  // table with its search box must not fall back to the compact form (which has none) under the reader's
  // first typed character, so once it has been the main table it stays one.
  const kind = useStickyFull(decided);
  // A cursor window holds only the pages read so far, so a search, a sort or a filter over it would
  // answer for those rows alone: it keeps the features the screen named rather than the main table's.
  const features = list.more
    ? list.features
    : kind === "compact"
      ? { ...list.features, ...COMPACT_FEATURES }
      : // A screen that turned the search off keeps it off: a box whose text reaches nothing
        // narrows nothing, which is worse than no box.
        { ...list.features, ...FULL_FEATURES, search: list.features?.search !== false };
  return (
    <div {...slotAttributes(recordSublistStyle, { kind })}>
      <RecordListNestingContext.Provider value={true}>
        <RecordList {...list} features={features} onRowClick={(row) => setOpened(row)} />
      </RecordListNestingContext.Provider>
      <RecordRowDialog
        row={opened}
        columns={list.columns}
        actions={list.actions ?? []}
        // The screen's own row click is where the row's record is; inside a detail it is the dialog's verb.
        open={list.onRowClick ? { label: t("recordList.openRow"), onOpen: list.onRowClick } : undefined}
        onClose={() => setOpened(null)}
      />
    </div>
  );
}
