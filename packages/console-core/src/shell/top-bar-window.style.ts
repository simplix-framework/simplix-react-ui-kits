import { defineSlotStyle } from "@simplix-react/ui/design";
/** The band across the top of a window with no menu column: the mark at one end, the controls at the other. */
export const consoleBandTopBarStyle = defineSlotStyle({
  slot: "console-band-top-bar",
  as: "part",
  base: "border-b px-4 py-2",
  variants: {},
  defaultVariants: {},
});

/** The destinations and controls of the band: at the far end of the row, and of the second row when they wrap under the mark. */
export const consoleBandControlsStyle = defineSlotStyle({
  slot: "console-band-controls",
  as: "part",
  base: "ml-auto",
  variants: {},
  defaultVariants: {},
});
