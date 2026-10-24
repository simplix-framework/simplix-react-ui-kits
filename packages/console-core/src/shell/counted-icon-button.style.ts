import { defineSlotStyle } from "@simplix-react/ui/design";

/** The glyph button a count is pinned to. */
export const countedButtonStyle = defineSlotStyle({
  slot: "console-counted-button",
  as: "part",
  base: "size-8 text-muted-foreground transition-[background-color,color,scale] duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-accent hover:text-foreground active:scale-[0.98]",
  variants: {},
  defaultVariants: {},
});

/** The count, pinned to the button's top corner. */
export const countedCountStyle = defineSlotStyle({
  slot: "console-counted-count",
  as: "part",
  // On the glyph's top-right corner, leaving the bell readable under it.
  base: "right-0.5 top-0.5 duration-[var(--dur-base)] ease-[var(--ease-spring)] h-[15px] min-w-[15px] px-1 leading-[15px] shadow-[0_0_0_2px_var(--background)]",
  variants: {},
  defaultVariants: {},
});
