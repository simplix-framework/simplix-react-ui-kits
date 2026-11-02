import { useId, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import {
  siteOfferRowAboutStyle,
  siteOfferRowNoteStyle,
  siteOfferRowStyle,
  siteOfferRowTitleStyle,
  sitePriceTableCaptionStyle,
  sitePriceTableCellStyle,
  sitePriceTableColumnStyle,
  sitePriceTableGridStyle,
  sitePriceTableHeadStyle,
  sitePriceTableRowHeadStyle,
  sitePriceTableRowStyle,
  sitePriceTableStyle,
  siteQuestionAnswerStyle,
  siteQuestionAskStyle,
  siteQuestionListStyle,
  siteQuestionStyle,
} from "./pricing.style";

/** Props for {@link OfferRow}. */
export interface OfferRowProps {
  readonly title: ReactNode;
  /** What the offer is, in one line beside the title. */
  readonly about?: ReactNode;
  /** The row's one action, at its end. */
  readonly action?: SiteActionSpec;
  /** A note across the row under it, such as why the action is not open yet; a disabled action is described by it. */
  readonly note?: ReactNode;
}

/** An offer in one row (a team plan to come, extra credits): title, what it is, its action, and a note. */
export function OfferRow({ title, about, action, note }: OfferRowProps) {
  const id = useId();
  const noteId = useId();
  return (
    <section {...slotAttributes(siteOfferRowStyle, {})} aria-labelledby={id}>
      <h3 {...slotAttributes(siteOfferRowTitleStyle, {})} id={id}>
        {title}
      </h3>
      {about !== undefined ? <span {...slotAttributes(siteOfferRowAboutStyle, {})}>{about}</span> : null}
      {action !== undefined ? (
        <SiteAction {...action} describedBy={action.describedBy ?? (action.disabled === true && note !== undefined ? noteId : undefined)} size="sm" />
      ) : null}
      {note !== undefined ? (
        <p {...slotAttributes(siteOfferRowNoteStyle, {})} id={noteId}>
          {note}
        </p>
      ) : null}
    </section>
  );
}

/** One row of a {@link PriceTable}. */
export interface PriceTableRow {
  readonly key: string;
  /** The row's name, read as the header of its values. */
  readonly head: ReactNode;
  /** One value per column after the first. */
  readonly cells: readonly ReactNode[];
}

/** Props for {@link PriceTable}. */
export interface PriceTableProps {
  /** The table's name, drawn over it. */
  readonly caption: ReactNode;
  /** Every column's name, the row names' column first. */
  readonly columns: readonly ReactNode[];
  readonly rows: readonly PriceTableRow[];
}

/** A table of prices or terms on a card: a named column of row names, then a value per column. */
export function PriceTable({ caption, columns, rows }: PriceTableProps) {
  return (
    <section {...slotAttributes(sitePriceTableStyle, {})}>
      <table {...slotAttributes(sitePriceTableGridStyle, {})}>
        <caption {...slotAttributes(sitePriceTableCaptionStyle, {})}>{caption}</caption>
        <thead>
          <tr {...slotAttributes(sitePriceTableHeadStyle, {})}>
            {columns.map((column, index) => (
              <th key={index} {...slotAttributes(sitePriceTableColumnStyle, {})} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} {...slotAttributes(sitePriceTableRowStyle, {})}>
              <th {...slotAttributes(sitePriceTableRowHeadStyle, {})} scope="row">
                {row.head}
              </th>
              {row.cells.map((cell, index) => (
                <td key={index} {...slotAttributes(sitePriceTableCellStyle, {})}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** One question of a {@link QuestionList}. */
export interface SiteQuestion {
  readonly key: string;
  readonly question: ReactNode;
  readonly answer: ReactNode;
}

/** Props for {@link QuestionList}. */
export interface QuestionListProps {
  readonly items: readonly SiteQuestion[];
}

/** Questions people ask before paying, each with its answer: three to a row, one below the medium tier. */
export function QuestionList({ items }: QuestionListProps) {
  return (
    <dl {...slotAttributes(siteQuestionListStyle, {})}>
      {items.map((item) => (
        <div key={item.key} {...slotAttributes(siteQuestionStyle, {})}>
          <dt {...slotAttributes(siteQuestionAskStyle, {})}>{item.question}</dt>
          <dd {...slotAttributes(siteQuestionAnswerStyle, {})}>{item.answer}</dd>
        </div>
      ))}
    </dl>
  );
}
