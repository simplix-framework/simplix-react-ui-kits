import { defineSlotStyle } from "@simplix-react/ui/design";

/** The dashed ground a file is dropped on, tinted while one is dragged over it. */
export const attachmentDropStyle = defineSlotStyle({
  slot: "console-attachment-drop",
  base: "gap-3 rounded-md bg-muted/40 px-4 py-3 outline-1 outline-dashed outline-muted-foreground/40",
  variants: { dragging: { true: "bg-primary/10 outline-primary", false: "" } },
  defaultVariants: { dragging: false },
});

/** One row of a repeated field, ruled off from the row above it rather than boxed. */
export const repeatRowStyle = defineSlotStyle({
  slot: "repeat-row",
  as: "part",
  base: "border-t border-border pt-3 first:border-t-0 first:pt-0",
  variants: {},
  defaultVariants: {},
});

/** The fade at the foot of a scrolling form that says more fields lie below. */
export const formMoreStyle = defineSlotStyle({
  slot: "console-form-more",
  base: "bg-gradient-to-t from-card to-transparent",
  variants: {},
  defaultVariants: {},
});
