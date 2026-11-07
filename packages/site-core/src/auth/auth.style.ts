import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The sign-in server's page: its own ground, outside the site window, and the `page` container its
 * card reflows on.
 */
export const siteAuthStyle = defineSlotStyle({
  slot: "site-auth",
  base:
    "@container/page relative min-h-full min-w-0 break-keep bg-(--site-canvas) font-(family-name:--site-font-sans) text-(length:--site-fs-base) leading-(--site-lh-base) font-(--site-fw-base) text-(--site-ink)",
  variants: {},
  defaultVariants: {},
});

/** Where the card stands: centred at the top, a little closer to the top below the narrow tier. */
export const siteAuthStageStyle = defineSlotStyle({
  slot: "site-auth-stage",
  base: "flex min-h-full items-start justify-center px-4 py-12 @max-page-narrow/page:py-6",
  variants: {},
  defaultVariants: {},
});

/** The card one sign-in step is drawn in, raised on the ground. */
export const siteAuthCardStyle = defineSlotStyle({
  slot: "site-auth-card",
  base: "flex w-full max-w-sm flex-col gap-3.5 rounded-(--site-radius-2xl) border border-(--site-line) bg-(--site-surface) p-6 shadow-[var(--site-shadow-float)]",
  variants: {},
  defaultVariants: {},
});

/** The card's head: the product's mark and the step's title. */
export const siteAuthHeadStyle = defineSlotStyle({
  slot: "site-auth-head",
  base: "flex items-center gap-2.5",
  variants: {},
  defaultVariants: {},
});

/** The step's title, the page's one h1. */
export const siteAuthTitleStyle = defineSlotStyle({
  slot: "site-auth-title",
  base: "m-0 font-(family-name:--site-font-display) text-(length:--site-fs-heading) leading-(--site-lh-heading) font-(--site-fw-strong) tracking-(--site-tracking-display)",
  variants: {},
  defaultVariants: {},
});

/** A step's form: its fields, then its submit. */
export const siteAuthFormStyle = defineSlotStyle({
  slot: "site-auth-form",
  base: "flex min-w-0 flex-col",
  variants: {
    // `fields` sets fields and the submit apart; `none` holds a form that is only its submit (a passkey).
    gap: {
      fields: "gap-3",
      none: "",
    },
  },
  defaultVariants: { gap: "fields" },
});

/** Ways to go on with another account (Google, Microsoft, Kakao), one under the other. */
export const siteAuthProvidersStyle = defineSlotStyle({
  slot: "site-auth-providers",
  base: "flex min-w-0 flex-col gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** The rule between two ways in, with its word in the middle. */
export const siteAuthOrStyle = defineSlotStyle({
  slot: "site-auth-or",
  base: "flex items-center gap-2 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** One side of the rule. */
export const siteAuthOrLineStyle = defineSlotStyle({
  slot: "site-auth-or-line",
  base: "block h-px flex-1 bg-(--site-line)",
  variants: {},
  defaultVariants: {},
});

/**
 * A sentence in the card: `body` in the reading size (what the step asks), `caption` in small print
 * (the fine print, who is signing in); `muted` or in the ink; `lead` is a small bold line with a glyph.
 */
export const siteAuthTextStyle = defineSlotStyle({
  slot: "site-auth-text",
  base: "m-0 min-w-0",
  variants: {
    size: {
      body: "text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane)",
      caption: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
    },
    tone: {
      muted: "text-(--site-ink-muted)",
      plain: "",
      lead: "flex items-center gap-1.5 font-(--site-fw-strong) [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-(--site-ink-muted)",
      bad: "text-(--site-bad)",
    },
  },
  defaultVariants: { size: "caption", tone: "muted" },
});

/** What went wrong with what was sent (a wrong password), on the bad colour's soft ground. */
export const siteAuthAlertStyle = defineSlotStyle({
  slot: "site-auth-alert",
  base: "m-0 rounded-(--site-radius-lg) bg-(--site-bad-soft) px-3 py-2 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-bad)",
  variants: {
    // With a mark the glyph stands beside the words, top-aligned with the first line.
    marked: {
      true: "flex items-start gap-2",
      false: "",
    },
  },
  defaultVariants: { marked: false },
});

/** An alert's words beside its glyph: one box, so words made of several pieces wrap together. */
export const siteAuthAlertTextStyle = defineSlotStyle({
  slot: "site-auth-alert-text",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** The glyph beside an alert's words: one line tall, so it stands level with the first line however far the words wrap. */
export const siteAuthAlertMarkStyle = defineSlotStyle({
  slot: "site-auth-alert-mark",
  base: "inline-flex h-(--site-lh-caption) shrink-0 items-center [&_svg]:size-4 [&_svg]:shrink-0",
  variants: {},
  defaultVariants: {},
});

/** Links to other steps: spread to the two ends, or one after the other in a line of small print. */
export const siteAuthLinksStyle = defineSlotStyle({
  slot: "site-auth-links",
  base: "m-0 flex text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {
    layout: {
      spread: "justify-between gap-3",
      inline: "flex-wrap items-center gap-x-2 text-(--site-ink-muted)",
    },
  },
  defaultVariants: { layout: "spread" },
});

/** A link to another step standing on its own line, at the start. */
export const siteAuthLinkStyle = defineSlotStyle({
  slot: "site-auth-link",
  base: "flex self-start text-(length:--site-fs-base) leading-(--site-lh-base)",
  variants: {},
  defaultVariants: {},
});

/** How strong a new password is: three short bars filled with the accent. */
export const sitePasswordStrengthStyle = defineSlotStyle({
  slot: "site-password-strength",
  base: "flex gap-1",
  variants: {},
  defaultVariants: {},
});

/** One bar of the strength. */
export const sitePasswordStepStyle = defineSlotStyle({
  slot: "site-password-step",
  base: "block h-1 flex-1 rounded-(--site-radius-full) transition-colors duration-(--site-duration-fast) ease-(--site-ease)",
  variants: {
    on: {
      true: "bg-(--site-accent)",
      false: "bg-(--site-surface-sunken)",
    },
  },
  defaultVariants: { on: false },
});

/** The password rules, each ticked as it is met; spoken as they change. */
export const sitePasswordRulesStyle = defineSlotStyle({
  slot: "site-password-rules",
  base: "flex flex-wrap gap-x-3 text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** One rule: the good colour and a check once met. */
export const sitePasswordRuleStyle = defineSlotStyle({
  slot: "site-password-rule",
  base: "inline-flex items-center gap-1 [&_svg]:size-3",
  variants: {
    met: {
      true: "text-(--site-good)",
      false: "",
    },
  },
  defaultVariants: { met: false },
});

/** What a screen reader hears after a met rule. */
export const sitePasswordMetStyle = defineSlotStyle({
  slot: "site-password-met",
  base: "sr-only",
  variants: {},
  defaultVariants: {},
});

/** What a code field asks: its title in bold over the hint. */
export const siteAuthFieldHeadStyle = defineSlotStyle({
  slot: "site-auth-field-head",
  base: "flex flex-col gap-1.5 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** The code field's title. */
export const siteAuthFieldTitleStyle = defineSlotStyle({
  slot: "site-auth-field-title",
  base: "font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The code field's hint, muted. */
export const siteAuthFieldHintStyle = defineSlotStyle({
  slot: "site-auth-field-hint",
  base: "text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The check a finished step opens with, on the good colour's soft ground. */
export const siteAuthDoneStyle = defineSlotStyle({
  slot: "site-auth-done",
  base: "grid size-11 place-items-center rounded-(--site-radius-full) bg-(--site-good-soft) text-(--site-good) [&_svg]:size-5.5",
  variants: {},
  defaultVariants: {},
});
