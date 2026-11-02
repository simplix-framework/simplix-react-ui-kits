import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The page column: centred, no wider than the wide tier, its regions one gap apart. A narrow page
 * keeps a smaller side room so the content gets the width. `rhythm="spaced"` spaces the parts under a
 * band that holds the page's head (the help centre's search); `open` spaces the sections of a
 * marketing page further apart, under a hero.
 */
export const sitePageStyle = defineSlotStyle({
  slot: "site-page",
  base: "mx-auto flex w-full min-w-0 max-w-(--site-page-wide) flex-col px-6 @max-page-narrow/page:px-4",
  variants: {
    rhythm: {
      page: "gap-5 py-8 @max-page-narrow/page:py-5",
      spaced: "gap-6 py-8",
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

/**
 * The card most page parts stand on: a hairline box on the surface with its content one gap apart.
 * Parts that are cards draw their own slot with this ground, so a region can be found by its slot. A
 * class that changes what the ground sets (its direction, its outline) is never appended to it in the
 * same base, where the stylesheet's order and not the class order decides; it goes in a variant.
 */
export const SITE_CARD_GROUND = "gap-3 rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface) px-4 py-3.5";
/** The card with its content one under the other. */
export const SITE_CARD = `flex min-w-0 flex-col ${SITE_CARD_GROUND}`;

/** A status in one to three words, on its tone's soft ground; `dot` adds a still dot in the tone's colour. */
export const siteChipStyle = defineSlotStyle({
  slot: "site-chip",
  base:
    "inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap rounded-(--site-radius-full) px-2 font-(family-name:--site-font-sans) text-(length:--site-fs-label) leading-none font-(--site-fw-strong) tracking-(--site-tracking-label)",
  variants: {
    tone: {
      neutral: "bg-(--site-surface-sunken) text-(--site-ink-muted)",
      accent: "bg-(--site-accent-soft) text-(--site-accent-strong)",
      good: "bg-(--site-good-soft) text-(--site-good)",
      warn: "bg-(--site-warn-soft) text-(--site-warn)",
      bad: "bg-(--site-bad-soft) text-(--site-bad)",
    },
  },
  defaultVariants: { tone: "neutral" },
});

/** The dot of a chip, in the chip's colour. */
export const siteChipDotStyle = defineSlotStyle({
  slot: "site-chip-dot",
  base: "block size-1.5 shrink-0 rounded-(--site-radius-full) bg-current",
  variants: {},
  defaultVariants: {},
});

/** A small ring that turns while something runs. */
export const siteSpinnerStyle = defineSlotStyle({
  slot: "site-spinner",
  base: "inline-block size-3 shrink-0 animate-spin rounded-(--site-radius-full) border-2 border-current border-r-transparent motion-reduce:animate-none",
  variants: {},
  defaultVariants: {},
});

/** A small muted line under a part: where to go next, what to do if stuck. */
export const siteCaptionStyle = defineSlotStyle({
  slot: "site-caption",
  base: "m-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Words read only by a screen reader: a status line that speaks each change. */
export const siteLiveStyle = defineSlotStyle({
  slot: "site-live",
  base: "sr-only",
  variants: {},
  defaultVariants: {},
});
