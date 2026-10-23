import { defineSlotStyle } from "@simplix-react/ui/design";
/** The scrolling column the page content sits in. */
export const contentColumnStyle = defineSlotStyle({
  slot: "console-content-column",
  base: "px-6 pt-4",
  variants: {},
  defaultVariants: {},
});

/** The measure-capped column, centred in the space beside the menu. */
export const contentColumnBodyStyle = defineSlotStyle({
  slot: "console-content-column-body",
  as: "part",
  base: "mx-auto",
  variants: {},
  defaultVariants: {},
});
