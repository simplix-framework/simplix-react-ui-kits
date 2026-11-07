import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The site window: the bar, the page and the footer on the canvas. It is the named container
 * `page`, so every part inside reflows on the page tiers (`page-narrow`, `page-medium`,
 * `page-wide`) by the window's own width, never by the viewport's. It is at least as tall as the
 * viewport, so the footer stands at the bottom of a short page whatever height its host gives the
 * element it is mounted in.
 */
export const siteWindowStyle = defineSlotStyle({
  slot: "site-window",
  base:
    "@container/page relative flex min-h-dvh min-w-0 flex-col break-keep bg-(--site-canvas) font-(family-name:--site-font-sans) text-(length:--site-fs-base) leading-(--site-lh-base) font-(--site-fw-base) text-(--site-ink)",
  variants: {},
  defaultVariants: {},
});

/** The page between the bar and the footer; it takes the height the two leave. */
export const siteMainStyle = defineSlotStyle({
  slot: "site-main",
  base: "min-w-0 flex-1 outline-none",
  variants: {},
  defaultVariants: {},
});

/**
 * A band of the page drawn on the dark ground: the bar over a dark hero, and the hero itself. It
 * redefines the site's ground, ink, line and accent variables for what it holds, so a part inside
 * it is drawn with the same rules on the dark values.
 */
export const siteBandStyle = defineSlotStyle({
  slot: "site-band",
  base: "min-w-0 bg-(--site-canvas) text-(--site-ink)",
  variants: {},
  defaultVariants: {},
});

/** The site bar: the brand, the site's pages, then the visitor's or the account's action. */
export const siteBarStyle = defineSlotStyle({
  slot: "site-bar",
  base:
    "relative flex min-w-0 items-center gap-3 border-b border-(--site-line) bg-(--site-surface) px-6 py-3 text-(--site-ink) @max-page-narrow/page:px-4",
  variants: {
    tone: {
      light: "",
      dark: "border-transparent bg-(--site-canvas) text-(--site-dark-bar-ink)",
    },
  },
  defaultVariants: { tone: "light" },
});

/** The brand at the bar's start, a link home. */
export const siteBarBrandStyle = defineSlotStyle({
  slot: "site-bar-brand",
  base:
    "flex shrink-0 cursor-pointer items-center rounded-(--site-radius-md) text-inherit outline-none transition-opacity duration-(--site-duration-fast) ease-(--site-ease) hover:opacity-80 focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {},
  defaultVariants: {},
});

/** The site's pages as text links; below the narrow tier they move into the more menu. */
export const siteBarNavStyle = defineSlotStyle({
  slot: "site-bar-nav",
  base: "flex min-w-0 gap-1 @max-page-narrow/page:hidden",
  variants: {},
  defaultVariants: {},
});

/**
 * One page link of the bar; the current page is drawn in full ink and weight, the others recede. A
 * page that is not open yet (`pending`) is the same words as plain text: it keeps receding under the
 * pointer and offers no press.
 */
export const siteBarLinkStyle = defineSlotStyle({
  slot: "site-bar-link",
  base:
    "block cursor-pointer rounded-(--site-radius-md) px-3 py-1.5 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) text-inherit no-underline outline-none transition-opacity duration-(--site-duration-fast) ease-(--site-ease) focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {
    current: {
      true: "font-(--site-fw-strong)",
      false: "opacity-(--site-recede) hover:opacity-100",
    },
    pending: {
      true: "cursor-default hover:opacity-(--site-recede)",
      false: "",
    },
  },
  defaultVariants: { current: false, pending: false },
});

/** The room that pushes what follows it to the end of a row: the bar's action, the footer's links. */
export const siteSpacerStyle = defineSlotStyle({
  slot: "site-spacer",
  base: "flex-1",
  variants: {},
  defaultVariants: {},
});

/** The signed-in account's link: its name, which a narrow page leaves to screen readers, and its avatar. */
export const siteBarAccountStyle = defineSlotStyle({
  slot: "site-bar-account",
  base:
    "flex shrink-0 cursor-pointer items-center gap-2 rounded-(--site-radius-md) px-1.5 py-1 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) text-inherit no-underline outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) hover:bg-(--site-surface-sunken) focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {
    current: {
      true: "",
      false: "",
    },
  },
  defaultVariants: { current: false },
});

/** The account's name beside the avatar; below the narrow tier only a screen reader reads it. */
export const siteBarAccountNameStyle = defineSlotStyle({
  slot: "site-bar-account-name",
  base: "@max-page-narrow/page:sr-only",
  variants: {},
  defaultVariants: {},
});

/** The account's avatar: its initial on the accent's soft ground. */
export const siteAvatarStyle = defineSlotStyle({
  slot: "site-avatar",
  base:
    "grid size-6 shrink-0 place-items-center overflow-clip rounded-(--site-radius-full) bg-(--site-accent-soft) text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-strong) text-(--site-accent-text)",
  variants: {},
  defaultVariants: {},
});

/** The more menu's trigger: drawn only below the narrow tier, where the page links leave the bar. */
export const siteBarMoreStyle = defineSlotStyle({
  slot: "site-bar-more",
  base:
    "hidden size-9 shrink-0 cursor-pointer items-center justify-center rounded-(--site-radius-md) border-0 bg-transparent text-inherit outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) hover:bg-(--site-surface-sunken) focus-visible:shadow-[var(--site-focus-ring)] @max-page-narrow/page:inline-flex",
  variants: {},
  defaultVariants: {},
});

/** The more menu's glyph, three dots. */
export const siteBarMoreGlyphStyle = defineSlotStyle({
  slot: "site-bar-more-glyph",
  base: "size-4",
  variants: {},
  defaultVariants: {},
});

/** The more menu's list of the site's pages, under the bar at its end. */
export const siteBarMenuStyle = defineSlotStyle({
  slot: "site-bar-menu",
  base:
    "absolute top-full right-4 z-10 mt-1 hidden min-w-40 flex-col gap-0.5 rounded-(--site-radius-md) border border-(--site-line) bg-(--site-surface) p-1 text-(--site-ink) shadow-[var(--site-shadow-float)] @max-page-narrow/page:flex",
  variants: {},
  defaultVariants: {},
});

/** One page, or one visitor action, in the more menu. */
export const siteBarMenuItemStyle = defineSlotStyle({
  slot: "site-bar-menu-item",
  base:
    "block w-full cursor-pointer rounded-(--site-radius-sm) border-0 bg-transparent px-3 py-2 text-start text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) text-inherit no-underline outline-none hover:bg-(--site-surface-sunken) focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {
    current: {
      true: "font-(--site-fw-strong)",
      false: "",
    },
    // A page not open yet: plain text in the menu, faint, with no ground under the pointer.
    pending: {
      true: "cursor-default opacity-(--site-recede) hover:bg-transparent",
      false: "",
    },
  },
  defaultVariants: { current: false, pending: false },
});

/** The site footer: the owner, then the legal links and the language picker at the end. */
export const siteFooterStyle = defineSlotStyle({
  slot: "site-footer",
  base:
    "flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-(--site-line) bg-(--site-surface) px-6 py-4 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted) @max-page-narrow/page:px-4",
  variants: {},
  defaultVariants: {},
});

/** Who runs the site, at the footer's start. */
export const siteFooterOwnerStyle = defineSlotStyle({
  slot: "site-footer-owner",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** The legal links; they stand in the footer's own row. */
export const siteFooterLinksStyle = defineSlotStyle({
  slot: "site-footer-links",
  base: "contents",
  variants: {},
  defaultVariants: {},
});

/**
 * One legal link, at least 24 CSS px tall (WCAG 2.2, target size): in a line of small print the
 * link's own line is 16px, so the box takes the minimum and centres the words in it.
 * `emphasis` draws the one a law asks to stand out (a privacy policy) in full ink. A
 * page that is not open yet (`pending`) is the same words as plain text, with no underline under the
 * pointer and no press.
 */
export const siteFooterLinkStyle = defineSlotStyle({
  slot: "site-footer-link",
  base:
    "inline-flex min-h-6 cursor-pointer items-center rounded-(--site-radius-xs) text-inherit no-underline underline-offset-2 outline-none hover:underline focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {
    emphasis: {
      true: "font-(--site-fw-strong) text-(--site-ink)",
      false: "",
    },
    pending: {
      true: "cursor-default hover:no-underline",
      false: "",
    },
  },
  defaultVariants: { emphasis: false, pending: false },
});

/** The place the product's theme control stands, after the language picker at the footer's end. */
export const siteFooterThemeStyle = defineSlotStyle({
  slot: "site-footer-theme",
  base: "flex shrink-0 items-center",
  variants: {},
  defaultVariants: {},
});

/** The place the product's language picker stands, at the footer's end. */
export const siteFooterLanguageStyle = defineSlotStyle({
  slot: "site-footer-language",
  base: "flex shrink-0 items-center",
  variants: {},
  defaultVariants: {},
});
