import { defineSlotStyle } from "@simplix-react/ui/design";

import { SITE_FIELD_NARROW } from "../form/form.style";

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

/** The search field; at phone width it takes the input size, as every field a reader types into does. */
export const siteSearchInputStyle = defineSlotStyle({
  slot: "site-search-input",
  base: `block h-(--site-control) w-full min-w-0 rounded-(--site-radius-md) border border-(--site-control-line) bg-(--site-surface) px-2.5 font-(family-name:--site-font-sans) text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) text-(--site-ink) outline-none placeholder:text-(--site-ink-muted) focus-visible:shadow-[var(--site-focus-ring)] ${SITE_FIELD_NARROW}`,
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

/** What the search says when nothing matches. */
export const siteSearchEmptyStyle = defineSlotStyle({
  slot: "site-search-empty",
  base: "flex min-w-0 flex-wrap items-center gap-3 px-4 py-3 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});
