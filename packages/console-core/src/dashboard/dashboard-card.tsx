import { type ReactNode, useRef } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { useReflowFlip } from "../layout/use-reflow-flip";

import { figureActionStyle } from "./chart.style";
import {
  dashboardCardBodyStyle,
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
  /** `full` takes the whole row of a {@link DashboardColumns}, for a block read across. */
  readonly span?: "half" | "full";
  /** Words a screen reader hears for the card, when the title alone does not say whose figures they are. */
  readonly description?: string;
  /** The link at the heading's end to the list the card reads, such as 「Open the audit log」. */
  readonly action?: { readonly label: string; readonly onClick: () => void };
  readonly children: ReactNode;
}

/** A dashboard card: a heading row with a legend or context and the link to its list at its right, over a chart or a list. */
export function DashboardCard({ title, trailing, kind = "chart", span = "half", description, action, children }: DashboardCardProps) {
  const meta = typeof trailing === "string" ? <span {...slotAttributes(dashboardCardMetaStyle, {})}>{trailing}</span> : trailing;
  return (
    <section aria-label={description ? `${title}, ${description}` : undefined} className={span === "full" ? "lg:col-span-2" : undefined} {...slotAttributes(dashboardCardStyle, {})}>
      <div className="flex flex-wrap items-center justify-between" {...slotAttributes(dashboardCardHeadStyle, {})}>
        <h3 {...slotAttributes(dashboardCardTitleStyle, {})}>{title}</h3>
        {action ? (
          // The context and the link sit together at the heading's end, one group, so the row breaks in one place.
          <span className="inline-flex min-w-0 flex-wrap items-center justify-end">
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
