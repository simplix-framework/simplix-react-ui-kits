import { defineSlotStyle } from "@simplix-react/ui/design";

/** The reasons a rejected request names field by field, under the error dialog's sentence. */
export const siteErrorReasonsStyle = defineSlotStyle({
  slot: "site-error-reasons",
  base: "m-0 flex min-w-0 flex-col gap-1 ps-5",
  variants: {},
  defaultVariants: {},
});

/** One field's reason, in the reading size of a pane, as a list item. */
export const siteErrorReasonStyle = defineSlotStyle({
  slot: "site-error-reason",
  base: "list-disc text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) text-(--site-ink)",
  variants: {},
  defaultVariants: {},
});
