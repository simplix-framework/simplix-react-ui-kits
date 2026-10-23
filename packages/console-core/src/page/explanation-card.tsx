import { useCallback, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Flex, Stack, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@simplix-react/ui";

import { RecordNote, RecordNotices, RecordVerbButton, type RecordNotice, type RecordVerb } from "../entity/record-blocks";
import { PACKAGE_NAMESPACE } from "../layout/locales";
import { SizedHead } from "../layout/sized-head";
import { TableCard } from "../layout/table-card";
import { NoticeCard, useNoticeDismissals } from "../notice";
import { explanationBodyStyle } from "./explanation-card.style";
import { slotAttributes } from "@simplix-react/ui/design";

/** Props for {@link ExplanationCard}. */
export interface ExplanationCardProps {
  /** The constant the card is known by, so putting it away is remembered. */
  readonly noticeKey: string;
  readonly title: string;
  /** What the explanation answers, on the card the page shows. */
  readonly hint: string;
  /** The sentence the explanation opens with. */
  readonly lead?: string;
  /** A bounded table: the states, the axes, the kinds the page is about. */
  readonly table?: {
    readonly columns: readonly { readonly header: string; readonly width?: number }[];
    readonly rows: readonly (readonly string[])[];
  };
  readonly notices?: readonly RecordNotice[];
  readonly note?: string;
  /** What the explanation leads on to, beside its close control. */
  readonly action?: RecordVerb;
  /** Open when the address says so (`?help=`), as the page's help spec hands it over. */
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}

/**
 * The explanation a page keeps beside its figures: a card naming what it answers, whose
 * 「설명 보기」 opens the lead, a bounded table, the messages and a note inside the card itself. For
 * what stays true tomorrow, so it is read once and put away rather than spread above the list.
 *
 * <p><b>Opened where it stands.</b> The explanation grows under the card's title rather than over
 * the page, so the rows it explains stay in view while it is read.
 *
 * <p><b>Put away, it is reached from the header.</b> The card registers its button with the
 * header's help list; pressed there while the card is hidden, it brings the card back open.
 */
export function ExplanationCard({ noticeKey, title, hint, lead, table, notices, note, action, open, onOpenChange }: ExplanationCardProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/explanation");
  const dismissals = useNoticeDismissals();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = open ?? uncontrolledOpen;

  // Stable per state, because the header compares it on every render to decide whether its list
  // changed.
  const press = useCallback(() => {
    const hidden = dismissals.ready && dismissals.isHidden(noticeKey);
    const next = hidden ? true : !isOpen;
    if (hidden) dismissals.show(noticeKey);
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [dismissals, noticeKey, isOpen, open, onOpenChange]);

  return (
    <NoticeCard
      noticeKey={noticeKey}
      kind="help"
      title={title}
      hint={hint}
      actionLabel={isOpen ? t("hide") : t("show")}
      onAction={press}
      expanded={isOpen}
      body={
        <Stack gap="md" {...slotAttributes(explanationBodyStyle, {})}>
          <RecordNote text={lead} />
          {table ? (
            <TableCard>
              <Table>
                <TableHeader>
                  <TableRow>
                    {table.columns.map((column) =>
                      column.width ? (
                        <SizedHead key={column.header} width={column.width}>
                          {column.header}
                        </SizedHead>
                      ) : (
                        <TableHead key={column.header}>{column.header}</TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.rows.map((row) => (
                    <TableRow key={row.join("|")}>
                      {row.map((cell, index) => (
                        <TableCell key={`${index}-${cell}`}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableCard>
          ) : null}
          <RecordNotices notices={notices} />
          <RecordNote text={note} />
          {action ? (
            <Flex justify="end">
              <RecordVerbButton verb={action} />
            </Flex>
          ) : null}
        </Stack>
      }
    />
  );
}
