import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * What every text control shares: the control line, the surface, the ink, the pointer and keyboard
 * answers, and the disabled and refused looks. A size or a shape is a variant or another slot.
 */
export const SITE_FIELD =
  "block w-full min-w-0 rounded-(--site-radius-md) border border-(--site-control-line) bg-(--site-surface) font-(family-name:--site-font-sans) text-(--site-ink) outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) placeholder:text-(--site-ink-muted) hover:border-(--site-ink-muted) focus-visible:border-(--site-accent) focus-visible:shadow-[var(--site-focus-ring)] disabled:cursor-not-allowed disabled:opacity-(--site-dim) aria-invalid:border-(--site-bad)";

/**
 * A phone-width text control is read at the size that keeps a phone browser from zooming into it on
 * focus; the size and leading are the product's `--site-fs-input` and `--site-lh-input`. Every slot
 * a reader types into carries it, the fields here and the help search alike.
 */
export const SITE_FIELD_NARROW = "@max-page-narrow/page:text-(length:--site-fs-input) @max-page-narrow/page:leading-(--site-lh-input)";

/** The six-digit code's row of cells, centred. */
export const siteCodeStyle = defineSlotStyle({
  slot: "site-code",
  as: "part",
  base: "flex w-full items-center justify-center gap-2",
  variants: {},
  defaultVariants: {},
});

/** One square cell of the code; a refused code draws a heavier border in the bad colour. */
export const siteCodeCellStyle = defineSlotStyle({
  slot: "site-code-cell",
  as: "part",
  base:
    "aspect-square w-(--site-code-cell) min-w-0 shrink rounded-(--site-radius-md) bg-(--site-surface) p-0 text-center font-(family-name:--site-font-mono) text-(length:--site-fs-digits) leading-(--site-lh-digits) font-(--site-fw-digits) tracking-normal text-(--site-ink) caret-(--site-accent) shadow-none outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) focus-visible:border-(--site-accent) focus-visible:shadow-[var(--site-focus-ring)] disabled:cursor-not-allowed disabled:bg-(--site-surface-sunken) disabled:opacity-(--site-dim)",
  variants: {
    invalid: {
      true: "border-2 border-(--site-bad)",
      false: "border border-(--site-control-line) hover:border-(--site-ink-muted)",
    },
  },
  defaultVariants: { invalid: false },
});
