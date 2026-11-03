import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The round mark of a failure page: a quiet ground for an address the site has no page for, the bad
 * tone for a page that failed while it was shown.
 */
export const siteFailureMarkStyle = defineSlotStyle({
  slot: "site-failure-mark",
  base: "grid size-14 place-items-center rounded-(--site-radius-full) [&_svg]:size-7",
  variants: {
    tone: {
      quiet: "bg-(--site-surface-sunken) text-(--site-ink-muted)",
      bad: "bg-(--site-bad-soft) text-(--site-bad)",
    },
  },
  defaultVariants: { tone: "quiet" },
});

/** The failure page's title, the page's one h1, in the display family. */
export const siteFailureTitleStyle = defineSlotStyle({
  slot: "site-failure-title",
  base: "m-0 font-(family-name:--site-font-display) text-(length:--site-fs-title) leading-(--site-lh-title) font-(--site-fw-title) tracking-(--site-tracking-display)",
  variants: {},
  defaultVariants: {},
});

/** What happened, a readable measure wide. */
export const siteFailureTextStyle = defineSlotStyle({
  slot: "site-failure-text",
  base: "m-0 max-w-xl text-(length:--site-fs-body) leading-(--site-lh-body) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The ways on, centred under the sentence, wrapping on a phone. */
export const siteFailureActionsStyle = defineSlotStyle({
  slot: "site-failure-actions",
  base: "flex min-w-0 flex-wrap justify-center gap-2",
  variants: {},
  defaultVariants: {},
});
