import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The mark an empty grid cell carries: muted and outlined, so a cell nobody filled never reads as
 * a value and never reads as a verdict.
 */
export const gridEmptyMarkStyle = defineSlotStyle({
  slot: "console-grid-empty-mark",
  as: "part",
  base: "border-dashed text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The reading inside a measured cell, set in tabular figures so a column of readings lines up. */
export const gridReadingStyle = defineSlotStyle({
  slot: "console-grid-reading",
  as: "part",
  base: "tabular-nums",
  variants: {},
  defaultVariants: {},
});

/** The input a measured cell takes while the grid is editable: narrow enough for a reading. */
export const gridReadingInputStyle = defineSlotStyle({
  slot: "console-grid-reading-input",
  as: "part",
  base: "h-8 w-24 tabular-nums",
  variants: {},
  defaultVariants: {},
});
