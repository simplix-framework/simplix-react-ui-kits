import { defineSlotStyle } from "@simplix-react/ui/design";

import { SITE_CARD } from "../page/site-page.style";

/** An article's meta, where it applies and its lead, under its title. */
export const siteArticleIntroStyle = defineSlotStyle({
  slot: "site-article-intro",
  base: "flex min-w-0 flex-col gap-2",
  variants: {},
  defaultVariants: {},
});

/** The article's category, reading time and date, muted on one line; they wrap. */
export const siteArticleFactsStyle = defineSlotStyle({
  slot: "site-article-facts",
  base: "flex min-w-0 flex-wrap gap-x-3 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** One fact of the article. */
export const siteArticleFactStyle = defineSlotStyle({
  slot: "site-article-fact",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** Where the article applies, as chips; they wrap. */
export const siteArticleWhereStyle = defineSlotStyle({
  slot: "site-article-where",
  base: "flex min-w-0 flex-wrap gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** The article's lead, in body text. */
export const siteArticleLeadStyle = defineSlotStyle({
  slot: "site-article-lead",
  base: "m-0 text-(length:--site-fs-body) leading-(--site-lh-body)",
  variants: {},
  defaultVariants: {},
});

/** The checks to do first, on the accent's soft ground. */
export const siteQuickBoxStyle = defineSlotStyle({
  slot: "site-quick-box",
  base: "flex min-w-0 scroll-mt-4 flex-col gap-2 rounded-(--site-radius-xl) bg-(--site-accent-soft) px-4 py-3",
  variants: {},
  defaultVariants: {},
});

/** The quick box's title. */
export const siteQuickTitleStyle = defineSlotStyle({
  slot: "site-quick-title",
  base: "font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The quick checks, each a question and its answer. */
export const siteQuickListStyle = defineSlotStyle({
  slot: "site-quick-list",
  base: "m-0 flex min-w-0 list-none flex-col gap-1 p-0 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane)",
  variants: {},
  defaultVariants: {},
});

/** One quick check. */
export const siteQuickItemStyle = defineSlotStyle({
  slot: "site-quick-item",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** The question of a quick check, in the strong weight. */
export const siteQuickAskStyle = defineSlotStyle({
  slot: "site-quick-ask",
  base: "font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** A step of an article: its numbered disc beside its title, words, picture and the mark for having tried it. */
export const siteArticleStepStyle = defineSlotStyle({
  slot: "site-article-step",
  base: "flex min-w-0 scroll-mt-4 gap-3",
  variants: {},
  defaultVariants: {},
});

/** The step's title, words, picture and toggle, one under the other. */
export const siteArticleStepBodyStyle = defineSlotStyle({
  slot: "site-article-step-body",
  base: "flex min-w-0 flex-1 flex-col gap-3",
  variants: {},
  defaultVariants: {},
});

/** A section heading inside a document, at the heading size. */
export const siteDocHeadingStyle = defineSlotStyle({
  slot: "site-doc-heading",
  base: "m-0 text-(length:--site-fs-heading) leading-(--site-lh-heading) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** A paragraph inside a document; `muted` for one that introduces rather than states. */
export const siteDocTextStyle = defineSlotStyle({
  slot: "site-doc-text",
  base: "m-0 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane)",
  variants: {
    tone: {
      plain: "",
      muted: "text-(--site-ink-muted)",
    },
  },
  defaultVariants: { tone: "plain" },
});

/** Where a step's toggle or a section's action stands: at the start, its own width. */
export const siteDocActionStyle = defineSlotStyle({
  slot: "site-doc-action",
  base: "flex self-start",
  variants: {},
  defaultVariants: {},
});

/** A picture of what the screen shows, on the sunken ground, with its caption. */
export const siteFigureStyle = defineSlotStyle({
  slot: "site-figure",
  base: "m-0 flex min-w-0 flex-col gap-2 rounded-(--site-radius-xl) bg-(--site-surface-sunken) p-3",
  variants: {},
  defaultVariants: {},
});

/** The figure's caption. */
export const siteFigureCaptionStyle = defineSlotStyle({
  slot: "site-figure-caption",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A tip on the warning's soft ground, its glyph first. */
export const siteTipStyle = defineSlotStyle({
  slot: "site-tip",
  base: "m-0 flex min-w-0 items-start gap-2 rounded-(--site-radius-lg) bg-(--site-warn-soft) px-3 py-2 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** The tip's glyph, in the warning colour. */
export const siteTipMarkStyle = defineSlotStyle({
  slot: "site-tip-mark",
  base: "mt-0.5 flex shrink-0 text-(--site-warn) [&_svg]:size-3.5",
  variants: {},
  defaultVariants: {},
});

/** A section of a document after its steps: a heading, its words and its action. */
export const siteDocSectionStyle = defineSlotStyle({
  slot: "site-doc-section",
  base: "flex min-w-0 scroll-mt-4 flex-col gap-2",
  variants: {},
  defaultVariants: {},
});

/** Whether an article helped: the question with yes and no, then what was missing or the thanks. */
export const siteFeedbackStyle = defineSlotStyle({
  slot: "site-feedback",
  base: SITE_CARD,
  variants: {},
  defaultVariants: {},
});

/** The feedback's question and its answers; they wrap. */
export const siteFeedbackRowStyle = defineSlotStyle({
  slot: "site-feedback-row",
  base: "flex min-w-0 flex-wrap items-center gap-3",
  variants: {},
  defaultVariants: {},
});

/** The feedback's question. */
export const siteFeedbackAskStyle = defineSlotStyle({
  slot: "site-feedback-ask",
  base: "font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** What was missing, after a no: the reasons to pick and the actions. */
export const siteFeedbackMoreStyle = defineSlotStyle({
  slot: "site-feedback-more",
  // The thanks takes the focus as it replaces the answers; the focus is the reader's place, not a control.
  base: "flex min-w-0 flex-col gap-2 outline-none",
  variants: {},
  defaultVariants: {},
});

/** A row of toggles or actions inside the feedback; they wrap. */
export const siteFeedbackChoicesStyle = defineSlotStyle({
  slot: "site-feedback-choices",
  base: "flex min-w-0 flex-wrap",
  variants: {
    gap: {
      tight: "gap-1.5",
      loose: "gap-2",
    },
  },
  defaultVariants: { gap: "loose" },
});

/** The thanks after the feedback is sent, its tick first. */
export const siteFeedbackThanksStyle = defineSlotStyle({
  slot: "site-feedback-thanks",
  base: "m-0 flex min-w-0 items-center gap-2 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) [&_svg]:size-4 [&_svg]:text-(--site-good)",
  variants: {},
  defaultVariants: {},
});

/** Articles that continue this one, two to a row, one below the narrow tier. */
export const siteRelatedStyle = defineSlotStyle({
  slot: "site-related",
  base: "flex min-w-0 flex-col gap-2",
  variants: {},
  defaultVariants: {},
});

/** The related articles' grid. */
export const siteRelatedGridStyle = defineSlotStyle({
  slot: "site-related-grid",
  base: "grid min-w-0 grid-cols-2 gap-2 @max-page-narrow/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

/** One related article as a small card link: its title and its category. */
export const siteRelatedLinkStyle = defineSlotStyle({
  slot: "site-related-link",
  base:
    "flex min-w-0 cursor-pointer flex-col rounded-(--site-radius-lg) border border-(--site-line) bg-(--site-surface) px-3 py-2.5 text-left text-inherit no-underline outline-none hover:border-(--site-control-line) focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {
    // An article not written yet: the same card with no press and its line kept under the pointer.
    pending: { true: "cursor-default hover:border-(--site-line)", false: "" },
  },
  defaultVariants: { pending: false },
});

/** How far the reader got: the count, the bar and an action, under the contents. */
export const siteDocProgressStyle = defineSlotStyle({
  slot: "site-doc-progress",
  base: "flex min-w-0 flex-col gap-2",
  variants: {},
  defaultVariants: {},
});
