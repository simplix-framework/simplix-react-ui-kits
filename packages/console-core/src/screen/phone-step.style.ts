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

/** A link to the next screen as a full-width button, its second line under its label. */
export const phoneStepLinkStyle = defineSlotStyle({
  slot: "console-phone-step-link",
  as: "part",
  base: "gap-0 py-2",
  variants: {},
  defaultVariants: {},
});

/** A next-screen link's second line, quieter than its label. */
export const phoneStepLinkSubStyle = defineSlotStyle({
  slot: "console-phone-step-link-sub",
  base: "text-xs font-normal opacity-80",
  variants: {},
  defaultVariants: {},
});

/** A step's title, smaller than a screen title: the step names a part of the task. */
export const phoneStepTitleStyle = defineSlotStyle({
  slot: "console-phone-step-title",
  as: "part",
  base: "text-xl",
  variants: {},
  defaultVariants: {},
});

/** The danger switch of a step, ruled in the danger tone whether pressed or not. */
export const phoneStepDangerStyle = defineSlotStyle({
  slot: "console-phone-step-danger",
  as: "part",
  base: "border-destructive text-base font-semibold aria-[pressed=false]:text-destructive",
  variants: {},
  defaultVariants: {},
});
