import { defineSlotStyle } from "@simplix-react/ui/design";

/** The clock that marks a control, tab or value that is not built yet. */
/**
 * The button an unbuilt action is drawn as. Classic leaves the disabled fade on it; a design may
 * keep the variant's full emphasis and let the mark say that nothing is behind it yet.
 */
export const unbuiltActionStyle = defineSlotStyle({
  slot: "console-unbuilt-action",
  as: "part",
  // Keeps its variant's full emphasis; the clock mark and the tooltip say nothing is behind it yet.
  base: "disabled:opacity-100",
  variants: {},
  defaultVariants: {},
});

export const unbuiltMarkStyle = defineSlotStyle({
  slot: "console-unbuilt-mark",
  base: "opacity-80",
  variants: {},
  defaultVariants: {},
});
