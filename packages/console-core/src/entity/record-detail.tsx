import type { ReactNode } from "react";
import { CrudDetail, DetailFieldWrapper, Flex, Heading, Stack, Tabs, TabsContent, TabsList } from "@simplix-react/ui";

import { slotAttributes } from "@simplix-react/ui/design";

import { CopyableDetailField } from "../clipboard/copyable-detail-field";
import { InitialsAvatar } from "../identity/initials-avatar";
import { CountedTab } from "../layout/page-tabs";
import { RecordNote, RecordNotices, RecordVerbButton, RecordVerbs, type RecordNotice, type RecordVerb } from "./record-blocks";
import { PermissionMatrix, type PermissionMatrixProps } from "./permission-matrix";
import { recordHeadStyle, recordHeadSubtitleStyle } from "./record-detail.style";
import { RecordList, RecordListNestingContext, type RecordListProps } from "./record-list";
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

function Content({ content }: { readonly content: RecordTabContent }): ReactNode {
  return (
    <Stack gap="sm">
      <Sections sections={content.sections} />
      {content.list ? (
        <RecordListNestingContext.Provider value={true}>
          <RecordList {...content.list} />
        </RecordListNestingContext.Provider>
      ) : null}
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
  audit,
  isLoading,
}: RecordDetailProps) {
  const body = tabs && tabs.length > 0 ? (
    <Tabs defaultValue={defaultTab ?? tabs[0]?.key}>
      <TabsList variant="underline">
        {tabs.map((tab) => (
          <CountedTab key={tab.key} value={tab.key} label={tab.label} count={tab.count} />
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.key} value={tab.key} padded>
          <Stack gap="sm">
            <RecordVerbs verbs={tab.verbs} />
            <Content content={tab} />
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
        <Flex align="center" gap="sm" minSize {...slotAttributes(recordHeadStyle, {})}>
          {avatar !== undefined ? <InitialsAvatar name={title} seed={avatar} size="lg" /> : null}
          <Stack gap="none" minSize>
            <Heading level={4} tone="muted">{title}</Heading>
            {subtitle ? <span {...slotAttributes(recordHeadSubtitleStyle, {})}>{subtitle}</span> : null}
          </Stack>
        </Flex>
      }
      onClose={onClose}
      auditData={audit}
      displayZone="Asia/Seoul"
      footer={
        <CrudDetail.DefaultActions onClose={onClose}>
          {actions.map((action) => (
            <RecordVerbButton key={action.label} verb={action} />
          ))}
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
