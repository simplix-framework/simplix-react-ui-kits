import { defineSlotStyle } from "@simplix-react/ui/design";

/** The glyph button a count is pinned to. */
export const countedButtonStyle = defineSlotStyle({
  slot: "console-counted-button",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The count, pinned to the button's top corner. */
export const countedCountStyle = defineSlotStyle({
  slot: "console-counted-count",
  as: "part",
  base: "-right-0.5 -top-0.5",
  variants: {},
  defaultVariants: {},
});
