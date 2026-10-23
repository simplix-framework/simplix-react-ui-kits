import { defineSlotStyle } from "@simplix-react/ui/design";

/** The rail the steps of a chain sit on. */
export const approvalRailStyle = defineSlotStyle({
  slot: "console-approval-rail",
  base: "gap-2",
  variants: {},
  defaultVariants: {},
});

/** One step of the chain; the state tints it so a reader can see where the chain is without reading it. */
export const approvalStepStyle = defineSlotStyle({
  slot: "console-approval-step",
  base: "gap-2 rounded-md border px-3 py-2",
  variants: {
    state: {
      done: "border-border bg-muted/40 text-muted-foreground",
      now: "border-primary bg-primary/10 text-foreground",
      wait: "border-dashed border-border text-muted-foreground",
      reject: "border-destructive bg-destructive/10 text-foreground",
    },
  },
  defaultVariants: { state: "wait" },
});
