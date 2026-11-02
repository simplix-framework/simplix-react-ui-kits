import { defineSlotStyle } from "@simplix-react/ui/design";

/** The joined group of presentation buttons: square inner corners, shared borders, the one in use filled. */
export const presentationGroupStyle = defineSlotStyle({
  slot: "presentation-group",
  // The outline is a ring, so the group is no taller than one button; a button's own variant
  // paints its fill and border later in the cascade, so the segment fill and dividers are marked important.
  // The group clips its buttons, so the keyboard focus halo is drawn inward, over the buttons' removed shadow.
  base: "overflow-hidden rounded-md shadow-[var(--shadow-outline)] [--focus-halo:var(--focus-halo-inset)] [&>button:focus-visible]:!shadow-[var(--focus-halo)] [&>button]:!h-6 [&>button]:!w-7 [&>button]:!min-w-0 [&>button]:!p-0 [&_svg]:!size-3.5 [&>button]:rounded-none [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md [&>button]:!border-0 [&>button]:!shadow-none [&>button+button]:!border-l [&>button+button]:!border-border [&>button[aria-pressed=true]]:bg-accent! [&>button[aria-pressed=true]]:text-accent-foreground! [&>button:not([aria-pressed=true])]:text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The popover's heading. */
export const presentationTitleStyle = defineSlotStyle({
  slot: "presentation-title",
  base: "text-sm font-semibold",
  variants: {},
  defaultVariants: {},
});

/** One presentation in the popover, with when it suits. */
export const presentationChoiceStyle = defineSlotStyle({
  slot: "presentation-choice",
  base: "gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    checked: { true: "bg-accent text-accent-foreground hover:bg-accent", false: "" },
  },
  defaultVariants: { checked: false },
});

/** A presentation's icon, set on the first line of its label. */
export const presentationChoiceIconStyle = defineSlotStyle({
  slot: "presentation-choice-icon",
  base: "mt-0.5",
  variants: {},
  defaultVariants: {},
});

/** The line under a presentation saying when it suits. */
export const presentationHintStyle = defineSlotStyle({
  slot: "presentation-hint",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
