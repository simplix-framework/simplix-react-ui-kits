import { ArrowLeftIcon, Button, Flex, Heading, Stack, Text } from "@simplix-react/ui";

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
  readonly flow?: ApprovalFlowProps;
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

function Head({ header, back, close }: { readonly header: RecordPageHeader; readonly back?: PageBackTarget; readonly close?: () => void }) {
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
      {header.flow ? <ApprovalFlow steps={header.flow.steps} /> : null}
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
  const asPage = !crud || crud.presentation === "page";
  if (!asPage) {
    return <RecordDetail {...detail} head={<Head header={header} />} onClose={crud.close} />;
  }
  return (
    <PageBackProvider value={back}>
      <RecordDetail {...detail} head={<Head header={header} back={back} close={crud?.close} />} onBack={crud?.close} tabVerbs="footer" />
    </PageBackProvider>
  );
}
