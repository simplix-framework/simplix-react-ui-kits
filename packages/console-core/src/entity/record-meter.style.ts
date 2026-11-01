import { defineSlotStyle } from "@simplix-react/ui/design";

/** A spent-of-limit reading in a cell or a field: the bar, then the two figures. */
export const recordMeterStyle = defineSlotStyle({
  slot: "record-meter",
  base: "inline-flex min-w-0 w-full flex-col gap-1",
  variants: {},
  defaultVariants: {},
});

/** The bar's track, the whole of the limit. */
export const recordMeterTrackStyle = defineSlotStyle({
  slot: "record-meter-track",
  base: "relative h-1.5 w-full overflow-hidden rounded-full bg-muted",
  variants: {},
  defaultVariants: {},
});

/** The share of the limit spent, coloured by how near the limit it stands. */
export const recordMeterFillStyle = defineSlotStyle({
  slot: "record-meter-fill",
  base: "absolute inset-y-0 left-0 rounded-full bg-[var(--mark)]",
  variants: {},
  defaultVariants: {},
});

/** The figures under the bar: spent of limit, and the share. */
export const recordMeterFiguresStyle = defineSlotStyle({
  slot: "record-meter-figures",
  base: "flex items-baseline justify-between gap-2 text-xs tabular-nums text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
