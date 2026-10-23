import { defineSlotStyle } from "@simplix-react/ui/design";

/** The wrapper that pushes its content to the far end of a row. */
export const pushEndStyle = defineSlotStyle({
  slot: "console-push-end",
  base: "ml-auto",
  variants: {},
  defaultVariants: {},
});

/** The wrapper that keeps its content at the near end of a row while the rest goes to the far end. */
export const pushStartStyle = defineSlotStyle({
  slot: "console-push-start",
  base: "mr-auto",
  variants: {},
  defaultVariants: {},
});
