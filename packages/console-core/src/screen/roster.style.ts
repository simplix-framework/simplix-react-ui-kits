import { defineSlotStyle } from "@simplix-react/ui/design";

/** A roster column's head or cell, centred under the day it counts. */
export const rosterCellStyle = defineSlotStyle({
  slot: "console-roster-cell",
  as: "part",
  base: "text-center",
  variants: {},
  defaultVariants: {},
});

/**
 * The unassigned mark: an outline badge in the muted colour. The badge has no quiet variant -
 * every filled one reads as a value, which is the one thing 「미배정」 must not do.
 */
export const rosterUnassignedStyle = defineSlotStyle({
  slot: "console-roster-unassigned",
  as: "part",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
