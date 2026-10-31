import { defineSlotStyle } from "@simplix-react/ui/design";

/** The parts of a work calendar a step apart: its header, its legend and its views. */
export const workCalendarGroupStyle = defineSlotStyle({
  slot: "work-calendar-group",
  base: "",
  variants: { gap: { xs: "gap-1", sm: "gap-2", md: "gap-3" } },
  defaultVariants: { gap: "sm" },
});

/** A view's grid, ruled off from the header above it. */
export const workCalendarRuledStyle = defineSlotStyle({
  slot: "work-calendar-ruled",
  base: "border-t",
  variants: {},
  defaultVariants: {},
});

/** The range the calendar shows, as the header's title. */
export const workCalendarTitleStyle = defineSlotStyle({
  slot: "work-calendar-title",
  base: "text-base font-semibold",
  variants: {},
  defaultVariants: {},
});

/** The legend under the header: every category and state the items are told apart by. */
export const workCalendarLegendStyle = defineSlotStyle({
  slot: "work-calendar-legend",
  base: "gap-x-4 gap-y-1 text-(length:--fs-caption) text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The legend's caption before its categories and before its states. */
export const workCalendarLegendCaptionStyle = defineSlotStyle({
  slot: "work-calendar-legend-caption",
  base: "font-medium text-foreground",
  variants: {},
  defaultVariants: {},
});

/** One entry of the legend: its mark, its icon and its name. */
export const workCalendarLegendEntryStyle = defineSlotStyle({
  slot: "work-calendar-legend-entry",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** A category's colour bar in the legend. */
export const workCalendarLegendBarStyle = defineSlotStyle({
  slot: "work-calendar-legend-bar",
  base: "rounded-sm",
  variants: {},
  defaultVariants: {},
});

/** A state's fill in the legend, drawn the way a chip in that state is filled. */
export const workCalendarLegendSwatchStyle = defineSlotStyle({
  slot: "work-calendar-legend-swatch",
  base: "rounded-sm border bg-card",
  variants: { dashed: { true: "border-dashed", false: "" } },
  defaultVariants: { dashed: false },
});

/** The mark of an item with a warning, and the legend's entry for it. */
export const workCalendarWarningStyle = defineSlotStyle({
  slot: "work-calendar-warning",
  base: "text-[var(--tone-warning)]",
  variants: {},
  defaultVariants: {},
});

/** An item's icons: its categories, its state and its warning. */
export const workCalendarMarksStyle = defineSlotStyle({
  slot: "work-calendar-marks",
  base: "gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** One item as a line: a colour bar, the marks and the title; a wide one is an agenda line. */
export const workCalendarChipStyle = defineSlotStyle({
  slot: "work-calendar-chip",
  base: "gap-1 rounded-[4px] border bg-card pl-2 pr-1 text-left text-(length:--fs-caption) leading-5 hover:bg-muted/60 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    wide: { true: "py-1.5 text-(length:--fs-body-sm)", false: "" },
    dashed: { true: "border-dashed", false: "" },
  },
  defaultVariants: { wide: false, dashed: false },
});

/** An agenda line's time range. */
export const workCalendarChipTimeStyle = defineSlotStyle({
  slot: "work-calendar-chip-time",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** An item's title, quiet when the item's state is drawn translucent. */
export const workCalendarChipTitleStyle = defineSlotStyle({
  slot: "work-calendar-chip-title",
  base: "",
  variants: { quiet: { true: "text-muted-foreground", false: "font-medium" } },
  defaultVariants: { quiet: false },
});

/** An agenda line's first details. */
export const workCalendarChipDetailsStyle = defineSlotStyle({
  slot: "work-calendar-chip-details",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** An item's reading under the pointer. */
export const workCalendarReadingStyle = defineSlotStyle({
  slot: "work-calendar-reading",
  as: "part",
  base: "text-xs",
  variants: {},
  defaultVariants: {},
});

/** A month's name over its grid when two months are shown. */
export const workCalendarMonthTitleStyle = defineSlotStyle({
  slot: "work-calendar-month-title",
  base: "px-1 py-2 text-sm font-semibold",
  variants: {},
  defaultVariants: {},
});

/** A month cell's chips. */
export const workCalendarCellStyle = defineSlotStyle({
  slot: "work-calendar-cell",
  base: "gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** How many more items a month cell holds than it shows. */
export const workCalendarMoreStyle = defineSlotStyle({
  slot: "work-calendar-more",
  base: "px-1 text-(length:--fs-label) font-semibold text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** One day column of the week, tinted on the site's day. */
export const workCalendarDayStyle = defineSlotStyle({
  slot: "work-calendar-day",
  base: "gap-1 border-l px-1.5 pb-3 first:border-l-0",
  variants: { today: { true: "bg-[color-mix(in_srgb,var(--series-1)_6%,var(--card))]", false: "" } },
  defaultVariants: { today: false },
});

/** A day column's heading, which opens that day. */
export const workCalendarDayHeadStyle = defineSlotStyle({
  slot: "work-calendar-day-head",
  base: "gap-1.5 rounded-md px-1 py-2 text-left text-(length:--fs-caption) text-muted-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** A day column's date, in the accent on the site's day. */
export const workCalendarDayNumberStyle = defineSlotStyle({
  slot: "work-calendar-day-number",
  base: "text-(length:--fs-body-sm) font-semibold",
  variants: { today: { true: "text-[var(--series-1)]", false: "text-foreground" } },
  defaultVariants: { today: false },
});

/** The pill naming the site's day. */
export const workCalendarTodayStyle = defineSlotStyle({
  slot: "work-calendar-today",
  base: "rounded-full bg-[color-mix(in_srgb,var(--series-1)_14%,var(--card))] text-(length:--fs-label) text-[var(--series-1)]",
  variants: { place: { week: "px-1.5", agenda: "px-2" } },
  defaultVariants: { place: "week" },
});

/** An agenda day's heading, in the accent on the site's day. */
export const workCalendarAgendaDayStyle = defineSlotStyle({
  slot: "work-calendar-agenda-day",
  base: "gap-2 text-(length:--fs-body-sm) font-semibold",
  variants: { today: { true: "text-[var(--series-1)]", false: "" } },
  defaultVariants: { today: false },
});

/** The line a range with no items shows; the agenda's stands in for the whole view. */
export const workCalendarEmptyStyle = defineSlotStyle({
  slot: "work-calendar-empty",
  base: "rounded-md bg-muted/50 px-4 text-center text-sm text-muted-foreground",
  variants: { tall: { true: "py-10", false: "py-3" } },
  defaultVariants: { tall: false },
});

/** An item's marks pinned to its corner in the day view. */
export const workCalendarOverlayMarksStyle = defineSlotStyle({
  slot: "work-calendar-overlay-marks",
  base: "rounded bg-card/80 px-0.5",
  variants: {},
  defaultVariants: {},
});
