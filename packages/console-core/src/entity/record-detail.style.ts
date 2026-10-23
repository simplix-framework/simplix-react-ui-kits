import { defineSlotStyle } from "@simplix-react/ui/design";

/** The head of a record panel: the person or thing it is, and what it is to the reader. */
export const recordHeadStyle = defineSlotStyle({
  slot: "console-record-head",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The line under the record's name: its role and where it belongs. The classic design leaves it out. */
export const recordHeadSubtitleStyle = defineSlotStyle({
  slot: "console-record-head-subtitle",
  base: "hidden",
  variants: {},
  defaultVariants: {},
});
