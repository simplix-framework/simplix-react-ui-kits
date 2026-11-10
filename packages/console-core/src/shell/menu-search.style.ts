import { defineSlotStyle } from "@simplix-react/ui/design";

/** The box the menu column holds its search in, under the destinations and above the services. */
export const menuSearchBoxStyle = defineSlotStyle({
  slot: "console-menu-search-box",
  as: "part",
  base: "shrink-0 border-t border-border px-2.5 py-2.5",
  variants: {},
  defaultVariants: {},
});

/** The menu column's search: a field-shaped control that opens the command palette, as wide as the column. */
export const menuSearchStyle = defineSlotStyle({
  slot: "console-menu-search",
  base: "flex h-8 w-full min-w-0 items-center gap-2 rounded-md border border-input bg-background pl-3 pr-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** The word in the menu column's search field. */
export const menuSearchLabelStyle = defineSlotStyle({
  slot: "console-menu-search-label",
  base: "min-w-0 flex-1 truncate text-left",
  variants: {},
  defaultVariants: {},
});
