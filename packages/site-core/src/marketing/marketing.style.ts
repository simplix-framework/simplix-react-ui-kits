import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The hero: a band across the window holding the pitch and its media side by side. It is its own
 * band (`data-band`), so a dark hero redefines the ground, ink, line and accent for what it holds.
 */
export const siteHeroStyle = defineSlotStyle({
  slot: "site-hero",
  base: "min-w-0 bg-(--site-canvas) text-(--site-ink)",
  variants: {},
  defaultVariants: {},
});

/** The hero's column: the pitch and the media two to a row, one below the medium tier. */
export const siteHeroInnerStyle = defineSlotStyle({
  slot: "site-hero-inner",
  base:
    "mx-auto grid w-full min-w-0 max-w-(--site-page-wide) grid-cols-2 items-center gap-10 px-6 py-14 @max-page-medium/page:grid-cols-1 @max-page-narrow/page:px-4 @max-page-narrow/page:py-8",
  variants: {},
  defaultVariants: {},
});

/** The pitch: eyebrow, title, lede, actions and the facts line, one under the other. */
export const siteHeroCopyStyle = defineSlotStyle({
  slot: "site-hero-copy",
  base: "flex min-w-0 flex-col gap-4",
  variants: {},
  defaultVariants: {},
});

/** The line above the title, in the mono family and the accent. */
export const siteHeroEyebrowStyle = defineSlotStyle({
  slot: "site-hero-eyebrow",
  base:
    "font-(family-name:--site-font-mono) text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-strong) tracking-(--site-tracking-wide) text-(--site-accent-text)",
  variants: {},
  defaultVariants: {},
});

/** The page's one h1 at the display size; a narrow page draws it a step smaller. */
export const siteHeroTitleStyle = defineSlotStyle({
  slot: "site-hero-title",
  base:
    "m-0 text-balance font-(family-name:--site-font-display) text-(length:--site-fs-display-xl) leading-(--site-lh-display-xl) font-(--site-fw-display) tracking-(--site-tracking-display) @max-page-narrow/page:text-(length:--site-fs-display) @max-page-narrow/page:leading-(--site-lh-display)",
  variants: {},
  defaultVariants: {},
});

/** The title's second line, in the voice colour. */
export const siteHeroAccentStyle = defineSlotStyle({
  slot: "site-hero-accent",
  base: "text-(--site-voice) not-italic",
  variants: {},
  defaultVariants: {},
});

/** The sentence under the title. */
export const siteHeroLedeStyle = defineSlotStyle({
  slot: "site-hero-lede",
  base: "m-0 text-(length:--site-fs-body) leading-(--site-lh-body) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The hero's actions, the strongest first; they wrap on a narrow page. */
export const siteHeroActionsStyle = defineSlotStyle({
  slot: "site-hero-actions",
  base: "flex min-w-0 flex-wrap gap-2",
  variants: {},
  defaultVariants: {},
});

/** What the product needs, in one small line under the actions. */
export const siteHeroFactsStyle = defineSlotStyle({
  slot: "site-hero-facts",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The place beside the pitch where the product shows itself (a player, a picture). */
export const siteHeroMediaStyle = defineSlotStyle({
  slot: "site-hero-media",
  base: "flex min-w-0 flex-col",
  variants: {},
  defaultVariants: {},
});

/** A raised card holding a player: a choice, the sentence read along, the wave and the play row. */
export const sitePlayerStyle = defineSlotStyle({
  slot: "site-player",
  base:
    "flex min-w-0 flex-col gap-4 rounded-(--site-radius-2xl) border border-(--site-line) bg-(--site-surface) p-5 shadow-[var(--site-shadow-window)]",
  variants: {},
  defaultVariants: {},
});

/** The sentence a player reads, each word lit as the voice reaches it. */
export const siteReadAlongStyle = defineSlotStyle({
  slot: "site-read-along",
  base: "m-0 text-(length:--site-fs-heading) leading-(--site-lh-reading) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/**
 * One word of the sentence: `rest` before the voice starts, `upcoming` and `read` around the word
 * being spoken, which stands on the voice's soft ground.
 */
export const siteReadWordStyle = defineSlotStyle({
  slot: "site-read-word",
  base: "rounded-(--site-radius-xs) transition-colors duration-(--site-duration-fast) ease-(--site-ease)",
  variants: {
    state: {
      rest: "",
      read: "text-(--site-ink)",
      spoken: "bg-(--site-voice-soft) text-(--site-voice-text)",
      upcoming: "text-(--site-ink-muted)",
    },
  },
  defaultVariants: { state: "rest" },
});

/** The row under the wave: the play toggle and what is playing. */
export const sitePlayerRowStyle = defineSlotStyle({
  slot: "site-player-row",
  base: "flex min-w-0 items-center gap-3",
  variants: {},
  defaultVariants: {},
});

/** A round play and stop toggle in the voice colour. */
export const sitePlayToggleStyle = defineSlotStyle({
  slot: "site-play-toggle",
  base:
    "grid size-10 shrink-0 cursor-pointer place-items-center rounded-(--site-radius-full) border-0 bg-(--site-voice) p-0 text-(--site-on-voice) outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) hover:bg-(--site-voice-strong) focus-visible:shadow-[var(--site-focus-ring)] [&_svg]:size-4",
  variants: {},
  defaultVariants: {},
});

/** What the player plays now, beside the toggle. */
export const sitePlayerCaptionStyle = defineSlotStyle({
  slot: "site-player-caption",
  base: "min-w-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A voice drawn as bars on the time axis; it takes its column's width. */
export const siteWaveStyle = defineSlotStyle({
  slot: "site-wave",
  base: "block w-full max-w-full",
  variants: {},
  defaultVariants: {},
});

/** One bar of a wave: the share played is drawn in the accent, the rest in the wave's rest colour. */
export const siteWaveBarStyle = defineSlotStyle({
  slot: "site-wave-bar",
  base: "transition-colors duration-(--site-duration-fast) ease-(--site-ease)",
  variants: {
    played: {
      true: "fill-(--site-accent)",
      false: "fill-(--site-wave-rest)",
    },
  },
  defaultVariants: { played: false },
});

/** A row of bars drawn as a picture (lines of notes, lengths of slides), standing on its foot. */
export const siteBarsStyle = defineSlotStyle({
  slot: "site-bars",
  base: "flex h-13 min-w-0 items-end gap-1",
  variants: {},
  defaultVariants: {},
});

/** One bar of a picture: `soft` on the accent's soft ground, `strong` in the accent. */
export const siteBarsBarStyle = defineSlotStyle({
  slot: "site-bars-bar",
  base: "block min-w-0",
  variants: {
    tone: {
      soft: "flex-1 rounded-(--site-radius-xs) bg-(--site-accent-soft)",
      strong: "h-8.5 rounded-(--site-radius-md) bg-(--site-accent)",
    },
  },
  defaultVariants: { tone: "soft" },
});

/** A section whose heading and lede stand beside its content, one under the other below the medium tier. */
export const siteSplitStyle = defineSlotStyle({
  slot: "site-split",
  base: "grid min-w-0 grid-cols-2 items-center gap-6 @max-page-medium/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

/** The split section's heading and lede. */
export const siteSplitHeadStyle = defineSlotStyle({
  slot: "site-split-head",
  base: "flex min-w-0 flex-col gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** A display heading that opens a part of a marketing page. */
export const siteDisplayHeadingStyle = defineSlotStyle({
  slot: "site-display-heading",
  base:
    "m-0 font-(family-name:--site-font-display) text-(length:--site-fs-headline) leading-(--site-lh-headline) font-(--site-fw-title) tracking-(--site-tracking-display)",
  variants: {},
  defaultVariants: {},
});

/** The sentence under a display heading. */
export const siteSplitLedeStyle = defineSlotStyle({
  slot: "site-split-lede",
  base: "m-0 text-(length:--site-fs-body) leading-(--site-lh-body) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Samples one under the other. */
export const siteSampleListStyle = defineSlotStyle({
  slot: "site-sample-list",
  base: "flex min-w-0 flex-col gap-2",
  variants: {},
  defaultVariants: {},
});

/** One sample to hear: a play disc, the sample's name and where it is made, and its text or its wave. */
export const siteSampleStyle = defineSlotStyle({
  slot: "site-sample",
  base:
    "flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-(--site-radius-xl) border px-3 py-2.5 text-left font-(family-name:--site-font-sans) text-(length:--site-fs-base) leading-(--site-lh-base) font-(--site-fw-base) text-(--site-ink) outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) focus-visible:shadow-[var(--site-focus-ring)] disabled:cursor-not-allowed disabled:opacity-(--site-faint)",
  variants: {
    playing: {
      true: "border-(--site-voice) bg-(--site-voice-soft)",
      false: "border-(--site-line) bg-(--site-surface) hover:bg-(--site-surface-sunken)",
    },
  },
  defaultVariants: { playing: false },
});

/** The sample's play disc: sunken at rest, the voice colour while it plays. */
export const siteSampleDiscStyle = defineSlotStyle({
  slot: "site-sample-disc",
  base:
    "grid size-8.5 shrink-0 place-items-center rounded-(--site-radius-full) transition-colors duration-(--site-duration-fast) ease-(--site-ease) [&_svg]:size-3.5",
  variants: {
    playing: {
      true: "bg-(--site-voice) text-(--site-on-voice)",
      false: "bg-(--site-surface-sunken) text-(--site-ink)",
    },
  },
  defaultVariants: { playing: false },
});

/** The sample's words: its name line over its text or its wave. */
export const siteSampleBodyStyle = defineSlotStyle({
  slot: "site-sample-body",
  base: "flex min-w-0 flex-1 flex-col gap-1",
  variants: {},
  defaultVariants: {},
});

/** The sample's name and where it is made, on one line. */
export const siteSampleHeadStyle = defineSlotStyle({
  slot: "site-sample-head",
  base: "flex min-w-0 items-baseline gap-2",
  variants: {},
  defaultVariants: {},
});

/** The sample's name. */
export const siteSampleNameStyle = defineSlotStyle({
  slot: "site-sample-name",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** Where the sample is made and what it costs, small and muted after the name. */
export const siteSampleMetaStyle = defineSlotStyle({
  slot: "site-sample-meta",
  base:
    "truncate text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The line under the name, one wave high: the sample's text at rest, its wave while it plays. */
export const siteSampleLineStyle = defineSlotStyle({
  slot: "site-sample-line",
  base: "relative flex h-7.5 min-w-0 items-center",
  variants: {},
  defaultVariants: {},
});

/** The sample's text, cut to one line. */
export const siteSampleTextStyle = defineSlotStyle({
  slot: "site-sample-text",
  base: "truncate text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Numbered steps: a display heading, the step cards and a line of notes under them. */
export const siteStepsStyle = defineSlotStyle({
  slot: "site-steps",
  base: "flex min-w-0 flex-col gap-4",
  variants: {},
  defaultVariants: {},
});

/** The step cards, three to a row, one below the medium tier. */
export const siteStepsListStyle = defineSlotStyle({
  slot: "site-steps-list",
  base: "m-0 grid min-w-0 list-none grid-cols-3 gap-3 p-0 @max-page-medium/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

/** One step: its number, a picture, its title and what it does. */
export const siteStepStyle = defineSlotStyle({
  slot: "site-step",
  base: "flex min-w-0 flex-col gap-2 rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface) p-4",
  variants: {},
  defaultVariants: {},
});

/** The step's number, two digits in the mono family. */
export const siteStepNumberStyle = defineSlotStyle({
  slot: "site-step-number",
  base:
    "font-(family-name:--site-font-mono) text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The step's picture, one bar strip high. */
export const siteStepMediaStyle = defineSlotStyle({
  slot: "site-step-media",
  base: "flex min-h-13 min-w-0 flex-col justify-end",
  variants: {},
  defaultVariants: {},
});

/** The step's title. */
export const siteStepTitleStyle = defineSlotStyle({
  slot: "site-step-title",
  base: "m-0 text-(length:--site-fs-subheading) leading-(--site-lh-subheading) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** What the step does. */
export const siteStepBodyStyle = defineSlotStyle({
  slot: "site-step-body",
  base: "m-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Short promises under the steps, side by side; they wrap. */
export const siteNoteListStyle = defineSlotStyle({
  slot: "site-note-list",
  base:
    "m-0 flex min-w-0 list-none flex-wrap gap-x-6 gap-y-2 p-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** One promise, its mark first. */
export const siteNoteStyle = defineSlotStyle({
  slot: "site-note",
  base: "flex items-center gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** The mark before a promise, in the accent. */
export const siteNoteMarkStyle = defineSlotStyle({
  slot: "site-note-mark",
  base: "flex shrink-0 text-(--site-accent) [&_svg]:size-3.5",
  variants: {},
  defaultVariants: {},
});
