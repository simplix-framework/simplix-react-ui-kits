import { defineSlotStyle } from "@simplix-react/ui/design";

/** A dashboard card: a heading row over a chart or a list. */
export const dashboardCardStyle = defineSlotStyle({
  slot: "dashboard-card",
  base: "rounded-lg border bg-card text-card-foreground shadow-sm",
  variants: {},
  defaultVariants: {},
});

/** The card's heading row: its title, and a legend or a line of context at the right. */
export const dashboardCardHeadStyle = defineSlotStyle({
  slot: "dashboard-card-head",
  base: "gap-3 px-4 pb-1 pt-3.5",
  variants: {},
  defaultVariants: {},
});

/** What the card shows. */
export const dashboardCardTitleStyle = defineSlotStyle({
  slot: "dashboard-card-title",
  base: "text-sm font-semibold",
  variants: {},
  defaultVariants: {},
});

/** A line of context at the right of the heading. */
export const dashboardCardMetaStyle = defineSlotStyle({
  slot: "dashboard-card-meta",
  base: "text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The region under the heading a chart is drawn in. */
export const dashboardCardBodyStyle = defineSlotStyle({
  slot: "dashboard-card-body",
  base: "px-3 pb-2.5 pt-1",
  variants: {
    kind: { chart: "", list: "px-2 pb-2 pt-0.5" },
  },
  defaultVariants: { kind: "chart" },
});

/** Cards side by side, two to a row. */
export const dashboardColumnsStyle = defineSlotStyle({
  slot: "dashboard-columns",
  base: "gap-3",
  variants: {},
  defaultVariants: {},
});

/** A block's parts one under the other. */
export const dashboardStackStyle = defineSlotStyle({
  slot: "dashboard-stack",
  base: "",
  variants: {
    gap: { none: "", xs: "gap-1", sm: "gap-2", md: "gap-3", lg: "gap-4" },
  },
  defaultVariants: { gap: "sm" },
});

/** A block's parts in pairs or in a row of tiles. */
export const dashboardBlockGridStyle = defineSlotStyle({
  slot: "dashboard-block-grid",
  base: "",
  variants: {
    layout: { pairs: "gap-x-8 gap-y-4", tiles: "gap-1" },
  },
  defaultVariants: { layout: "pairs" },
});

/** A block in a main column and a narrower one. */
export const dashboardSplitStyle = defineSlotStyle({
  slot: "dashboard-split",
  base: "gap-4",
  variants: {},
  defaultVariants: {},
});

/** The row at the top of a block: its figure and its switch. */
export const dashboardBlockHeadStyle = defineSlotStyle({
  slot: "dashboard-block-head",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** A chart tooltip's lines. */
export const dashboardTipLinesStyle = defineSlotStyle({
  slot: "dashboard-tip-lines",
  base: "gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** One series' line in a chart tooltip. */
export const dashboardTipLineStyle = defineSlotStyle({
  slot: "dashboard-tip-line",
  base: "tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** One entry of the day's schedule. */
export const scheduleRowStyle = defineSlotStyle({
  slot: "schedule-row",
  base: "min-h-11 gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted/50 active:bg-muted focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    past: { true: "text-muted-foreground", false: "" },
    dense: { true: "py-1.5", false: "" },
  },
  defaultVariants: { past: false, dense: false },
});

/** The entry's start time. */
export const scheduleTimeStyle = defineSlotStyle({
  slot: "schedule-time",
  base: "font-medium tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** What happens then. */
export const scheduleTaskStyle = defineSlotStyle({
  slot: "schedule-task",
  base: "font-medium",
  variants: {
    past: { true: "font-normal", false: "" },
  },
  defaultVariants: { past: false },
});

/** Where it happens. */
export const scheduleZoneStyle = defineSlotStyle({
  slot: "schedule-zone",
  base: "gap-1 text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The arrow at the end of the entry, which moves under the pointer. */
export const scheduleGoStyle = defineSlotStyle({
  slot: "schedule-go",
  base: "text-muted-foreground transition-transform group-hover:translate-x-[3px] group-hover:text-foreground",
  variants: {},
  defaultVariants: {},
});

/** The rule at the current time, between what is past and what is still to come. */
export const scheduleNowStyle = defineSlotStyle({
  slot: "schedule-now",
  base: "mx-2.5 gap-2.5 text-(length:--fs-label) font-semibold tabular-nums text-destructive after:h-px after:bg-destructive after:opacity-50",
  variants: {},
  defaultVariants: {},
});

/** A task row's title. */
export const taskTitleStyle = defineSlotStyle({
  slot: "task-title",
  base: "font-medium",
  variants: {},
  defaultVariants: {},
});

/** Who or what the task concerns, under its title. */
export const taskSubStyle = defineSlotStyle({
  slot: "task-sub",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** When the task is due, under its badge. */
export const taskDueStyle = defineSlotStyle({
  slot: "task-due",
  base: "text-xs tabular-nums text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The line a card shows when it has nothing to list. */
export const taskEmptyStyle = defineSlotStyle({
  slot: "task-empty",
  base: "px-2.5 py-3 text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** A task's badge over its due date, at the row's end. */
export const taskSideStyle = defineSlotStyle({
  slot: "task-side",
  base: "gap-0.5",
  variants: {},
  defaultVariants: {},
});
