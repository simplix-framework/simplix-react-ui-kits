import { useState, type ReactNode } from "react";
import {
  CrudDetail,
  DetailFieldWrapper,
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Flex,
  Grid,
  Heading,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
} from "@simplix-react/ui";

import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { CopyableDetailField } from "../clipboard/copyable-detail-field";
import { InitialsAvatar } from "../identity/initials-avatar";
import { CountedTab } from "../layout/page-tabs";
import { RecordNote, RecordNotices, RecordVerbButton, RecordVerbs, type RecordNotice, type RecordVerb } from "./record-blocks";
import { PermissionMatrix, type PermissionMatrixProps } from "./permission-matrix";
import { BoundedDialogContent } from "../layout/bounded-dialog-content";
import { recordHeadStyle, recordHeadSubtitleStyle, recordSublistStyle } from "./record-detail.style";
import { RecordList, RecordListNestingContext, type RecordAction, type RecordColumn, type RecordListProps } from "./record-list";
import { RecordValueView, type RecordValue } from "./record-value";

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
  readonly sections?: readonly RecordSection[];
  /** A sub-collection, drawn with every list feature unless the tab turns one off. */
  // The rows of a sub-list are the screen's own type, so the tab carries them untyped.
  readonly list?: RecordListProps<any>;
  /** What a role may do, by area and action, under the sections. */
  readonly matrix?: PermissionMatrixProps & { readonly title?: string };
  /** Sections drawn after the matrix: what the matrix alone cannot say. */
  readonly afterSections?: readonly RecordSection[];
  readonly notices?: readonly RecordNotice[];
  readonly note?: string;
}

/** One tab of a {@link RecordDetail}. */
export interface RecordTab extends RecordTabContent {
  readonly key: string;
  readonly label: string;
  readonly count?: number;
  /** The tab's own verbs, which change with the open tab. */
  readonly verbs?: readonly RecordVerb[];
}

/** Props for {@link RecordDetail}. */
export interface RecordDetailProps {
  /** What the record is called, at the head of the panel. */
  readonly title: string;
  /** What the record is to the reader, under its name: a role and where it belongs. */
  readonly subtitle?: string;
  /** Draws the person the record is beside the name, tinted by this seed (their id). */
  readonly avatar?: string;
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
  /** Who made it and when it last changed, at the foot. */
  readonly audit?: { readonly id?: string; readonly createdAt?: string; readonly updatedAt?: string };
  readonly isLoading?: boolean;
}

function Sections({ sections }: { readonly sections?: readonly RecordSection[] }) {
  if (!sections) return null;
  return (
    <>
      {sections.map((section) => (
        <CrudDetail.Section key={section.key} title={section.title} variant="flat" layout="two-column">
          {section.fields.map((field) =>
            field.copy && typeof field.value === "string" ? (
              <CopyableDetailField key={field.label} label={field.label} layout="inline" value={field.value} className={field.wide ? "col-span-full" : undefined} />
            ) : (
              <DetailFieldWrapper key={field.label} label={field.label} layout="inline" className={field.wide ? "col-span-full" : undefined}>
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
const COMPACT_LIMIT = 5;

/** Which of the two in-detail list forms a tab's rows take. */
export function sublistKind(rows: number, count: number | undefined): "compact" | "full" {
  const complete = count === undefined || count === rows;
  return complete && rows <= COMPACT_LIMIT ? "compact" : "full";
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

/**
 * One row of an in-detail list, opened over the record: its first column as the title, every
 * column as a labelled value, the list's row actions as the dialog's buttons. A row click inside a
 * detail opens this rather than replacing the panel or leaving the page.
 */
function RecordRowDialog<Row>({
  row,
  columns,
  actions,
  onClose,
}: {
  readonly row: Row | null;
  readonly columns: readonly RecordColumn<Row>[];
  readonly actions: readonly RecordAction<Row>[];
  readonly onClose: () => void;
}) {
  const verbs = (danger: boolean): RecordVerb[] =>
    row === null
      ? []
      : actions
          .filter((action) => DESTRUCTIVE_ACTIONS.has(action.type) === danger)
          .map((action) => ({
            label: action.label,
            kind: danger ? "danger" : "plain",
            disabled: action.disabled?.(row) || undefined,
            onClick: () => {
              action.onClick?.(row);
              onClose();
            },
          }));
  const danger = verbs(true);
  const plain = verbs(false);
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
 * {@link RecordRowDialog}; a screen's own `onRowClick` is not used inside a detail.
 */
function SubList({ list, count }: { readonly list: RecordListProps<any>; readonly count: number | undefined }) {
  const [opened, setOpened] = useState<unknown | null>(null);
  const kind = sublistKind(list.rows.length, count);
  const features = kind === "compact" ? { ...list.features, ...COMPACT_FEATURES } : { ...list.features, ...FULL_FEATURES };
  return (
    <div {...slotAttributes(recordSublistStyle, { kind })}>
      <RecordListNestingContext.Provider value={true}>
        <RecordList {...list} features={features} onRowClick={(row) => setOpened(row)} />
      </RecordListNestingContext.Provider>
      <RecordRowDialog row={opened} columns={list.columns} actions={list.actions ?? []} onClose={() => setOpened(null)} />
    </div>
  );
}

function Content({ content, count }: { readonly content: RecordTabContent; readonly count?: number }): ReactNode {
  return (
    <Stack gap="sm">
      <Sections sections={content.sections} />
      {content.list ? <SubList list={content.list} count={count} /> : null}
      {content.matrix ? (
        <Stack gap="xs">
          {content.matrix.title ? <Heading level={5}>{content.matrix.title}</Heading> : null}
          <PermissionMatrix corner={content.matrix.corner} columns={content.matrix.columns} rows={content.matrix.rows} />
        </Stack>
      ) : null}
      <Sections sections={content.afterSections} />
      <RecordNotices notices={content.notices} />
      <RecordNote text={content.note} />
    </Stack>
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
  subtitle,
  avatar,
  tabs,
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
  audit,
  isLoading,
}: RecordDetailProps) {
  const [openTab, setOpenTab] = useState(defaultTab ?? tabs?.[0]?.key ?? "");
  const verbsInFooter = tabVerbs === "footer";
  const footerTabVerbs = verbsInFooter ? tabs?.find((tab) => tab.key === openTab)?.verbs : undefined;
  const body = tabs && tabs.length > 0 ? (
    <Tabs value={openTab} onValueChange={setOpenTab}>
      <TabsList variant="underline">
        {tabs.map((tab) => (
          <CountedTab key={tab.key} value={tab.key} label={tab.label} count={tab.count} />
        ))}
      </TabsList>
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
            <Content content={tab} count={tab.count} />
          </Stack>
        </TabsContent>
      ))}
    </Tabs>
  ) : (
    <Content content={{ sections, notices, note }} />
  );

  return (
    <CrudDetail
      isLoading={isLoading}
      header={
        head ?? <Flex align="center" gap="sm" minSize {...partAttributes(recordHeadStyle, {})}>
          {avatar !== undefined ? <InitialsAvatar name={title} seed={avatar} size="lg" /> : null}
          <Stack gap="none" minSize>
            <Heading level={4}>{title}</Heading>
            {subtitle ? <span {...slotAttributes(recordHeadSubtitleStyle, {})}>{subtitle}</span> : null}
          </Stack>
        </Flex>
      }
      onClose={onClose}
      auditData={audit}
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
            actions.map((action) => <RecordVerbButton key={action.label} verb={action} />)
          )}
        </CrudDetail.DefaultActions>
      }
    >
      <Stack gap="sm">
        {tabs && tabs.length > 0 ? <RecordNotices notices={notices} /> : null}
        {body}
        <Flex justify="end">
          <RecordVerbs verbs={verbs} end />
        </Flex>
      </Stack>
    </CrudDetail>
  );
}
