import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The page column: centred, no wider than the wide tier, its regions one gap apart. A narrow page
 * keeps a smaller side room so the content gets the width. `rhythm="open"` spaces the sections of a
 * marketing page further apart, under a hero that already gave the page its head.
 */
export const sitePageStyle = defineSlotStyle({
  slot: "site-page",
  base: "mx-auto flex w-full min-w-0 max-w-(--site-page-wide) flex-col px-6 @max-page-narrow/page:px-4",
  variants: {
    rhythm: {
      page: "gap-5 py-8 @max-page-narrow/page:py-5",
      open: "gap-8 py-10",
    },
  },
  defaultVariants: { rhythm: "page" },
});

/** The page's head: an optional eyebrow, the title and the lede. */
export const sitePageHeadStyle = defineSlotStyle({
  slot: "site-page-head",
  base: "flex min-w-0 flex-col gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** A short line above the title naming the page's group. */
export const sitePageEyebrowStyle = defineSlotStyle({
  slot: "site-page-eyebrow",
  base: "text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted) uppercase",
  variants: {},
  defaultVariants: {},
});

/** The page's title, in the display family. */
export const sitePageTitleStyle = defineSlotStyle({
  slot: "site-page-title",
  base:
    "m-0 text-balance font-(family-name:--site-font-display) text-(length:--site-fs-title) leading-(--site-lh-title) font-(--site-fw-title) tracking-(--site-tracking-display)",
  variants: {},
  defaultVariants: {},
});

/** The sentence under the title saying what the page is for. */
export const sitePageLedeStyle = defineSlotStyle({
  slot: "site-page-lede",
  base: "m-0 text-(length:--site-fs-body) leading-(--site-lh-body) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A section of a page: its heading, an optional lede, then its body. */
export const siteSectionStyle = defineSlotStyle({
  slot: "site-section",
  base: "flex min-w-0 flex-col gap-2",
  variants: {},
  defaultVariants: {},
});

/**
 * A section's heading. `size="md"` is a plain heading in the text family; `lg` opens a part of the
 * page in the display family, as a set of offers below the plans does.
 */
export const siteSectionHeadingStyle = defineSlotStyle({
  slot: "site-section-heading",
  base: "m-0",
  variants: {
    size: {
      md: "text-(length:--site-fs-subheading) leading-(--site-lh-subheading) font-(--site-fw-strong)",
      lg: "font-(family-name:--site-font-display) text-(length:--site-fs-headline) leading-(--site-lh-headline) font-(--site-fw-title) tracking-(--site-tracking-display)",
    },
  },
  defaultVariants: { size: "md" },
});

/** The sentence under a section's heading. */
export const siteSectionLedeStyle = defineSlotStyle({
  slot: "site-section-lede",
  base: "m-0 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The trail from the site's top to the page shown. */
export const siteBreadcrumbStyle = defineSlotStyle({
  slot: "site-breadcrumb",
  base: "min-w-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The trail's list, one row that wraps. */
export const siteBreadcrumbListStyle = defineSlotStyle({
  slot: "site-breadcrumb-list",
  base: "m-0 flex min-w-0 list-none flex-wrap items-center gap-1.5 p-0",
  variants: {},
  defaultVariants: {},
});

/** One step of the trail; the page shown is the last, in full ink. */
export const siteBreadcrumbItemStyle = defineSlotStyle({
  slot: "site-breadcrumb-item",
  base: "inline-flex min-w-0 items-center gap-1.5",
  variants: {
    current: {
      true: "font-(--site-fw-strong) text-(--site-ink)",
      false: "",
    },
  },
  defaultVariants: { current: false },
});

/** A step's link to the page it names. */
export const siteBreadcrumbLinkStyle = defineSlotStyle({
  slot: "site-breadcrumb-link",
  base:
    "cursor-pointer rounded-(--site-radius-xs) text-inherit no-underline underline-offset-2 outline-none hover:underline focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {},
  defaultVariants: {},
});

/** The mark between two steps. */
export const siteBreadcrumbSeparatorStyle = defineSlotStyle({
  slot: "site-breadcrumb-separator",
  base: "text-(--site-ink-muted) opacity-(--site-recede)",
  variants: {},
  defaultVariants: {},
});
