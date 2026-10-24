import { defineSlotStyle } from "@simplix-react/ui/design";

/** The facts under a page title, as one line. */
export const pageMetaStyle = defineSlotStyle({
  slot: "console-page-meta",
  base: "mt-1.5 flex flex-wrap items-center",
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
  // A short rule between two facts.
  base: "mx-2.5 inline-block h-[11px] w-px bg-border align-[-1px] text-[0px]",
  variants: {},
  defaultVariants: {},
});
