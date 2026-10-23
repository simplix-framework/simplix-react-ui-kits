import { defineSlotStyle } from "@simplix-react/ui/design";

/** The surface that lists the fields a submit refused. */
export const formErrorCardStyle = defineSlotStyle({
  slot: "console-form-error-card",
  base: "rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2",
  variants: {},
  defaultVariants: {},
});

/** The line naming the refused fields, a shade under the title's red. */
export const formErrorFieldsStyle = defineSlotStyle({
  slot: "console-form-error-fields",
  as: "part",
  base: "text-destructive/90",
  variants: {},
  defaultVariants: {},
});
