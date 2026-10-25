import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { DashboardCaption } from "./dashboard-figure";
import {
  dashboardBlockGridStyle,
  dashboardBlockHeadStyle,
  dashboardSplitStyle,
  dashboardStackStyle,
  dashboardTipLineStyle,
  dashboardTipLinesStyle,
} from "./dashboard.style";

/** How far apart the parts of a {@link DashboardStack} sit. */
export type DashboardGap = "none" | "xs" | "sm" | "md" | "lg";

/** Props for {@link DashboardStack}. */
export interface DashboardStackProps {
  /** `xs` for a caption over its part, `sm` for a block's parts, `md` and `lg` for parts that each carry a heading. */
  readonly gap?: DashboardGap;
  readonly children: ReactNode;
}

/** A block's parts, one under the other: its figure, its charts, its lists. */
export function DashboardStack({ gap = "sm", children }: DashboardStackProps) {
  return (
    <div className="flex flex-col" {...slotAttributes(dashboardStackStyle, { gap })}>
      {children}
    </div>
  );
}

/** Props for {@link DashboardSection}. */
export interface DashboardSectionProps {
  /** What the part under it shows. */
  readonly caption: ReactNode;
  /** The space between the caption and the part; `xs` when absent. */
  readonly gap?: DashboardGap;
  readonly children: ReactNode;
}

/** A captioned part inside a block: a caption, then the chart or list it names. */
export function DashboardSection({ caption, gap = "xs", children }: DashboardSectionProps) {
  return (
    <DashboardStack gap={gap}>
      <DashboardCaption>{caption}</DashboardCaption>
      {children}
    </DashboardStack>
  );
}

/** Props for {@link DashboardBlockGrid}. */
export interface DashboardBlockGridProps {
  /**
   * `pairs` sets wide parts two to a row from a wide window on (a bar per kind); `tiles` sets small
   * parts two, three and five to a row as the window widens (a ring per duty).
   */
  readonly layout: "pairs" | "tiles";
  readonly children: ReactNode;
}

/** Parts of one block in a grid: wide parts in pairs, or small parts in a row of tiles. */
export function DashboardBlockGrid({ layout, children }: DashboardBlockGridProps) {
  return (
    <div className={layout === "pairs" ? "grid lg:grid-cols-2" : "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5"} {...slotAttributes(dashboardBlockGridStyle, { layout })}>
      {children}
    </div>
  );
}

/** Props for {@link DashboardSplit}. */
export interface DashboardSplitProps {
  /** The block's main part, two thirds of a wide window. */
  readonly main: ReactNode;
  /** The part read beside it, one third, under it on a narrow window. */
  readonly aside: ReactNode;
}

/** A block in two columns: a main part and a narrower one beside it. */
export function DashboardSplit({ main, aside }: DashboardSplitProps) {
  return (
    <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" {...slotAttributes(dashboardSplitStyle, {})}>
      {main}
      {aside}
    </div>
  );
}

/** Props for {@link DashboardBlockHead}. */
export interface DashboardBlockHeadProps {
  /** At the start: the block's figure. */
  readonly lead?: ReactNode;
  /** At the end: a period or segment switch that changes what the block shows. */
  readonly trailing?: ReactNode;
}

/** The row at the top of a block: its figure at the start, the switch that changes it at the end, wrapping on a narrow window. */
export function DashboardBlockHead({ lead, trailing }: DashboardBlockHeadProps) {
  return (
    <div className="flex flex-wrap items-center justify-between" {...slotAttributes(dashboardBlockHeadStyle, {})}>
      {lead}
      {trailing}
    </div>
  );
}

/** One line of a {@link DashboardTipLines}. */
export interface DashboardTipLine {
  readonly key: string;
  readonly text: ReactNode;
}

/** Props for {@link DashboardTipLines}. */
export interface DashboardTipLinesProps {
  /** The point read, such as the month. */
  readonly title: ReactNode;
  /** One line per series shown at that point. */
  readonly lines: readonly DashboardTipLine[];
}

/** A chart tooltip's reading: the point in bold, then a line per series with its figure. */
export function DashboardTipLines({ title, lines }: DashboardTipLinesProps) {
  return (
    <span className="flex flex-col" {...slotAttributes(dashboardTipLinesStyle, {})}>
      <b>{title}</b>
      {lines.map((line) => (
        <span key={line.key} {...slotAttributes(dashboardTipLineStyle, {})}>
          {line.text}
        </span>
      ))}
    </span>
  );
}
