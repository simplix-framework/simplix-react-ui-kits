import { defineSlotStyle } from "@simplix-react/ui/design";

import { SITE_CARD } from "../page/site-page.style";

/** The help centre's head: a band on the surface across the window, ruled off from the page under it. */
export const siteSearchHeroStyle = defineSlotStyle({
  slot: "site-search-hero",
  base: "min-w-0 border-b border-(--site-line) bg-(--site-surface)",
  variants: {},
  defaultVariants: {},
});

/** The band's column: the status, the one h1, the lede, the suggestions and the search, one gap apart. */
export const siteSearchHeroInnerStyle = defineSlotStyle({
  slot: "site-search-hero-inner",
  base: "mx-auto flex w-full min-w-0 max-w-(--site-page-wide) flex-col gap-3 px-6 py-10 @max-page-narrow/page:px-4 @max-page-narrow/page:py-6",
  variants: {},
  defaultVariants: {},
});

/** How the service is running, in one line in the state's colour with its dot. */
export const siteStatusLineStyle = defineSlotStyle({
  slot: "site-status-line",
  base: "flex min-w-0 items-center gap-1.5 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {
    tone: {
      good: "text-(--site-good)",
      warn: "text-(--site-warn)",
      bad: "text-(--site-bad)",
    },
  },
  defaultVariants: { tone: "good" },
});

/** The status line's dot. */
export const siteStatusDotStyle = defineSlotStyle({
  slot: "site-status-dot",
  base: "block size-2 shrink-0 rounded-(--site-radius-full) bg-current",
  variants: {},
  defaultVariants: {},
});

/** The band's title, the page's one h1. */
export const siteSearchHeroTitleStyle = defineSlotStyle({
  slot: "site-search-hero-title",
  base:
    "m-0 font-(family-name:--site-font-display) text-(length:--site-fs-title) leading-(--site-lh-title) font-(--site-fw-title) tracking-(--site-tracking-display)",
  variants: {},
  defaultVariants: {},
});

/** The sentence under the band's title. */
export const siteSearchHeroLedeStyle = defineSlotStyle({
  slot: "site-search-hero-lede",
  base: "m-0 text-(length:--site-fs-body) leading-(--site-lh-body) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Searches to try, in the words people use; they wrap. */
export const siteSuggestionsStyle = defineSlotStyle({
  slot: "site-suggestions",
  base: "flex min-w-0 flex-wrap items-center gap-2 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** What the suggestions are, muted before them. */
export const siteSuggestionsLabelStyle = defineSlotStyle({
  slot: "site-suggestions-label",
  base: "text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The search: the field, then the matches under it while something is typed. */
export const siteSearchStyle = defineSlotStyle({
  slot: "site-search",
  base: "relative flex min-w-0 flex-col gap-2",
  variants: {},
  defaultVariants: {},
});

/** The search field. */
export const siteSearchInputStyle = defineSlotStyle({
  slot: "site-search-input",
  base:
    "block h-(--site-control) w-full min-w-0 rounded-(--site-radius-md) border border-(--site-control-line) bg-(--site-surface) px-2.5 font-(family-name:--site-font-sans) text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) text-(--site-ink) outline-none placeholder:text-(--site-ink-muted) focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {},
  defaultVariants: {},
});

/** The matches, on a floating card. */
export const siteSearchResultsStyle = defineSlotStyle({
  slot: "site-search-results",
  base: "flex min-w-0 flex-col overflow-hidden rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface) shadow-[var(--site-shadow-float)]",
  variants: {},
  defaultVariants: {},
});

/** How many matched and how to pick one with the keyboard; the keys leave a narrow page. */
export const siteSearchHeadStyle = defineSlotStyle({
  slot: "site-search-head",
  base:
    "flex min-w-0 justify-between gap-2 bg-(--site-surface-sunken) px-4 py-1.5 text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** How many matched. */
export const siteSearchFoundStyle = defineSlotStyle({
  slot: "site-search-found",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** The keyboard hint, which a narrow page leaves out. */
export const siteSearchKeysStyle = defineSlotStyle({
  slot: "site-search-keys",
  base: "@max-page-narrow/page:hidden",
  variants: {},
  defaultVariants: {},
});

/** One match: its title and where it is, ruled off from the one above; the active one on the accent's soft ground. */
export const siteSearchOptionStyle = defineSlotStyle({
  slot: "site-search-option",
  base:
    "flex w-full min-w-0 cursor-pointer items-center gap-3 border-0 border-t border-(--site-line) bg-transparent px-4 py-2.5 text-left font-(family-name:--site-font-sans) text-(length:--site-fs-base) leading-(--site-lh-base) font-(--site-fw-base) text-(--site-ink) outline-none hover:bg-(--site-surface-sunken) focus-visible:shadow-[var(--site-focus-ring-inset)]",
  variants: {
    active: {
      true: "bg-(--site-accent-soft) hover:bg-(--site-accent-soft)",
      false: "",
    },
  },
  defaultVariants: { active: false },
});

/** A match's or a listed article's title and where it is, one under the other. */
export const siteLinkTextStyle = defineSlotStyle({
  slot: "site-link-text",
  base: "flex min-w-0 flex-1 flex-col",
  variants: {},
  defaultVariants: {},
});

/** A match's title. */
export const siteSearchOptionTitleStyle = defineSlotStyle({
  slot: "site-search-option-title",
  base: "text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** Where a match is: its category and what it answers. */
export const siteSearchOptionMetaStyle = defineSlotStyle({
  slot: "site-search-option-meta",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The chevron at the end of a link row, muted. */
export const siteLinkMarkStyle = defineSlotStyle({
  slot: "site-link-mark",
  base: "flex shrink-0 text-(--site-ink-muted) [&_svg]:size-4",
  variants: {},
  defaultVariants: {},
});

/** What the search says when nothing matches. */
export const siteSearchEmptyStyle = defineSlotStyle({
  slot: "site-search-empty",
  base: "flex min-w-0 flex-wrap items-center gap-3 px-4 py-3 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** The categories side by side: five to a row, two below the medium tier, one below the narrow tier. */
export const siteCategoryGridStyle = defineSlotStyle({
  slot: "site-category-grid",
  base: "grid min-w-0 grid-cols-5 gap-2.5 @max-page-medium/page:grid-cols-2 @max-page-narrow/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

/** One category: its name, how many articles it holds and their titles. */
export const siteCategoryStyle = defineSlotStyle({
  slot: "site-category",
  base: SITE_CARD,
  variants: {},
  defaultVariants: {},
});

/** A category's name. */
export const siteCategoryTitleStyle = defineSlotStyle({
  slot: "site-category-title",
  base: "font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** How many articles a category holds. */
export const siteCategoryCountStyle = defineSlotStyle({
  slot: "site-category-count",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A category's article titles. */
export const siteCategoryListStyle = defineSlotStyle({
  slot: "site-category-list",
  base: "m-0 flex min-w-0 list-none flex-col gap-1 p-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** One article title in a category. */
export const siteCategoryItemStyle = defineSlotStyle({
  slot: "site-category-item",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** An article's title as a link, underlined under the pointer. */
export const siteCategoryLinkStyle = defineSlotStyle({
  slot: "site-category-link",
  base: "cursor-pointer rounded-(--site-radius-xs) text-left text-inherit no-underline outline-none hover:underline focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {
    // An article not written yet: the same words with no press and no underline under the pointer.
    pending: { true: "cursor-default hover:no-underline", false: "" },
  },
  defaultVariants: { pending: false },
});

/** A list of articles on a card: a heading with a badge, then numbered links. */
export const siteArticleListStyle = defineSlotStyle({
  slot: "site-article-list",
  base: SITE_CARD,
  variants: {},
  defaultVariants: {},
});

/** The article list's heading and its badge. */
export const siteArticleListHeadStyle = defineSlotStyle({
  slot: "site-article-list-head",
  base: "flex min-w-0 items-center gap-2",
  variants: {},
  defaultVariants: {},
});

/** A card's heading at the subheading size, its glyph first. */
export const siteCardHeadingStyle = defineSlotStyle({
  slot: "site-card-heading",
  base: "m-0 flex min-w-0 items-center gap-2 text-(length:--site-fs-subheading) leading-(--site-lh-subheading) font-(--site-fw-strong) [&_svg]:size-4 [&_svg]:shrink-0",
  variants: {},
  defaultVariants: {},
});

/** The article list's heading. */
export const siteArticleListTitleStyle = defineSlotStyle({
  slot: "site-article-list-title",
  base: "m-0 text-(length:--site-fs-subheading) leading-(--site-lh-subheading) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The article list's rows. */
export const siteArticleRowsStyle = defineSlotStyle({
  slot: "site-article-rows",
  base: "m-0 flex min-w-0 list-none flex-col p-0",
  variants: {},
  defaultVariants: {},
});

/** One row of the article list. */
export const siteArticleRowStyle = defineSlotStyle({
  slot: "site-article-row",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** An article as a link row: its number, its title and where it is, and a chevron. */
export const siteArticleLinkStyle = defineSlotStyle({
  slot: "site-article-link",
  base:
    "flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-(--site-radius-md) px-1 py-2 text-left text-inherit no-underline outline-none hover:bg-(--site-surface-sunken) focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {
    // An article not written yet: the same row with no press and no ground under the pointer.
    pending: { true: "cursor-default hover:bg-transparent", false: "" },
  },
  defaultVariants: { pending: false },
});

/** A row's number in the mono family. */
export const siteArticleNumberStyle = defineSlotStyle({
  slot: "site-article-number",
  base:
    "font-(family-name:--site-font-mono) text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A row's article title. */
export const siteArticleNameStyle = defineSlotStyle({
  slot: "site-article-name",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** Where a row's article is and how many read it. */
export const siteArticleMetaStyle = defineSlotStyle({
  slot: "site-article-meta",
  base: "text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted)",
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

/** Two parts of a page side by side, their tops aligned; one under the other below the medium tier. */
export const siteColumnsStyle = defineSlotStyle({
  slot: "site-columns",
  base: "grid min-w-0 grid-cols-2 items-start gap-4 @max-page-medium/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

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
