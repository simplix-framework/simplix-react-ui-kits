import type { ReactNode } from "react";
import { DigitRoll } from "@simplix-react/ui/interaction";
import { slotAttributes } from "@simplix-react/ui/design";

import {
  chartCaptionStyle,
  chartEmptyStyle,
  chartSkeletonStyle,
  dashboardSkeletonStyle,
  figureActionStyle,
  figureButtonStyle,
  figureContextStyle,
  figureReadingStyle,
  figureRowStyle,
  figureStaticStyle,
  figureUnitStyle,
  figureValueStyle,
} from "./chart.style";
import { HeadLink } from "./head-link";

/** Props for {@link DashboardFigure}. */
export interface DashboardFigureProps {
  readonly value: number;
  readonly unit?: string;
  /** What the figure counts and against what, beside it, such as 「작업 중 허가 · 대기 3건」. */
  readonly context: ReactNode;
  /** `danger` when the figure is something past due; a zero is always muted. */
  readonly tone?: "neutral" | "danger" | "warning";
  /** A small chart beside the context, such as a sparkline of the last months. */
  readonly trailing?: ReactNode;
  /** A link at the right to the screen behind the figure, such as 「입조 현황 보기」; an `href` draws it as a link, as on a card's `action`. */
  readonly action?: { readonly label: string; readonly onClick: () => void; readonly href?: string };
  /** Opens the list the figure counts. */
  readonly onClick?: () => void;
  /** The address the figure opens: with it the figure is a link and `onClick` runs on a plain press. */
  readonly href?: string;
  /** Words a screen reader hears for the whole figure. */
  readonly label: string;
}

/**
 * The one number a dashboard block leads with, rolling to its value, with its context beside it.
 * A zero is drawn muted so a quiet block reads as quiet; the figure opens the list it counts.
 */
export function DashboardFigure({ value, unit = "건", context, tone = "neutral", trailing, action, onClick, href, label }: DashboardFigureProps) {
  const body = (
    <>
      <span className="inline-flex items-baseline" {...slotAttributes(figureReadingStyle, {})}>
        <span {...slotAttributes(figureValueStyle, { tone: value === 0 ? "muted" : tone })}>
          <DigitRoll value={value} />
        </span>
        <span {...slotAttributes(figureUnitStyle, {})}>{unit}</span>
      </span>
      <span {...slotAttributes(figureContextStyle, {})}>{context}</span>
    </>
  );
  return (
    <div className="flex flex-wrap items-center justify-between" {...slotAttributes(figureRowStyle, {})}>
      {onClick ? (
        <HeadLink href={href} onClick={onClick} label={label} className="inline-flex flex-wrap items-baseline" attributes={slotAttributes(figureButtonStyle, {})}>
          {body}
        </HeadLink>
      ) : (
        <span aria-label={label} className="inline-flex flex-wrap items-baseline" {...slotAttributes(figureStaticStyle, {})}>
          {body}
        </span>
      )}
      {trailing}
      {action ? (
        <HeadLink href={action.href} onClick={action.onClick} className="inline-block" attributes={slotAttributes(figureActionStyle, {})}>
          {action.label}
        </HeadLink>
      ) : null}
    </div>
  );
}

/** Stand-in shapes in a block's place while its data is on the way: a figure and a few rows. */
export function DashboardSkeleton({ rows = 3 }: { readonly rows?: number }) {
  return (
    <div aria-hidden className="flex flex-col" {...slotAttributes(dashboardSkeletonStyle, {})}>
      <i className="block h-7 w-24" {...slotAttributes(chartSkeletonStyle, {})} />
      {Array.from({ length: rows }, (_, i) => (
        <i key={i} className="block h-3" style={{ width: `${88 - i * 14}%` }} {...slotAttributes(chartSkeletonStyle, {})} />
      ))}
    </div>
  );
}

/** A small heading over a part inside a block. */
export function DashboardCaption({ children }: { readonly children: ReactNode }) {
  return <span {...slotAttributes(chartCaptionStyle, {})}>{children}</span>;
}

/** The line a block or a part shows when it has nothing to show. */
export function DashboardEmpty({ children }: { readonly children: ReactNode }) {
  return <p {...slotAttributes(chartEmptyStyle, {})}>{children}</p>;
}
