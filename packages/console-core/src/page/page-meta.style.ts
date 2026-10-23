import { defineSlotStyle } from "@simplix-react/ui/design";

/** The facts under a page title, as one line. */
export const pageMetaStyle = defineSlotStyle({
  slot: "console-page-meta",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** One fact under a page title. */
export const pageMetaItemStyle = defineSlotStyle({
  slot: "console-page-meta-item",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** What stands between two facts; classic writes it as a middle dot in the line. */
export const pageMetaRuleStyle = defineSlotStyle({
  slot: "console-page-meta-rule",
  base: "",
  variants: {},
  defaultVariants: {},
});
