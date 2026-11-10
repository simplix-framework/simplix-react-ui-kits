import { defineSlotStyle } from "@simplix-react/ui/design";

/** The row a record with a progress history stands in: the record, and its history beside it while it is wide. */
export const historyLayoutStyle = defineSlotStyle({
  slot: "console-history-layout",
  as: "part",
  base: "flex h-full min-h-0 min-w-0 w-full",
  variants: {},
  defaultVariants: {},
});

/** The record's own column; it keeps the width the history does not take. */
export const historyMainStyle = defineSlotStyle({
  slot: "console-history-main",
  as: "part",
  base: "flex min-h-0 min-w-0 flex-1 flex-col [&>*]:min-h-0 [&>*]:flex-1",
  variants: {},
  defaultVariants: {},
});

/**
 * The history beside the record. It scrolls on its own, so a long history never moves the record's
 * body and a long body never hides the history.
 */
export const historyAsideStyle = defineSlotStyle({
  slot: "console-history-aside",
  base: "flex w-64 shrink-0 flex-col gap-1 overflow-y-auto border-l border-border bg-muted/40 px-5 py-6",
  variants: {
    /**
     * Inside a peek dialog the body pads its content by one step (`p-5`); the column cancels that
     * padding above, below and to its right, so it runs from the header to the footer and to the
     * dialog's edge as it does beside a record opened in a dialog of its own.
     */
    bleed: { true: "-my-5 -mr-5", false: "" },
  },
  defaultVariants: { bleed: false },
});

/** The line under the history's heading, before the first node. */
export const historyAsideLeadStyle = defineSlotStyle({
  slot: "console-history-aside-lead",
  as: "part",
  base: "mb-5 flex flex-col gap-1",
  variants: {},
  defaultVariants: {},
});
