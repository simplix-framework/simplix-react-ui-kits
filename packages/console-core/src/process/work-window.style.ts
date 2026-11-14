import { defineSlotStyle } from "@simplix-react/ui/design";

/** The head of a piece of work: what kind it is, its name, and where it stands. */
export const workHeadStyle = defineSlotStyle({
  slot: "console-work-head",
  as: "part",
  base: "border-b border-border px-4 py-3",
  variants: {},
  defaultVariants: {},
});

/** The kind of work, above its name. */
export const workKindStyle = defineSlotStyle({
  slot: "console-work-kind",
  base: "text-xs font-medium text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The name of the piece of work. */
export const workTitleStyle = defineSlotStyle({
  slot: "console-work-title",
  base: "text-base font-semibold text-foreground",
  variants: {},
  defaultVariants: {},
});

/** A labelled fact of the head: the current step, who holds it. */
export const workFactStyle = defineSlotStyle({
  slot: "console-work-fact",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The card that says whose turn it is and what that person does next. */
export const workTurnStyle = defineSlotStyle({
  slot: "console-work-turn",
  as: "part",
  base: "rounded-md border px-4 py-3",
  variants: {
    state: {
      mine: "border-primary/40 bg-primary/5",
      waiting: "border-border bg-muted/40",
      finished: "border-border bg-muted/40",
    },
  },
  defaultVariants: { state: "waiting" },
});

/** The line that names the state of the turn. */
export const workTurnLabelStyle = defineSlotStyle({
  slot: "console-work-turn-label",
  base: "text-xs font-semibold",
  variants: {
    state: {
      mine: "text-primary",
      waiting: "text-muted-foreground",
      finished: "text-muted-foreground",
    },
  },
  defaultVariants: { state: "waiting" },
});

/** The scrolling body of a piece of work, under its head. */
export const workBodyStyle = defineSlotStyle({
  slot: "console-work-body",
  as: "part",
  base: "px-4 py-3",
  variants: {},
  defaultVariants: {},
});

/** The count beside a tab's name. */
export const workTabCountStyle = defineSlotStyle({
  slot: "console-work-tab-count",
  base: "ms-1 text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The list of the records, the history or the related work. */
export const workListStyle = defineSlotStyle({
  slot: "console-work-list",
  base: "m-0 list-none p-0",
  variants: {},
  defaultVariants: {},
});

/** The first line of a row. */
export const workRowTitleStyle = defineSlotStyle({
  slot: "console-work-row-title",
  base: "text-sm font-medium",
  variants: {},
  defaultVariants: {},
});

/** The mark at the end of a row that opens something. */
export const workRowGoStyle = defineSlotStyle({
  slot: "console-work-row-go",
  base: "text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** One row of the records, the history or the related work. */
export const workRowStyle = defineSlotStyle({
  slot: "console-work-row",
  base: "gap-3 border-b border-border px-1 py-2 text-start last:border-b-0",
  variants: {
    opens: {
      true: "hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none",
      false: "",
    },
  },
  defaultVariants: { opens: false },
});

/** The second line of a row. */
export const workRowSubStyle = defineSlotStyle({
  slot: "console-work-row-sub",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The line shown where a tab has nothing to list. */
export const workEmptyStyle = defineSlotStyle({
  slot: "console-work-empty",
  base: "px-1 py-6 text-sm text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
