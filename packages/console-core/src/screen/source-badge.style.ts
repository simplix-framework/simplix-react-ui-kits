import { defineSlotStyle } from "@simplix-react/ui/design";

/** The rule between the source and its basis. */
export const sourceDividerStyle = defineSlotStyle({
  slot: "console-source-divider",
  base: "bg-current opacity-30",
  variants: {},
  defaultVariants: {},
});

/** The badge naming a value's source, with room around the rule between its halves. */
export const sourceBadgeStyle = defineSlotStyle({
  slot: "console-source-badge",
  as: "part",
  base: "gap-1.5",
  variants: {},
  defaultVariants: {},
});
