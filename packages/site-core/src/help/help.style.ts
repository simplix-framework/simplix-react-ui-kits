import { defineSlotStyle } from "@simplix-react/ui/design";

/** A match's or a listed article's title and where it is, one under the other. */
export const siteLinkTextStyle = defineSlotStyle({
  slot: "site-link-text",
  base: "flex min-w-0 flex-1 flex-col",
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

/** The article list's heading. */
export const siteArticleListTitleStyle = defineSlotStyle({
  slot: "site-article-list-title",
  base: "m-0 text-(length:--site-fs-subheading) leading-(--site-lh-subheading) font-(--site-fw-strong)",
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
