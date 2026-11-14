import { useId, useState, type ReactNode } from "react";
import {
  CrudDetail,
  DetailFieldWrapper,
  Flex,
  Label,
  Switch,
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
import { RecordNote, RecordNoticeMenu, RecordNotices, RecordVerbButton, RecordVerbs, standingNoticeKeys } from "./record-blocks";
import { PermissionMatrix } from "./permission-matrix";
import {
  recordHeadFigureLabelStyle,
  recordHeadFigureStyle,
  recordHeadFigureValueStyle,
  recordHeadFiguresStyle,
  recordHeadStyle,
  recordHeadSubtitleStyle,
} from "./record-detail.style";
import { TileSpark } from "../layout/tile-spark";
import { copyTextOf, RecordValueView } from "./record-value";
import { StageGate } from "./stage-gate";
import { EvidenceGrid } from "../attachment/evidence-grid";
import { ApprovalFlow } from "../layout/approval-flow";
import { CheckMatrix } from "../layout/check-matrix";
import { MeasurementGrid } from "../layout/measurement-grid";
import { FormSheet } from "../screen/form-sheet";
import { HistoryRail } from "../screen/history-rail";
import { RecordHistoryLayout, useHistoryAside } from "./record-history-layout";
import { ChangeHistoryTable, FieldEnumsProvider } from "../identity/change-history";
import { ScoreSheet } from "../screen/score-sheet";
import { useCrudPresentation } from "../page/crud-page";
import { DetailPresentationSwitch, type DetailPresentationSwitchProps } from "../page/detail-presentation-switch";
import type { RecordDetailProps, RecordSection, RecordTabContent, RecordTabToggle } from "./record-detail-types";
import { SubList } from "./record-detail-sublist";

function TabToggle({ toggle }: { readonly toggle: RecordTabToggle }) {
  const id = useId();
  return (
    <Flex align="center" gap="xs" className="shrink-0">
      <Switch id={id} checked={toggle.on} onCheckedChange={(on) => toggle.onChange(on === true)} />
      <Label htmlFor={id}>{toggle.label}</Label>
    </Flex>
  );
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

export * from "./record-detail-types";
export * from "./record-detail-sublist";
