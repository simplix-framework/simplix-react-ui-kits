import { type ReactNode, useRef } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { useReflowFlip } from "../layout/use-reflow-flip";

import { type DashboardSpan, spanAt, useDashboardGridColumns } from "./dashboard-grid";

import { figureActionStyle } from "./chart.style";
import {
  dashboardCardBodyStyle,
  dashboardCardEndStyle,
  dashboardCardHeadStyle,
  dashboardCardMetaStyle,
  dashboardCardStyle,
  dashboardCardTitleStyle,
  dashboardColumnsStyle,
} from "./dashboard.style";

/** Props for {@link DashboardCard}. */
export interface DashboardCardProps {
  /** What the card shows. */
  readonly title: string;
  /** At the right of the heading: a chart's legend, or a line of context such as the workplace. */
  readonly trailing?: ReactNode;
  /** `chart` pads for a plot, `list` for rows that carry their own padding. */
  readonly kind?: "chart" | "list";
  /**
   * The columns the card takes. In a `DashboardGrid`: 1 for a number or a meter, 2 for a series, a
   * breakdown or a short list, 4 for a wide table or an event list; the whole row where the grid has
   * fewer columns. In a {@link DashboardColumns}: `half`, or `full` for a block read across.
   */
  readonly span?: "half" | "full" | DashboardSpan;
  /** Words a screen reader hears for the card, when the title alone does not say whose figures they are. */
  readonly description?: string;
  /** The link at the heading's end to the list the card reads, such as 「Open the audit log」. */
  readonly action?: { readonly label: string; readonly onClick: () => void };
  readonly children: ReactNode;
}

/** A dashboard card: a heading row with a legend or context and the link to its list at its right, over a chart or a list. */
export function DashboardCard({ title, trailing, kind = "chart", span = "half", description, action, children }: DashboardCardProps) {
  const meta = typeof trailing === "string" ? <span {...slotAttributes(dashboardCardMetaStyle, {})}>{trailing}</span> : trailing;
  const columns = useDashboardGridColumns();
  const gridSpan = typeof span === "number" && columns !== null ? spanAt(span, columns) : undefined;
  return (
    <section
      aria-label={description ? `${title}, ${description}` : undefined}
      className={span === "full" ? "lg:col-span-2" : undefined}
      data-span={typeof span === "number" ? span : undefined}
      style={gridSpan ? { gridColumn: `span ${gridSpan} / span ${gridSpan}` } : undefined}
      {...slotAttributes(dashboardCardStyle, {})}
    >
      <div className="flex flex-wrap items-center justify-between" {...slotAttributes(dashboardCardHeadStyle, {})}>
        <h3 {...slotAttributes(dashboardCardTitleStyle, {})}>{title}</h3>
        {action ? (
          // The context and the link sit together at the heading's end, one group, so the row breaks in one place.
          <span {...slotAttributes(dashboardCardEndStyle, {})}>
            {meta}
            <button type="button" onClick={action.onClick} {...slotAttributes(figureActionStyle, {})}>
              {action.label}
            </button>
          </span>
        ) : (
          meta
        )}
      </div>
      <div className="relative" {...slotAttributes(dashboardCardBodyStyle, { kind })}>
        {children}
      </div>
    </section>
  );
}

/** Cards side by side, two to a row, one to a row on a narrow window. */
export function DashboardColumns({ children }: { readonly children: ReactNode }) {
  const columns = useRef<HTMLDivElement>(null);
  // Crossing the breakpoint stacks the cards or sets them side by side; they glide to the new place.
  useReflowFlip(columns, ":scope > *", []);
  return (
    <div ref={columns} className="grid grid-cols-1 lg:grid-cols-2" {...slotAttributes(dashboardColumnsStyle, {})}>
      {children}
    </div>
  );
}
