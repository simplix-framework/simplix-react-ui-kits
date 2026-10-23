import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@simplix-react/ui";

import { RecordNote, RecordNotices, RecordVerbButton, type RecordNotice, type RecordVerb } from "../entity/record-blocks";
import { SizedHead } from "../layout/sized-head";
import { TableCard } from "../layout/table-card";
import { HelpCard } from "../manual/help-card";

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
 * The explanation a page keeps beside its figures: a card naming what it answers, opening a
 * dialog with the lead, a bounded table, the messages and a note. For what stays true tomorrow,
 * so it is read once and put away rather than spread above the list.
 */
export function ExplanationCard({ noticeKey, title, hint, lead, table, notices, note, action, open, onOpenChange }: ExplanationCardProps) {
  return (
    <HelpCard
      noticeKey={noticeKey}
      title={title}
      hint={hint}
      wide
      open={open}
      onOpenChange={onOpenChange}
      action={action ? <RecordVerbButton verb={action} /> : undefined}
    >
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
    </HelpCard>
  );
}
