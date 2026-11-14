import { defineSlotStyle } from "@simplix-react/ui/design";

import { SITE_CARD } from "../page/site-page.style";

/** A card's heading at the subheading size, its glyph first. */
export const siteCardHeadingStyle = defineSlotStyle({
  slot: "site-card-heading",
  base: "m-0 flex min-w-0 items-center gap-2 text-(length:--site-fs-subheading) leading-(--site-lh-subheading) font-(--site-fw-strong) [&_svg]:size-4 [&_svg]:shrink-0",
  variants: {},
  defaultVariants: {},
});

/**
 * The way to ask support, in the state it is in: `closed` offers the form, `open` is the form,
 * outlined in the accent, and `sent` says the question arrived.
 */
export const siteContactStyle = defineSlotStyle({
  slot: "site-contact",
  base: SITE_CARD,
  variants: {
    state: {
      closed: "",
      open: "border-(--site-accent)",
      // Takes the focus as it replaces the form; the focus is the reader's place, not a control to press.
      sent: "outline-none",
    },
  },
  defaultVariants: { state: "closed" },
});

/** The round mark of a question that arrived. */
export const siteContactMarkStyle = defineSlotStyle({
  slot: "site-contact-mark",
  base: "grid size-10 place-items-center rounded-(--site-radius-full) bg-(--site-good-soft) text-(--site-good) [&_svg]:size-5",
  variants: {},
  defaultVariants: {},
});

/** A row of words and a badge, such as the sent title and its ticket. */
export const siteContactRowStyle = defineSlotStyle({
  slot: "site-contact-row",
  base: "flex min-w-0 flex-wrap items-center gap-2",
  variants: {},
  defaultVariants: {},
});

/** The sent title. */
export const siteContactTitleStyle = defineSlotStyle({
  slot: "site-contact-title",
  base: "font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The contact's actions and a note after them; they wrap. */
export const siteContactActionsStyle = defineSlotStyle({
  slot: "site-contact-actions",
  base: "flex min-w-0 flex-wrap items-center gap-2",
  variants: {
    spread: {
      true: "gap-3",
      false: "",
    },
  },
  defaultVariants: { spread: false },
});

/** A muted note beside actions (opening hours, what is still missing). */
export const siteContactNoteStyle = defineSlotStyle({
  slot: "site-contact-note",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Why an attachment cannot be added now, under its checkbox, in the caption's muted words. */
export const siteAttachReasonStyle = defineSlotStyle({
  slot: "site-attach-reason",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Where a contact action stands alone: at the card's start, its own width. */
export const siteContactActionStyle = defineSlotStyle({
  slot: "site-contact-action",
  base: "flex self-start",
  variants: {},
  defaultVariants: {},
});

/** Articles a question's subject may already answer, on the accent's soft ground. */
export const siteSuggestBoxStyle = defineSlotStyle({
  slot: "site-suggest-box",
  base: "flex min-w-0 flex-col gap-1 rounded-(--site-radius-lg) bg-(--site-accent-soft) px-3 py-2 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** One suggested article as a link in the strong accent. */
export const siteSuggestLinkStyle = defineSlotStyle({
  slot: "site-suggest-link",
  base:
    "flex cursor-pointer items-center gap-1 rounded-(--site-radius-xs) text-left font-(--site-fw-strong) text-(--site-accent-text) no-underline outline-none hover:underline focus-visible:shadow-[var(--site-focus-ring)] [&_svg]:size-3",
  variants: {},
  defaultVariants: {},
});

/** Something to attach to a question (the app's diagnostic record): the choice, then what it holds. */
export const siteAttachStyle = defineSlotStyle({
  slot: "site-attach",
  base: "flex min-w-0 flex-col gap-2 rounded-(--site-radius-lg) border border-(--site-line) px-3 py-2.5",
  variants: {},
  defaultVariants: {},
});

/** The attachment's name and its badge, beside the product's checkbox. */
export const siteAttachTitleStyle = defineSlotStyle({
  slot: "site-attach-title",
  base: "flex min-w-0 items-center gap-1.5 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** What the attachment holds, small and muted. */
export const siteAttachAboutStyle = defineSlotStyle({
  slot: "site-attach-about",
  base: "text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The attachment's words, one under the other. */
export const siteAttachLabelStyle = defineSlotStyle({
  slot: "site-attach-label",
  base: "flex min-w-0 flex-col",
  variants: {},
  defaultVariants: {},
});
