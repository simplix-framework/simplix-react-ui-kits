import { type ReactNode, useRef } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { useReflowFlip } from "../layout/use-reflow-flip";

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
  readonly children: ReactNode;
}

/** A dashboard card: a heading row with a legend or context at its right, over a chart or a list. */
export function DashboardCard({ title, trailing, kind = "chart", span = "half", description, children }: DashboardCardProps) {
  return (
    <section aria-label={description ? `${title}, ${description}` : undefined} className={span === "full" ? "lg:col-span-2" : undefined} {...slotAttributes(dashboardCardStyle, {})}>
      <div className="flex flex-wrap items-center justify-between" {...slotAttributes(dashboardCardHeadStyle, {})}>
        <h3 {...slotAttributes(dashboardCardTitleStyle, {})}>{title}</h3>
        {typeof trailing === "string" ? <span {...slotAttributes(dashboardCardMetaStyle, {})}>{trailing}</span> : trailing}
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
