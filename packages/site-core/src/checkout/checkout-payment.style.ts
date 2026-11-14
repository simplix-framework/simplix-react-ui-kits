import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The payment side: the provider's frame stood on a dashed sunken ground with its name, so a reader
 * sees where our page ends and the provider's begins.
 */
export const siteProviderFrameStyle = defineSlotStyle({
  slot: "site-provider-frame",
  base: "flex min-w-0 flex-col gap-2 rounded-(--site-radius-xl) border-2 border-dashed border-(--site-ink-faint) bg-(--site-surface-sunken) p-2.5",
  variants: {},
  defaultVariants: {},
});

/** The frame's label line: whose frame it is, and the owner at the end. */
export const siteProviderLabelStyle = defineSlotStyle({
  slot: "site-provider-label",
  base: "flex min-w-0 items-center gap-2 px-1 font-(family-name:--site-font-mono) text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The label line's square mark. */
export const siteProviderMarkStyle = defineSlotStyle({
  slot: "site-provider-mark",
  base: "block size-1.5 shrink-0 rounded-(--site-radius-xs) bg-(--site-ink-faint)",
  variants: {},
  defaultVariants: {},
});

/** The label line's name, cut where it is too long. */
export const siteProviderNameStyle = defineSlotStyle({
  slot: "site-provider-name",
  base: "min-w-0 flex-1 truncate",
  variants: {},
  defaultVariants: {},
});

/** The label line's owner. */
export const siteProviderOwnerStyle = defineSlotStyle({
  slot: "site-provider-owner",
  base: "shrink-0",
  variants: {},
  defaultVariants: {},
});

/** The provider's frame itself, raised on the surface. */
export const siteProviderBodyStyle = defineSlotStyle({
  slot: "site-provider-body",
  base: "flex min-h-100 min-w-0 flex-col rounded-(--site-radius-lg) bg-(--site-surface) p-4.5 shadow-[var(--site-shadow-float)]",
  variants: {},
  defaultVariants: {},
});

/** What our page says in the provider's place before the provider draws there: centred, with room above and below. */
export const siteProviderWaitingStyle = defineSlotStyle({
  slot: "site-provider-waiting",
  base: "flex flex-col items-center gap-3 py-10 text-center",
  variants: {},
  defaultVariants: {},
});

/** The element a provider's script draws its frame into: the body's whole width, no look of its own. */
export const siteProviderTargetStyle = defineSlotStyle({
  slot: "site-provider-target",
  base: "min-w-0 w-full",
  variants: {},
  defaultVariants: {},
});

/** The waiting place's sentence, muted and kept to a narrow measure. */
export const siteProviderWaitingTextStyle = defineSlotStyle({
  slot: "site-provider-waiting-text",
  base: "m-0 max-w-xs text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Ways to pay in two columns; the first or a lone one may span both. */
export const siteMethodGridStyle = defineSlotStyle({
  slot: "site-method-grid",
  base: "grid min-w-0 grid-cols-2 gap-2",
  variants: {},
  defaultVariants: {},
});

/** One way to pay: its mark, its name and its line; the chosen one in the accent. */
export const siteMethodStyle = defineSlotStyle({
  slot: "site-method",
  base:
    "flex min-w-0 cursor-pointer items-center gap-2.5 rounded-(--site-radius-lg) border-2 bg-(--site-surface) px-3 py-2.5 text-left font-(family-name:--site-font-sans) text-(--site-ink) outline-none transition duration-(--site-duration-fast) ease-(--site-ease) focus-visible:shadow-[var(--site-focus-ring)] disabled:cursor-not-allowed disabled:opacity-(--site-faint)",
  variants: {
    pressed: {
      true: "border-(--site-accent) bg-(--site-accent-soft)",
      false: "border-(--site-line) hover:border-(--site-control-line)",
    },
    wide: {
      true: "col-span-2",
      false: "",
    },
  },
  defaultVariants: { pressed: false, wide: false },
});

/** A way to pay's mark: its first letters on an ink tile. */
export const siteMethodMarkStyle = defineSlotStyle({
  slot: "site-method-mark",
  base: "grid h-5.5 w-7.5 shrink-0 place-items-center rounded-(--site-radius-xs) bg-(--site-ink) font-(family-name:--site-font-mono) text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-bold) tracking-(--site-tracking-label) text-(--site-surface)",
  variants: {},
  defaultVariants: {},
});

/** A way to pay's name over its line. */
export const siteMethodTextStyle = defineSlotStyle({
  slot: "site-method-text",
  base: "flex min-w-0 flex-col",
  variants: {},
  defaultVariants: {},
});

/** A way to pay's name. */
export const siteMethodNameStyle = defineSlotStyle({
  slot: "site-method-name",
  base: "truncate text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** A way to pay's line, muted. */
export const siteMethodAboutStyle = defineSlotStyle({
  slot: "site-method-about",
  base: "truncate text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});
