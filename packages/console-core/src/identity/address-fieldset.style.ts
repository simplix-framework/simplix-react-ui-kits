import { defineSlotStyle } from "@simplix-react/ui/design";

/** The postcode lookup button, lifted to sit level with the postal code input above its hint. */
export const addressLookupButtonStyle = defineSlotStyle({
  slot: "console-address-lookup-button",
  as: "part",
  base: "mb-3.5",
  variants: {},
  defaultVariants: {},
});

/** The postcode lookup dialog: no inset, so the embedded search runs to the panel's edges. */
export const addressLookupDialogStyle = defineSlotStyle({
  slot: "console-address-lookup-dialog",
  as: "part",
  base: "p-0",
  variants: {},
  defaultVariants: {},
});

/** The lookup dialog's header, inset on its own since the panel has none. */
export const addressLookupHeaderStyle = defineSlotStyle({
  slot: "console-address-lookup-header",
  as: "part",
  base: "px-4 pt-4",
  variants: {},
  defaultVariants: {},
});
