import { defineSlotStyle } from "@simplix-react/ui/design";

/** A checkbox and its words on one line; the whole line presses the box. */
export const siteCheckStyle = defineSlotStyle({
  slot: "site-checkbox-row",
  base: "inline-flex min-w-0 cursor-pointer items-center gap-2 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) font-(--site-fw-base) text-(--site-ink)",
  variants: {},
  defaultVariants: {},
});

/** A checkbox's words. */
export const siteCheckLabelStyle = defineSlotStyle({
  slot: "site-checkbox-label",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** The word before a consent the next step needs ("Required"), drawn for the eye only. */
export const siteCheckBadgeStyle = defineSlotStyle({
  slot: "site-checkbox-badge",
  base: "mr-1 text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) not-italic text-(--site-accent-text)",
  variants: {},
  defaultVariants: {},
});

/**
 * The framework checkbox drawn in the site design: a 16px box on the control line that fills with
 * the accent when checked. A part over the framework's own slot, so every property the framework
 * draws is set here.
 */
export const siteCheckboxStyle = defineSlotStyle({
  slot: "site-checkbox",
  as: "part",
  base:
    "inline-grid size-4 shrink-0 cursor-pointer place-items-center rounded-(--site-radius-xs) border border-(--site-control-line) bg-(--site-surface) p-0 text-(--site-on-accent) shadow-none outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) hover:border-(--site-accent) focus-visible:shadow-[var(--site-focus-ring)] data-[state=checked]:border-(--site-accent) data-[state=checked]:bg-(--site-accent) data-[state=checked]:text-(--site-on-accent) data-[state=indeterminate]:text-(--site-on-accent) data-[state=checked]:hover:border-(--site-accent-strong) data-[state=checked]:hover:bg-(--site-accent-strong) data-[state=indeterminate]:border-(--site-accent) data-[state=indeterminate]:bg-(--site-accent) disabled:cursor-not-allowed disabled:opacity-(--site-dim) [&_svg]:size-3",
  variants: {},
  defaultVariants: {},
});

/**
 * The framework switch drawn in the site design: a 30 by 18 track on the control line with a 14px
 * thumb, filled with the accent when on.
 */
export const siteToggleStyle = defineSlotStyle({
  slot: "site-toggle",
  as: "part",
  base:
    "relative inline-flex h-4.5 w-7.5 shrink-0 cursor-pointer items-center rounded-(--site-radius-full) border border-(--site-control-line) bg-(--site-surface-sunken) p-px shadow-none outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) hover:border-(--site-accent) focus-visible:shadow-[var(--site-focus-ring)] data-[state=checked]:border-(--site-accent) data-[state=checked]:bg-(--site-accent) data-[state=checked]:hover:border-(--site-accent-strong) data-[state=checked]:hover:bg-(--site-accent-strong) disabled:cursor-not-allowed disabled:opacity-(--site-dim) [&>[data-slot=switch-thumb]]:block [&>[data-slot=switch-thumb]]:size-3.5 [&>[data-slot=switch-thumb]]:translate-x-0 [&>[data-slot=switch-thumb]]:rounded-(--site-radius-full) [&>[data-slot=switch-thumb]]:bg-(--site-control-line) [&>[data-slot=switch-thumb]]:shadow-none [&>[data-slot=switch-thumb]]:transition-transform [&>[data-slot=switch-thumb]]:duration-(--site-duration-base) data-[state=checked]:[&>[data-slot=switch-thumb]]:translate-x-3 data-[state=checked]:[&>[data-slot=switch-thumb]]:bg-(--site-on-accent)",
  variants: {},
  defaultVariants: {},
});

/** A switch and its words on one line. */
export const siteToggleRowStyle = defineSlotStyle({
  slot: "site-toggle-row",
  base: "inline-flex min-w-0 cursor-pointer items-center gap-2 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) text-(--site-ink)",
  variants: {},
  defaultVariants: {},
});

/** A few choices, each a card with a radio mark, a title and a line of body. */
export const siteRadioCardsStyle = defineSlotStyle({
  slot: "site-radio-cards",
  base: "flex min-w-0 flex-col gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** One choice of {@link siteRadioCardsStyle}: the accent outline and soft ground when chosen. */
export const siteRadioCardStyle = defineSlotStyle({
  slot: "site-radio-card",
  base:
    "flex min-w-0 cursor-pointer items-start gap-2.5 rounded-(--site-radius-lg) border px-3 py-2.5 text-left font-(family-name:--site-font-sans) text-(--site-ink) outline-none transition-colors duration-(--site-duration-base) ease-(--site-ease) focus-visible:shadow-[var(--site-focus-ring)] disabled:cursor-not-allowed disabled:opacity-(--site-dim)",
  variants: {
    checked: {
      true: "border-(--site-accent) bg-(--site-accent-soft)",
      false: "border-(--site-line) bg-(--site-surface) hover:border-(--site-control-line)",
    },
  },
  defaultVariants: { checked: false },
});

/** The radio mark of a card: a ring, with a dot when chosen. */
export const siteRadioMarkStyle = defineSlotStyle({
  slot: "site-radio-mark",
  base: "mt-0.5 grid size-4 shrink-0 place-items-center rounded-(--site-radius-full) border-2",
  variants: {
    checked: {
      true: "border-(--site-accent)",
      false: "border-(--site-control-line)",
    },
  },
  defaultVariants: { checked: false },
});

/** The dot inside a chosen card's radio mark. */
export const siteRadioDotStyle = defineSlotStyle({
  slot: "site-radio-dot",
  base: "size-2 rounded-(--site-radius-full) bg-(--site-accent)",
  variants: {},
  defaultVariants: {},
});

/** A card's title and body, one over the other. */
export const siteRadioTextStyle = defineSlotStyle({
  slot: "site-radio-text",
  base: "flex min-w-0 flex-col gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** A card's title, with a badge beside it. */
export const siteRadioTitleStyle = defineSlotStyle({
  slot: "site-radio-title",
  base: "flex items-center gap-1.5 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** A card's body line. */
export const siteRadioBodyStyle = defineSlotStyle({
  slot: "site-radio-body",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});
