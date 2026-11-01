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
