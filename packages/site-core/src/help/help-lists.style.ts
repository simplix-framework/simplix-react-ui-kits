import { defineSlotStyle } from "@simplix-react/ui/design";

import { SITE_CARD } from "../page/site-page.style";

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

/** Two parts of a page side by side, their tops aligned; one under the other below the medium tier. */
export const siteColumnsStyle = defineSlotStyle({
  slot: "site-columns",
  base: "grid min-w-0 grid-cols-2 items-start gap-4 @max-page-medium/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});
