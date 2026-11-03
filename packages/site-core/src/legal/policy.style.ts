import { defineSlotStyle } from "@simplix-react/ui/design";

import { SITE_CARD } from "../page/site-page.style";

/**
 * A numbered section of a policy: its heading, its words, then its table, cards or notice. `voice` is
 * the section about the reader's own voice, set apart on the voice's soft ground with its outline.
 */
export const siteLegalSectionStyle = defineSlotStyle({
  slot: "site-legal-section",
  base: "flex min-w-0 scroll-mt-4 flex-col gap-3",
  variants: {
    tone: {
      plain: "",
      voice: "rounded-(--site-radius-xl) border border-(--site-voice) bg-(--site-voice-soft) p-4",
    },
  },
  defaultVariants: { tone: "plain" },
});

/** A section's heading with the chip that says what kind of data it is about; they wrap. */
export const siteLegalSectionHeadStyle = defineSlotStyle({
  slot: "site-legal-section-head",
  base: "flex min-w-0 flex-wrap items-center gap-2",
  variants: {},
  defaultVariants: {},
});

/** The policy at a glance: cards three to a row, two below the narrow tier, each jumping to its section. */
export const siteGlanceGridStyle = defineSlotStyle({
  slot: "site-glance-grid",
  base: "grid min-w-0 grid-cols-3 gap-2 @max-page-narrow/page:grid-cols-2",
  variants: {},
  defaultVariants: {},
});

/** One card at a glance, a button to its section; the one about the reader's voice is outlined in the voice. */
export const siteGlanceStyle = defineSlotStyle({
  slot: "site-glance",
  base:
    "flex min-w-0 cursor-pointer flex-col gap-0.5 rounded-(--site-radius-lg) border bg-(--site-surface) px-3 py-2.5 text-left font-(family-name:--site-font-sans) text-(--site-ink) outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {
    tone: {
      plain: "border-(--site-line) hover:border-(--site-control-line)",
      voice: "border-(--site-voice) hover:bg-(--site-voice-soft)",
    },
  },
  defaultVariants: { tone: "plain" },
});

/** A glance card's title. */
export const siteGlanceTitleStyle = defineSlotStyle({
  slot: "site-glance-title",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** A glance card's words, muted and small. */
export const siteGlanceTextStyle = defineSlotStyle({
  slot: "site-glance-text",
  base: "text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The reader's rights, cards two to a row, one below the narrow tier. */
export const siteRightsGridStyle = defineSlotStyle({
  slot: "site-rights-grid",
  base: "grid min-w-0 grid-cols-2 gap-2 @max-page-narrow/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

/** One right: what it is, how to use it, and the page of My account where it is done. */
export const siteRightsCardStyle = defineSlotStyle({
  slot: "site-rights-card",
  base: SITE_CARD,
  variants: {},
  defaultVariants: {},
});

/** A right's name. */
export const siteRightsTitleStyle = defineSlotStyle({
  slot: "site-rights-title",
  base: "font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** How a right is used, muted. */
export const siteRightsTextStyle = defineSlotStyle({
  slot: "site-rights-text",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Where else to turn: tiles four to a row, two below the medium tier. */
export const siteAgencyGridStyle = defineSlotStyle({
  slot: "site-agency-grid",
  base: "grid min-w-0 grid-cols-4 gap-2 @max-page-medium/page:grid-cols-2",
  variants: {},
  defaultVariants: {},
});

/** One agency on the sunken ground: its name, its number and its site. */
export const siteAgencyStyle = defineSlotStyle({
  slot: "site-agency",
  base: "flex min-w-0 flex-col gap-0.5 rounded-(--site-radius-lg) bg-(--site-surface-sunken) px-3 py-2.5 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** The agency's name. */
export const siteAgencyNameStyle = defineSlotStyle({
  slot: "site-agency-name",
  base: "font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The agency's number, large in the display family. */
export const siteAgencyPhoneStyle = defineSlotStyle({
  slot: "site-agency-phone",
  base: "font-(family-name:--site-font-display) text-(length:--site-fs-heading) leading-(--site-lh-heading) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** The agency's site, muted. */
export const siteAgencySiteStyle = defineSlotStyle({
  slot: "site-agency-site",
  base: "text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});
