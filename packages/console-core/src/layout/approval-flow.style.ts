import { defineSlotStyle } from "@simplix-react/ui/design";

/** A holder's picture beside their name, round the way a stand-in is. */
export const approvalAvatarStyle = defineSlotStyle({
  slot: "console-approval-avatar",
  as: "part",
  base: "rounded-full",
  variants: {},
  defaultVariants: {},
});

/** The vertical chain, ending with room for the window's status bar. */
export const approvalStepsStyle = defineSlotStyle({
  slot: "console-approval-steps",
  base: "pb-10",
  variants: {},
  defaultVariants: {},
});

/** One step of the vertical chain; the step in hand is set on a soft ground. */
export const approvalStepStyle = defineSlotStyle({
  slot: "console-approval-step",
  base: "gap-3 rounded-md px-2 py-1.5",
  variants: { state: { done: "", now: "bg-primary/5", wait: "", reject: "" } },
  defaultVariants: { state: "wait" },
});

/** The rule joining a step's marker to the next, drawn in the accent once the step is done. */
export const approvalRuleStyle = defineSlotStyle({
  slot: "console-approval-rule",
  base: "",
  variants: { done: { true: "bg-primary", false: "bg-border" } },
  defaultVariants: { done: false },
});

/** A step's round marker: its number, or a tick or a cross once decided. */
export const approvalMarkerStyle = defineSlotStyle({
  slot: "console-approval-marker",
  base: "mt-0.5 rounded-full text-xs font-semibold",
  variants: {
    state: {
      done: "bg-primary text-primary-foreground",
      now: "bg-primary text-primary-foreground ring-4 ring-primary/15",
      wait: "border border-border bg-background text-muted-foreground",
      reject: "bg-destructive text-destructive-foreground",
    },
  },
  defaultVariants: { state: "wait" },
});

/** The reader's actions on the step in hand, a step under its lines. */
export const approvalActionsStyle = defineSlotStyle({
  slot: "console-approval-actions",
  as: "part",
  base: "mt-1",
  variants: {},
  defaultVariants: {},
});
