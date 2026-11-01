import { defineSlotStyle } from "@simplix-react/ui/design";
/**
 * The page header band with the rule under it. The rule casts a short shadow downward, so the
 * figure row folded away underneath reads as sitting behind it.
 */
export const pageHeaderStyle = defineSlotStyle({
  slot: "console-page-header",
  as: "part",
  // The header stands on the canvas with no rule under it; the summary's fold control sits at its
  // right, above the figures.
  base: "mb-1 border-b-0 pb-0 [&_h1+*]:mt-1.5",
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

/** The header's own actions, pushed to the row's far end. */
export const pageHeaderActionsStyle = defineSlotStyle({
  slot: "console-page-header-actions",
  base: "ml-auto",
  variants: {},
  defaultVariants: {},
});

/** The sentence under a page header's title that says what the screen is for. */
export const pageHeaderDescriptionStyle = defineSlotStyle({
  slot: "console-page-header-description",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});
