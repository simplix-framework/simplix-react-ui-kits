import { ArrowLeftIcon, Button, Flex, Heading, Stack, Text } from "@simplix-react/ui";
import { useTranslation } from "@simplix-react/i18n/react";
import { partAttributes } from "@simplix-react/ui/design";
import { PACKAGE_NAMESPACE as LAYOUT_NAMESPACE } from "../layout/locales";
import { recordPageFlowStyle } from "./record-page.style";

import { RecordDetail, type RecordDetailProps } from "../entity/record-detail";
import { RecordValueView, type RecordBadge } from "../entity/record-value";
import { ApprovalFlow, type ApprovalFlowProps } from "../layout/approval-flow";
import { useCrudPresentation } from "./crud-page";
import { PageBackProvider, usePageBackLink, type PageBackTarget } from "./page-back";

/** The fixed head of a {@link RecordPage}. */
export interface RecordPageHeader {
  /** The record's identifier as the reader names it. */
  readonly title: string;
  readonly subtitle?: string;
  /** Where the record stands: its status and any other standing it carries. */
  readonly badges: readonly RecordBadge[];
  /** The approval chain the record is in, drawn under the name. */
  readonly flow?: ApprovalFlowProps & {
    /** The heading over the chain where it stands beside the record; 「진행 단계」 when absent. */
    readonly title?: string;
  };
}

/** Props for {@link RecordPage}. */
export interface RecordPageProps {
  readonly header: RecordPageHeader;
  /** Tabs, sections and commands, read by {@link RecordDetail}'s rules. */
  readonly detail: Omit<RecordDetailProps, "onClose">;
  /** The list the page returns to. */
  readonly back: PageBackTarget;
}

/** The way back: the menu's link where every segment is known, otherwise the page's own close. */
function BackControl({ back, close }: { readonly back: PageBackTarget; readonly close?: () => void }) {
  const link = usePageBackLink();
  if (link) return <>{link}</>;
  if (!close) return null;
  return (
    // A bordered button rather than a quiet link: on a record opened as a page it is the one way
    // back to the list, and a reader has to find it before anything else on the page.
    <Button variant="outline" size="sm" className="self-start" onClick={close}>
      <ArrowLeftIcon />
      {back.label}
    </Button>
  );
}

function Head({ header, back, close, flow = true }: { readonly header: RecordPageHeader; readonly back?: PageBackTarget; readonly close?: () => void; readonly flow?: boolean }) {
  return (
    <Stack gap="xs" minSize flex>
      {back ? <BackControl back={back} close={close} /> : null}
      <Flex align="center" gap="sm" wrap minSize>
        <Heading level={4}>{header.title}</Heading>
        {header.badges.length > 0 ? <RecordValueView value={{ badges: header.badges }} /> : null}
      </Flex>
      {header.subtitle ? (
        <Text size="caption" tone="muted">
          {header.subtitle}
        </Text>
      ) : null}
      {flow && header.flow ? <ApprovalFlow steps={header.flow.steps} /> : null}
    </Stack>
  );
}

/**
 * A workspace record opened as a page: a fixed head with its identifier, status badges and
 * approval chain, the record's tabs, and a command row under them, with the way back to its list
 * always drawn.
 *
 * <p><b>One component for every presentation of the same record.</b> Inside a {@link CrudPage}
 * presented as a panel, drawer or dialog it draws the plain {@link RecordDetail} with the same
 * head and closes the way that presentation closes; only as a page (or outside a CrudPage) does it
 * add the back control and move the open tab's verbs into the command row, which breaks into the
 * tab's verbs above and the record's commands below when one line will not hold them.
 */
export function RecordPage({ header, detail, back }: RecordPageProps) {
  const crud = useCrudPresentation();
  const { t } = useTranslation(`${LAYOUT_NAMESPACE}/flow`);
  const asPage = !crud || crud.presentation === "page";
  if (!asPage) {
    return <RecordDetail {...detail} head={<Head header={header} />} onClose={crud.close} />;
  }
  const record = (
    <RecordDetail {...detail} head={<Head header={header} back={back} close={crud?.close} flow={false} />} onBack={crud?.close} tabVerbs="footer" />
  );
  return (
    <PageBackProvider value={back}>
      {header.flow ? (
        // A page has the width for the chain to run down a column beside the record, where it stays
        // in sight while the record scrolls instead of pushing the record down.
        <Flex align="start" gap="md" minSize>
          <Stack flex minSize>
            {record}
          </Stack>
          <Stack gap="sm" className="w-64 shrink-0" {...partAttributes(recordPageFlowStyle, {})}>
            <Text size="caption" tone="muted">
              {header.flow.title ?? t("title")}
            </Text>
            <ApprovalFlow steps={header.flow.steps} orientation="vertical" />
          </Stack>
        </Flex>
      ) : (
        record
      )}
    </PageBackProvider>
  );
}
