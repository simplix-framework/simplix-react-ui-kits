import { useId, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  CrudDetail,
  DetailFieldWrapper,
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Flex,
  Label,
  Switch,
  Grid,
  EmptyState,
  Heading,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  Text,
} from "@simplix-react/ui";

import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { CopyableDetailField } from "../clipboard/copyable-detail-field";
import { InitialsAvatar } from "../identity/initials-avatar";
import { CountedTab } from "../layout/page-tabs";
import { RecordNote, RecordNoticeMenu, RecordNotices, RecordVerbButton, RecordVerbs, standingNoticeKeys, type RecordNotice, type RecordVerb } from "./record-blocks";
import { PermissionMatrix, type PermissionMatrixProps } from "./permission-matrix";
import { BoundedDialogContent } from "../layout/bounded-dialog-content";
import { recordHeadFigureLabelStyle, recordHeadFigureStyle, recordHeadFigureValueStyle, recordHeadFiguresStyle, recordHeadStyle, recordHeadSubtitleStyle, recordSublistStyle } from "./record-detail.style";
import { actionLabelFor, actionTypeFor, RecordList, RecordListNestingContext, type RecordAction, type RecordColumn, type RecordListProps } from "./record-list";
import { TileSpark } from "../layout/tile-spark";
import { PACKAGE_NAMESPACE } from "./locales";
import { copyTextOf, RecordValueView, type RecordBadge, type RecordValue } from "./record-value";
import { StageGate, type StageGateProps } from "./stage-gate";
import { EvidenceGrid, type EvidenceGridProps } from "../attachment/evidence-grid";
import { ApprovalFlow, type ApprovalFlowProps } from "../layout/approval-flow";
import { CheckMatrix, type CheckMatrixProps } from "../layout/check-matrix";
import { MeasurementGrid, type MeasurementGridProps } from "../layout/measurement-grid";
import { FormSheet, type FormSheetProps } from "../screen/form-sheet";
import { HistoryRail, type HistoryRailProps } from "../screen/history-rail";
import { RecordHistoryLayout, useHistoryAside, type RecordHistory } from "./record-history-layout";
import { ChangeHistoryTable, FieldEnumsProvider, type ChangeHistoryRead } from "../identity/change-history";
import { ScoreSheet, type ScoreSheetProps } from "../screen/score-sheet";
import { useCrudPresentation } from "../page/crud-page";
import { DetailPresentationSwitch, type DetailPresentationSwitchProps } from "../page/detail-presentation-switch";

/** One labelled value of a {@link RecordDetail} section. */
export interface RecordField {
  readonly label: string;
  readonly value: RecordValue;
  /** Spans the section's full width, for a sentence rather than a value. */
  readonly wide?: boolean;
  /** The value is one the reader carries elsewhere: a control beside it copies it, and a toast says so. */
  readonly copy?: boolean;
}

/** One section of a {@link RecordDetail}. */
export interface RecordSection {
  readonly key: string;
  readonly title?: string;
  readonly fields: readonly RecordField[];
}

/** What a tab of a {@link RecordDetail} holds, drawn top to bottom. */
export interface RecordTabContent {
  /**
   * What the tab says while nothing is registered on it: what is missing and the verb that
   * registers it, drawn in the body instead of an empty list or a blank panel.
   */
  readonly empty?: { readonly title: string; readonly description?: string; readonly action?: RecordVerb };
  readonly sections?: readonly RecordSection[];
  /** A sub-collection, drawn with every list feature unless the tab turns one off. */
  // The rows of a sub-list are the screen's own type, so the tab carries them untyped.
  readonly list?: RecordListProps<any>;
  /** The list's own heading, where the tab's sections above it are about something else (「협조 요청」 under 「작업 전 논의」). */
  readonly listTitle?: string;
  /** What a role may do, by area and action, under the sections. */
  readonly matrix?: PermissionMatrixProps & { readonly title?: string };
  /** Sections drawn after the matrix: what the matrix alone cannot say. */
  readonly afterSections?: readonly RecordSection[];
  readonly notices?: readonly RecordNotice[];
  readonly note?: string;
  /**
   * The kit's record parts a tab holds without the screen composing them, drawn in this order
   * above the sections: the approval steps, the gate of the next command, then below the sections
   * the source form, the measurement grid, the score sheet, the check grid, the evidence and the
   * record's history.
   */
  readonly flow?: ApprovalFlowProps;
  readonly gate?: StageGateProps;
  readonly sheet?: FormSheetProps;
  readonly measurements?: MeasurementGridProps;
  readonly score?: ScoreSheetProps;
  readonly checkMatrix?: CheckMatrixProps;
  readonly evidence?: EvidenceGridProps;
  readonly history?: HistoryRailProps;
  /** The rail's own heading, where the tab's sections above it are about something else (「Timeline」 under 「Last error」). */
  readonly historyTitle?: string;
  /**
   * The record's change history from the audit log, drawn as the kit's history table with its own
   * refusal when the reader may not read the log.
   */
  readonly changes?: { readonly history: ChangeHistoryRead; readonly emptyBody?: string };
}

/** One tab of a {@link RecordDetail}. */
export interface RecordTab extends RecordTabContent {
  readonly key: string;
  readonly label: string;
  readonly count?: number;
  /** What the tab still lacks (「미등록」); see {@link CountedTab}. */
  readonly missing?: string;
  /** Why the tab cannot be opened yet; see {@link CountedTab}. */
  readonly disabled?: string;
  /** The tab's own verbs, which change with the open tab. */
  readonly verbs?: readonly RecordVerb[];
}

/** A switch drawn at the end of a record's tab strip. */
export interface RecordTabToggle {
  readonly label: string;
  readonly on: boolean;
  readonly onChange: (on: boolean) => void;
}

function TabToggle({ toggle }: { readonly toggle: RecordTabToggle }) {
  const id = useId();
  return (
    <Flex align="center" gap="xs" className="shrink-0">
      <Switch id={id} checked={toggle.on} onCheckedChange={(on) => toggle.onChange(on === true)} />
      <Label htmlFor={id}>{toggle.label}</Label>
    </Flex>
  );
}

/** One key figure in a record's head. */
export interface RecordHeadFigure {
  readonly key: string;
  readonly label: string;
  readonly value: RecordValue;
  /** The figure's recent periods, oldest first, drawn as a small line beside it. */
  readonly trend?: readonly number[];
}

/** Props for {@link RecordDetail}. */
export interface RecordDetailProps {
  /** What the record is called, at the head of the panel. */
  readonly title: string;
  /**
   * Draws the title in the monospaced face, for a record named by an identifier the reader may type
   * or compare (a provider's event name, a setting key). The face tells the screen's title from an
   * untranslated key, which an identifier's dotted shape otherwise resembles.
   */
  readonly titleCode?: boolean;
  /** What the record is to the reader, under its name: a role and where it belongs. */
  readonly subtitle?: string;
  /**
   * The record's key figures under its name, two to four of them (a balance, what is held, the
   * daily limit), each drawn by its value's own kind, so a meter or a signed amount reads there as
   * it reads in the list.
   */
  readonly figures?: readonly RecordHeadFigure[];
  /** Draws the person the record is beside the name, tinted by this seed (their id). */
  readonly avatar?: string;
  /**
   * Where the record stands, as a badge beside its name, so a reader who opened it from a list
   * card keeps the state the card showed.
   */
  readonly status?: RecordBadge;
  /**
   * The record's progress through its stages, drawn in a column beside the record while the record
   * is wide enough to spare one and, below that, at the foot of its first tab, under its own
   * heading. A screen declares it once and the kit places it; a history that belongs to one tab
   * only is that tab's `history`. Progress is not audit: who changed what is the `changes` tab.
   */
  readonly history?: RecordHistory;
  /** The tabs; the first is open. A record with no tabs passes `sections` instead. */
  readonly tabs?: readonly RecordTab[];
  readonly sections?: readonly RecordSection[];
  readonly notices?: readonly RecordNotice[];
  readonly note?: string;
  /** The tab open first, by key. */
  readonly defaultTab?: string;
  /** The reading verbs: they open something else and change nothing on this record. */
  readonly verbs?: readonly RecordVerb[];
  /** The record's finishing actions, beside the close control; the last primary one is the main one. */
  readonly actions?: readonly RecordVerb[];
  readonly onClose?: () => void;
  /** Draws a back control in the footer in place of close, for a record standing as a page. */
  readonly onBack?: () => void;
  /** Replaces the name block at the head: a page draws its own fixed head there. */
  readonly head?: ReactNode;
  /**
   * Where the open tab's verbs are drawn. `tab` (the default) puts them at the top of the tab;
   * `footer` puts them in the command row ahead of the record's actions, so a row too wide for one
   * line breaks into the tab's verbs above and the record's commands below.
   */
  readonly tabVerbs?: "tab" | "footer";
  /** A switch at the end of the tab strip that changes which tabs are drawn (a 「고급 보기」). */
  readonly tabToggle?: RecordTabToggle;
  /** Who made it and when it last changed, at the foot. */
  readonly audit?: { readonly id?: string; readonly createdAt?: string; readonly updatedAt?: string };
  readonly isLoading?: boolean;
  /**
   * The record's enum fields, field name to enum name ({@link fieldEnumsOf} builds it from the
   * contract's field table), so a changes tab labels an enum value the audit record names no
   * enum for.
   */
  readonly fieldEnums?: Readonly<Record<string, string>>;
}

/**
 * A wide field takes the whole row, and so does its value: the section draws a value as a wrapping
 * flex row at its content's width, so without the stretch a block (a JSON payload) stops at the
 * width of its longest line while the row beside it stands empty.
 */
const WIDE_FIELD = "col-span-full [&>[data-slot=field-detail-value]]:self-stretch";

function Sections({ sections }: { readonly sections?: readonly RecordSection[] }) {
  if (!sections) return null;
  return (
    <>
      {sections.map((section) => (
        <CrudDetail.Section key={section.key} title={section.title} variant="flat" layout="two-column">
          {section.fields.map((field, index) =>
            // The position is part of the key: two rows may carry the same label (one per session
            // of the same application), and a repeated key draws neither of them reliably.
            // A value the contract draws as an object (an excerpt, a code, a block) carries its text
            // inside it, and the copy control takes that text while the row draws the object.
            field.copy && copyTextOf(field.value) !== undefined ? (
              <CopyableDetailField key={`${index}:${field.label}`} label={field.label} layout="inline" value={copyTextOf(field.value)} className={field.wide ? WIDE_FIELD : undefined}>
                {typeof field.value === "string" ? undefined : <RecordValueView value={field.value} />}
              </CopyableDetailField>
            ) : (
              <DetailFieldWrapper key={`${index}:${field.label}`} label={field.label} layout="inline" className={field.wide ? WIDE_FIELD : undefined}>
                <RecordValueView value={field.value} />
              </DetailFieldWrapper>
            ),
          )}
        </CrudDetail.Section>
      ))}
    </>
  );
}

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
function SubList({ list, count }: { readonly list: RecordListProps<any>; readonly count: number | undefined }) {
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

/** Whether a tab holds anything to read besides its notices. */
function holdsContent(content: RecordTabContent): boolean {
  return Boolean(
    content.sections?.length ||
      content.afterSections?.length ||
      content.sheet ||
      content.measurements ||
      content.score ||
      content.checkMatrix ||
      content.matrix ||
      content.evidence ||
      content.history ||
      content.changes ||
      (content.list && (content.list.list ? content.list.list.pagination.total : content.list.rows?.length ?? 0) > 0),
  );
}

/**
 * What a tab holds, drawn top to bottom with no record around it: the page of a screen that reads
 * one record's tab (an account's own sign-in activity) draws the same content the detail panel
 * does, from the same {@link RecordTabContent}, instead of composing the sections and the list
 * again.
 *
 * <p>Where `content.empty` is set and the tab holds nothing else, it is drawn in place of an empty
 * list or a blank column.
 *
 * @param content what the tab holds
 * @param count the total the tab's label counts, which decides whether its list is drawn compact or full
 */
export function RecordTabBody({ content, count }: { readonly content: RecordTabContent; readonly count?: number }): ReactNode {
  if (content.empty && !holdsContent(content)) {
    const action = content.empty.action;
    return (
      <Stack gap="sm">
        {content.flow ? <ApprovalFlow {...content.flow} /> : null}
        {content.gate ? <StageGate {...content.gate} /> : null}
        <EmptyState
          size="sm"
          title={content.empty.title}
          description={content.empty.description}
          action={action ? <RecordVerbButton verb={{ kind: "primary", ...action }} /> : undefined}
        />
        <RecordNotices notices={content.notices} />
      </Stack>
    );
  }
  return (
    <Stack gap="sm">
      {content.flow ? <ApprovalFlow {...content.flow} /> : null}
      {content.gate ? <StageGate {...content.gate} /> : null}
      <Sections sections={content.sections} />
      {content.sheet ? <FormSheet {...content.sheet} /> : null}
      {content.measurements ? <MeasurementGrid {...content.measurements} /> : null}
      {content.score ? <ScoreSheet {...content.score} /> : null}
      {content.checkMatrix ? <CheckMatrix {...content.checkMatrix} /> : null}
      {content.list ? (
        content.listTitle ? (
          <Stack gap="xs">
            <Heading level={5}>{content.listTitle}</Heading>
            <SubList list={content.list} count={count} />
          </Stack>
        ) : (
          <SubList list={content.list} count={count} />
        )
      ) : null}
      {content.matrix ? (
        <Stack gap="xs">
          {content.matrix.title ? <Heading level={5}>{content.matrix.title}</Heading> : null}
          <PermissionMatrix corner={content.matrix.corner} columns={content.matrix.columns} rows={content.matrix.rows} onToggle={content.matrix.onToggle} />
        </Stack>
      ) : null}
      <Sections sections={content.afterSections} />
      {content.evidence ? <EvidenceGrid {...content.evidence} /> : null}
      {content.history ? (
        content.historyTitle ? (
          // Headed as the sections above it are, so the rail reads as one more section of the tab.
          <CrudDetail.Section title={content.historyTitle} variant="flat">
            <HistoryRail {...content.history} />
          </CrudDetail.Section>
        ) : (
          <HistoryRail {...content.history} />
        )
      ) : null}
      {content.changes ? <ChangeHistoryTable history={content.changes.history} denied={!content.changes.history.readable} emptyBody={content.changes.emptyBody} /> : null}
      <RecordNotices notices={content.notices} />
      <RecordNote text={content.note} />
    </Stack>
  );
}


/**
 * The record's head with, at its top right, the way back to a put-away notice (a modal only) and
 * the presentation switch, when the page offers them.
 */
function withHeadControls(head: ReactNode, noticeKeys: readonly string[], presentationSwitch: DetailPresentationSwitchProps | undefined): ReactNode {
  if (noticeKeys.length === 0 && !presentationSwitch) return head;
  return (
    <Flex align="start" justify="between" gap="sm" flex minSize>
      {head}
      <Flex align="center" gap="xs" shrink={false}>
        <RecordNoticeMenu keys={noticeKeys} />
        {presentationSwitch ? <DetailPresentationSwitch {...presentationSwitch} /> : null}
      </Flex>
    </Flex>
  );
}

/**
 * One record, read: its name, its tabs (each with its own verbs), its sections of labelled values,
 * sub-lists with every list feature, the reading verbs, the audit line and the finishing actions.
 *
 * <p>The detail part of {@link CrudPage}. A screen declares what each tab holds and which actions
 * the record offers; how a panel reads is the kit's.
 */
export function RecordDetail({
  title,
  titleCode,
  subtitle,
  figures,
  avatar,
  status,
  history,
  tabs: declaredTabs,
  sections,
  notices,
  note,
  defaultTab,
  verbs,
  actions = [],
  onClose,
  onBack,
  head,
  tabVerbs = "tab",
  tabToggle,
  audit,
  isLoading,
  fieldEnums,
}: RecordDetailProps) {
  const aside = useHistoryAside(history !== undefined);
  // Below the width the aside needs, the history is the end of the first tab (or of the sections of a
  // record with no tabs), headed as the sections above it are.
  const inlineHistory = history && !aside.wide ? ({ history: { nodes: history.nodes }, historyTitle: history.title } as const) : undefined;
  const tabs = inlineHistory && declaredTabs && declaredTabs.length > 0 ? declaredTabs.map((tab, index) => (index === 0 ? { ...tab, ...inlineHistory } : tab)) : declaredTabs;
  const [openTab, setOpenTab] = useState(defaultTab ?? tabs?.[0]?.key ?? "");
  const crud = useCrudPresentation();
  const presentationSwitch = crud?.presentationSwitch;
  // A drawer and a dialog put an overlay over the page header, and its control for put-away cards
  // with it; the record's own head carries the control for the notices it draws.
  const modal = crud?.presentation === "drawer" || crud?.presentation === "dialog";
  const tabsTrailing = tabToggle ? <TabToggle toggle={tabToggle} /> : null;
  const verbsInFooter = tabVerbs === "footer";
  const footerTabVerbs = verbsInFooter ? tabs?.find((tab) => tab.key === openTab)?.verbs : undefined;
  // One tab is no choice: its content is drawn on its own, with no strip naming it.
  const only = tabs && tabs.length === 1 ? tabs[0] : undefined;
  const openTabNotices = (only ?? tabs?.find((tab) => tab.key === openTab))?.notices;
  const noticeKeys = modal ? standingNoticeKeys(notices, openTabNotices) : [];
  const body = only ? (
    <Stack gap="sm">
      {tabsTrailing ? <Flex justify="end">{tabsTrailing}</Flex> : null}
      {verbsInFooter ? null : <RecordVerbs verbs={only.verbs} end />}
      <RecordTabBody content={only} count={only.count} />
    </Stack>
  ) : tabs && tabs.length > 0 ? (
    <Tabs value={openTab} onValueChange={setOpenTab}>
      {/* The strip wraps onto a second line rather than hiding tabs behind a scroll arrow. */}
      <Flex align="center" justify="between" gap="sm" wrap>
        <TabsList variant="underline" className="h-auto flex-wrap">
          {tabs.map((tab) => (
            <CountedTab key={tab.key} value={tab.key} label={tab.label} count={tab.count} missing={tab.missing} disabled={tab.disabled} />
          ))}
        </TabsList>
        {tabsTrailing}
      </Flex>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.key}
          value={tab.key}
          padded
          // The chosen tab's panel rises in, so switching tabs reads as a change of view rather
          // than a flash. Entry motion is tw-animate-css, which stays on the element.
          className="data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1"
        >
          <Stack gap="sm">
            {verbsInFooter ? null : <RecordVerbs verbs={tab.verbs} end />}
            <RecordTabBody content={tab} count={tab.count} />
          </Stack>
        </TabsContent>
      ))}
    </Tabs>
  ) : (
    <Stack gap="sm">
      {tabsTrailing ? <Flex justify="end">{tabsTrailing}</Flex> : null}
      <RecordTabBody content={{ sections, note, ...inlineHistory }} />
    </Stack>
  );

  const detail = (
    <CrudDetail
      isLoading={isLoading}
      header={withHeadControls(
        head ?? <Flex align="center" gap="sm" minSize {...partAttributes(recordHeadStyle, {})}>
          {avatar !== undefined ? <InitialsAvatar name={title} seed={avatar} size="lg" /> : null}
          <Stack gap="none" minSize>
            <Flex align="center" gap="sm" wrap minSize>
              <Heading level={4}>{titleCode ? <Text as="code" font="mono">{title}</Text> : title}</Heading>
              {status ? <RecordValueView value={{ badge: status }} /> : null}
            </Flex>
            {subtitle ? <span {...slotAttributes(recordHeadSubtitleStyle, {})}>{subtitle}</span> : null}
            {figures && figures.length > 0 ? (
              <dl {...slotAttributes(recordHeadFiguresStyle, {})}>
                {figures.map((figure) => (
                  <div key={figure.key} {...slotAttributes(recordHeadFigureStyle, {})}>
                    <dt {...slotAttributes(recordHeadFigureLabelStyle, {})}>{figure.label}</dt>
                    <dd {...slotAttributes(recordHeadFigureValueStyle, {})}>
                      <RecordValueView value={figure.value} />
                      {figure.trend && figure.trend.length > 1 ? (
                        <span aria-hidden className="w-16">
                          <TileSpark shape="line" series={figure.trend} />
                        </span>
                      ) : null}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </Stack>
        </Flex>,
        noticeKeys,
        presentationSwitch,
      )}
      onClose={onClose}
      // The audit line belongs to the record, so it sits under the first tab only: under a tab
      // listing other rows it reads as those rows' stamps (frontend invariant #72).
      auditData={tabs && tabs.length > 1 && openTab !== tabs[0]?.key ? undefined : audit}
      displayZone="Asia/Seoul"
      footer={
        <CrudDetail.DefaultActions {...(onBack ? { onBack } : { onClose })}>
          {footerTabVerbs && footerTabVerbs.length > 0 ? (
            // Two groups, so the row has one place to break: the open tab's verbs above, the
            // record's commands below.
            <Flex gap="xs" wrap justify="end">
              <RecordVerbs verbs={footerTabVerbs} end />
              <Flex gap="xs" wrap justify="end">
                {actions.map((action) => (
                  <RecordVerbButton key={action.label} verb={action} />
                ))}
              </Flex>
            </Flex>
          ) : (
            // One group, so the footer row keeps the commands together at its end rather than
            // spreading each one across the row.
            <Flex gap="xs" wrap justify="end">
              {actions.map((action) => (
                <RecordVerbButton key={action.label} verb={action} />
              ))}
            </Flex>
          )}
        </CrudDetail.DefaultActions>
      }
    >
      <Stack gap="sm">
        {/* Above the body whether or not tabs follow: a notice explains the fields under it, so it is read first. */}
        <RecordNotices notices={notices} />
        <FieldEnumsProvider value={fieldEnums}>{body}</FieldEnumsProvider>
        <Flex justify="end">
          <RecordVerbs verbs={verbs} end />
        </Flex>
      </Stack>
    </CrudDetail>
  );
  return history ? (
    <RecordHistoryLayout layout={aside} history={history}>
      {detail}
    </RecordHistoryLayout>
  ) : (
    detail
  );
}
