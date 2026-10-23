import { defineSlotStyle } from "@simplix-react/ui/design";
/** The page header band with the rule under it. */
export const pageHeaderStyle = defineSlotStyle({
  slot: "console-page-header",
  as: "part",
  base: "pb-2 mb-4 border-b",
  variants: {},
  defaultVariants: {},
});

/** The metadata block under a page header's title. */
export const pageHeaderMetadataStyle = defineSlotStyle({
  slot: "console-page-header-metadata",
  as: "part",
  base: "mt-4",
  variants: {},
  defaultVariants: {},
});
