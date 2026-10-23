import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

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
  readonly children: ReactNode;
}

/** A dashboard card: a heading row with a legend or context at its right, over a chart or a list. */
export function DashboardCard({ title, trailing, kind = "chart", children }: DashboardCardProps) {
  return (
    <section {...slotAttributes(dashboardCardStyle, {})}>
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2" {...slotAttributes(dashboardColumnsStyle, {})}>
      {children}
    </div>
  );
}
