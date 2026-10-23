import { defineSlotStyle } from "@simplix-react/ui/design";

/** The dot of one node on the rail; the state says whether the node is done, current, ahead or skipped. */
export const historyDotStyle = defineSlotStyle({
  slot: "console-history-dot",
  base: "mt-1.5 rounded-full border-2",
  variants: {
    state: {
      done: "bg-muted-foreground border-muted-foreground",
      active: "bg-primary border-primary ring-4 ring-primary/20",
      pending: "bg-background border-muted-foreground/40",
      skip: "bg-background border-dashed border-muted-foreground/40",
    },
  },
  defaultVariants: { state: "pending" },
});

/** The hairline from one dot to the next; it is dashed where the next node was skipped. */
export const historyLineStyle = defineSlotStyle({
  slot: "console-history-line",
  base: "",
  variants: {
    skipped: {
      true: "border-l border-dashed border-muted-foreground/40",
      false: "bg-border",
    },
  },
  defaultVariants: { skipped: false },
});

/** The column of one node's content; every node but the last holds the rail's line open below it. */
export const historyNodeStyle = defineSlotStyle({
  slot: "console-history-node",
  as: "part",
  base: "",
  variants: {
    open: { true: "pb-4", false: "" },
  },
  defaultVariants: { open: false },
});

/**
 * The elbow: an indented card tied to the node above it, so the branch reads as part of that step
 * rather than as a step of its own.
 */
export const historyLaneStyle = defineSlotStyle({
  slot: "console-history-lane",
  as: "part",
  base: "ml-2 border-l-2",
  variants: {},
  defaultVariants: {},
});
