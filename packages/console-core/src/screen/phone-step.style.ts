import { defineSlotStyle } from "@simplix-react/ui/design";

/** The header of a stepped input: the step's title over its progress. */
export const phoneStepHeaderStyle = defineSlotStyle({
  slot: "console-phone-step-header",
  as: "part",
  base: "border-b border-border bg-card px-3 py-2",
  variants: {},
  defaultVariants: {},
});

/** One segment of the progress bar; done and current steps are filled, upcoming ones are a track. */
export const phoneStepSegmentStyle = defineSlotStyle({
  slot: "console-phone-step-segment",
  base: "h-1 flex-1 rounded-full",
  variants: {
    state: { done: "bg-primary", current: "bg-primary/60", upcoming: "bg-muted" },
  },
  defaultVariants: { state: "upcoming" },
});

/** The kind of a task over its title, in the row of a task list. */
export const phoneTaskKindStyle = defineSlotStyle({
  slot: "console-phone-task-kind",
  base: "text-xs font-medium text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
