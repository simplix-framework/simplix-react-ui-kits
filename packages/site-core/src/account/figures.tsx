import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import {
  siteDayAxisStyle,
  siteDayBarStyle,
  siteDayLabelStyle,
  siteDaySeriesStyle,
  siteDayStyle,
  siteFigureLabelStyle,
  sitePanelLineStyle,
  sitePanelStyle,
  sitePanelTitleStyle,
  siteQuotaFillStyle,
  siteQuotaLabelsStyle,
  siteQuotaMeterStyle,
  siteQuotaTrackStyle,
  siteTableCardActionsStyle,
  siteTableCardBodyStyle,
  siteTableCardCellStyle,
  siteTableCardHeadStyle,
  siteTableCardMoreStyle,
  siteTableCardRowStyle,
  siteTableCardStyle,
  siteTableCardThStyle,
} from "./account.style";

/** The share of a whole as a width, held between empty and full. */
export const shareWidth = (share: number): string => `${Math.max(0, Math.min(1, Number.isFinite(share) ? share : 0)) * 100}%`;

/** Props for {@link SitePanel}. */
export interface SitePanelProps {
  /** The panel's title (an `h3`), or none. */
  readonly title?: ReactNode;
  /** The panel's accessible name when it is a region of its own ("Last 14 days"). */
  readonly label?: string;
  readonly children: ReactNode;
}

/** A bordered panel inside a section: a meter, a chart, or what the free plan gives. */
export function SitePanel({ title, label, children }: SitePanelProps) {
  return (
    <section {...slotAttributes(sitePanelStyle, {})} aria-label={label}>
      {title !== undefined ? <h3 {...slotAttributes(sitePanelTitleStyle, {})}>{title}</h3> : null}
      {children}
    </section>
  );
}

/** Props for {@link PanelLine}. */
export interface PanelLineProps {
  /** What the line says, muted. */
  readonly children: ReactNode;
  /** At the end, small: the way to more (topping up, the plans). */
  readonly action?: SiteActionSpec;
}

/** A line inside a panel: what it says at the start and an action at the end. */
export function PanelLine({ children, action }: PanelLineProps) {
  return (
    <div {...slotAttributes(sitePanelLineStyle, {})}>
      <span {...slotAttributes(siteFigureLabelStyle, {})}>{children}</span>
      {action !== undefined ? <SiteAction {...action} size="sm" /> : null}
    </div>
  );
}

/** Props for {@link QuotaMeter}. */
export interface QuotaMeterProps {
  /** The share left or used, from 0 to 1. */
  readonly share: number;
  /** The bar's accessible description ("11,760 of 50,000 characters used"). */
  readonly label: string;
  /** What it says at the start (the period) and at the end (what is left). */
  readonly start: ReactNode;
  readonly end: ReactNode;
}

/** A share of an allowance: a bar on the sunken track, with a line at each end under it. */
export function QuotaMeter({ share, label, start, end }: QuotaMeterProps) {
  return (
    <div {...slotAttributes(siteQuotaMeterStyle, {})}>
      <div {...slotAttributes(siteQuotaTrackStyle, {})} role="img" aria-label={label}>
        <i {...slotAttributes(siteQuotaFillStyle, {})} style={{ width: shareWidth(share) }} />
      </div>
      <div {...slotAttributes(siteQuotaLabelsStyle, {})}>
        <span {...slotAttributes(siteFigureLabelStyle, {})}>{start}</span>
        <span {...slotAttributes(siteFigureLabelStyle, {})}>{end}</span>
      </div>
    </div>
  );
}

/** One day of {@link DaySeries}. */
export interface SeriesDay {
  readonly key: string;
  readonly value: number;
  /** What the day says to a screen reader and under the pointer ("Oct 3: 1,240 characters"). */
  readonly label: string;
}

/** Props for {@link DaySeries}. */
export interface DaySeriesProps {
  readonly days: readonly SeriesDay[];
  /** The first and the last day under the bars. */
  readonly from?: ReactNode;
  readonly to?: ReactNode;
  /** The least height a day's bar keeps, as a share of the tallest, so a day without use still shows. */
  readonly floor?: number;
}

/** A day's height as a share of the tallest day, never under the floor. */
export const dayHeight = (value: number, max: number, floor = 0.02): string => `${Math.max(floor, max > 0 ? value / max : 0) * 100}%`;

/** A run of days as bars on one line, the tallest reaching the top; each day is read out by its label. */
export function DaySeries({ days, from, to, floor }: DaySeriesProps) {
  const max = Math.max(1, ...days.map((day) => day.value));
  return (
    <>
      <ol {...slotAttributes(siteDaySeriesStyle, {})}>
        {days.map((day) => (
          <li key={day.key} {...slotAttributes(siteDayStyle, {})} title={day.label}>
            <span {...slotAttributes(siteDayLabelStyle, {})}>{day.label}</span>
            <i {...slotAttributes(siteDayBarStyle, {})} aria-hidden="true" style={{ height: dayHeight(day.value, max, floor) }} />
          </li>
        ))}
      </ol>
      {from !== undefined || to !== undefined ? (
        <div {...slotAttributes(siteDayAxisStyle, {})} aria-hidden="true">
          <span {...slotAttributes(siteFigureLabelStyle, {})}>{from}</span>
          <span {...slotAttributes(siteFigureLabelStyle, {})}>{to}</span>
        </div>
      ) : null}
    </>
  );
}

/** One column of {@link TableCard}. */
export interface TableCardColumn<K extends string> {
  readonly key: K;
  readonly label: ReactNode;
}

/** Props for {@link TableCard}. */
export interface TableCardProps<K extends string> {
  /** The table's accessible name. */
  readonly label: string;
  /** The first column is the row's subject in bold, the last sits at the end (a figure or actions). */
  readonly columns: readonly TableCardColumn<K>[];
  readonly rows: readonly { readonly key: string; readonly cells: Readonly<Record<K, ReactNode>> }[];
  /** For rows that grow: the way to show the next ones, under the table. */
  readonly more?: SiteActionSpec;
}

/**
 * A table on a card: equal columns, a head row on the sunken ground, the first column bold, the
 * middle ones muted and the last one at the end, so figures line up down it. A set that grows past
 * a page passes `more`.
 *
 * <p>Pressing `more` moves the focus to the first row it added once the rows arrive, so a reader on
 * the keyboard reads on from where the table grew. The control is gone after the last page, and the
 * focus would otherwise fall back to the document.
 */
export function TableCard<K extends string>({ label, columns, rows, more }: TableCardProps<K>) {
  const last = columns.length - 1;
  const kindOf = (index: number) => (index === 0 ? "lead" : index === last ? "end" : "value");
  const body = useRef<HTMLTableSectionElement>(null);
  // The row count when `more` was pressed, until the rows it asked for arrive.
  const grownFrom = useRef<number | undefined>(undefined);
  useEffect(() => {
    const from = grownFrom.current;
    if (from === undefined || rows.length <= from) return;
    grownFrom.current = undefined;
    body.current?.rows[from]?.focus();
  }, [rows.length]);
  const pressMore =
    more === undefined
      ? undefined
      : {
          ...more,
          onSelect: (event: MouseEvent<HTMLElement>) => {
            grownFrom.current = rows.length;
            more.onSelect?.(event);
          },
        };
  return (
    <>
      <table {...slotAttributes(siteTableCardStyle, {})} aria-label={label}>
        <thead>
          <tr {...slotAttributes(siteTableCardHeadStyle, {})}>
            {columns.map((column, index) => (
              <th key={column.key} {...slotAttributes(siteTableCardThStyle, { end: index === last && index > 0 })} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={body} {...slotAttributes(siteTableCardBodyStyle, {})}>
          {rows.map((row) => (
            // A row takes the focus only from a script (after `more`), never from Tab.
            <tr key={row.key} tabIndex={-1} {...slotAttributes(siteTableCardRowStyle, {})}>
              {columns.map((column, index) => (
                <td key={column.key} {...slotAttributes(siteTableCardCellStyle, { kind: kindOf(index) })}>
                  {row.cells[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {more !== undefined ? (
        <div {...slotAttributes(siteTableCardMoreStyle, {})}>
          <SiteAction {...(pressMore ?? more)} tone={more.tone ?? "quiet"} size="sm" />
        </div>
      ) : null}
    </>
  );
}

/** Props for {@link TableActions}. */
export interface TableActionsProps {
  readonly actions: readonly SiteActionSpec[];
  /** Where the row stands, a `SiteChip`, drawn before the actions (a refund asked for a payment). */
  readonly badge?: ReactNode;
}

/** A row's small actions in its end cell, wrapping toward the end, after the row's state when it has one. */
export function TableActions({ actions, badge }: TableActionsProps) {
  return (
    <span {...slotAttributes(siteTableCardActionsStyle, {})}>
      {badge}
      {actions.map((action) => (
        <SiteAction key={action.id} {...action} size="sm" />
      ))}
    </span>
  );
}
