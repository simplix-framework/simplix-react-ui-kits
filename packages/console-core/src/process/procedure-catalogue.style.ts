import { defineSlotStyle } from "@simplix-react/ui/design";

/** The row of procedures to choose from. */
export const procedureChoicesStyle = defineSlotStyle({
  slot: "console-procedure-choices",
  as: "part",
  base: "gap-2 border-b border-border pb-3",
  variants: {},
  defaultVariants: {},
});

/** The line over the chosen procedure: its name, how it starts, and the way to start it. */
export const procedureHeadStyle = defineSlotStyle({
  slot: "console-procedure-head",
  as: "part",
  base: "gap-3 py-3",
  variants: {},
  defaultVariants: {},
});

/** The name of the chosen procedure. */
export const procedureNameStyle = defineSlotStyle({
  slot: "console-procedure-name",
  base: "text-base font-semibold text-foreground",
  variants: {},
  defaultVariants: {},
});

/** How the chosen procedure starts, beside its name. */
export const procedureNoteStyle = defineSlotStyle({
  slot: "console-procedure-note",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
