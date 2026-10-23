import { defineSlotStyle } from "@simplix-react/ui/design";

/** The magnifier inside the quick-search box. */
export const quickSearchIconStyle = defineSlotStyle({
  slot: "console-quick-search-icon",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The quick-search box: inset past the magnifier, at the list's text size. */
export const quickSearchInputStyle = defineSlotStyle({
  slot: "console-quick-search-input",
  as: "part",
  base: "ps-7 text-sm",
  variants: {},
  defaultVariants: {},
});
