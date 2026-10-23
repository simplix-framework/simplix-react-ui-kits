import { defineSlotStyle } from "@simplix-react/ui/design";

/** The cog-shield mark beside an admin destination. */
export const adminDestinationIconStyle = defineSlotStyle({
  slot: "console-admin-destination-icon",
  base: "opacity-70",
  variants: {},
  defaultVariants: {},
});

/**
 * The link form of an admin destination.
" */
export const adminDestinationLinkStyle = defineSlotStyle({
  slot: "console-admin-destination-link",
  base: "gap-1 underline-offset-2 hover:underline",
  variants: {},
  defaultVariants: {},
});
