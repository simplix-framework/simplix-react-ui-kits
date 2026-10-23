import { defineSlotStyle } from "@simplix-react/ui/design";

/** The warning mark on a page number that carries a flagged mark. */
export const printWarnMarkStyle = defineSlotStyle({
  slot: "console-print-warn-mark",
  base: "text-warning",
  variants: {},
  defaultVariants: {},
});

/** The padding around the row of sheets inside the scrolling box. */
export const printSheetRowStyle = defineSlotStyle({
  slot: "console-print-sheet-row",
  as: "part",
  base: "p-2",
  variants: {},
  defaultVariants: {},
});
