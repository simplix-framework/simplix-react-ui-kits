import { defineSlotStyle } from "@simplix-react/ui/design";

/** The row of status cards over a list: the figures the list's rows are cut by. */
export const statusCardStripStyle = defineSlotStyle({
  slot: "status-card-strip",
  base: "",
  variants: {},
  defaultVariants: {},
});

/**
 * One status card. A card that narrows the list is a toggle: pressed, it is ringed like a chosen
 * chip, so the card and the chip that share its filter read as one choice.
 */
export const statusCardStyle = defineSlotStyle({
  slot: "status-card",
  base: "h-full rounded-lg text-left transition-shadow duration-[var(--dur-fast)] [&_[data-slot=stat-card]]:h-full [&_[data-slot=stat-card]]:min-h-0 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    pressed: { true: "ring-2 ring-ring", false: "" },
    pressable: { true: "cursor-pointer", false: "" },
  },
  defaultVariants: { pressed: false, pressable: false },
});

/** The strip with its fold control: the cards, or one line of their figures while folded. */
export const statusCardFoldStyle = defineSlotStyle({
  slot: "status-card-fold",
  base: "flex flex-col gap-2",
  variants: {
    folded: { true: "", false: "" },
  },
  defaultVariants: { folded: false },
});

/** The strip's head: the folded line at the start, the fold control at the end. */
export const statusCardHeadStyle = defineSlotStyle({
  slot: "status-card-head",
  base: "flex min-h-7 items-center justify-end gap-3",
  variants: {},
  defaultVariants: {},
});

/** The folded line: each card's label and figure, one after another. */
export const statusCardSummaryStyle = defineSlotStyle({
  slot: "status-card-summary",
  base: "me-auto flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1 text-(length:--fs-body-sm) text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** One card in the folded line; its figure in the body colour. */
export const statusCardSummaryItemStyle = defineSlotStyle({
  slot: "status-card-summary-item",
  base: "whitespace-nowrap [&>b]:font-semibold [&>b]:tabular-nums [&>b]:text-foreground",
  variants: {},
  defaultVariants: {},
});

/** The control that folds and unfolds the strip. */
export const statusCardToggleStyle = defineSlotStyle({
  slot: "status-card-toggle",
  base: "inline-flex h-6 shrink-0 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)] [&>svg]:size-3.5",
  variants: {},
  defaultVariants: {},
});
