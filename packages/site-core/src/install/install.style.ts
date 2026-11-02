import { defineSlotStyle } from "@simplix-react/ui/design";

import { SITE_CARD, SITE_CARD_GROUND } from "../page/site-page.style";

/** The check of this computer: one row that wraps, its words and chips changing as the check runs. */
export const siteCheckStyle = defineSlotStyle({
  slot: "site-check",
  base: `flex min-w-0 flex-row flex-wrap items-center ${SITE_CARD_GROUND}`,
  variants: {},
  defaultVariants: {},
});

/** The check's words: the question before it runs, what it is doing, then what it read. */
export const siteCheckTitleStyle = defineSlotStyle({
  slot: "site-check-title",
  base: "font-(--site-fw-strong)",
  variants: {
    grow: {
      true: "min-w-0 flex-1",
      false: "",
    },
  },
  defaultVariants: { grow: false },
});

/** What the check concludes, in the colour of the conclusion. */
export const siteCheckVerdictStyle = defineSlotStyle({
  slot: "site-check-verdict",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {
    tone: {
      good: "text-(--site-good)",
      bad: "text-(--site-bad)",
    },
  },
  defaultVariants: { tone: "good" },
});

/** The downloads side by side, one below the narrow tier. */
export const siteDownloadGridStyle = defineSlotStyle({
  slot: "site-download-grid",
  base: "grid min-w-0 grid-cols-2 gap-3 @max-page-narrow/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

/** One download: what it is for, what it needs, its file and its action; the one to take first is outlined in the accent. */
export const siteDownloadStyle = defineSlotStyle({
  slot: "site-download",
  base: SITE_CARD,
  variants: {
    highlight: {
      true: "border-(--site-accent)",
      false: "",
    },
  },
  defaultVariants: { highlight: false },
});

/** A card's title at the subheading size. */
export const siteCardTitleStyle = defineSlotStyle({
  slot: "site-card-title",
  base: "text-(length:--site-fs-subheading) leading-(--site-lh-subheading) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** A card's muted words under its title. */
export const siteCardTextStyle = defineSlotStyle({
  slot: "site-card-text",
  base: "m-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The file a download gives, in the mono family. */
export const siteDownloadFileStyle = defineSlotStyle({
  slot: "site-download-file",
  base:
    "font-(family-name:--site-font-mono) text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Where a download's action stands: at the card's start, its own width. */
export const siteDownloadActionStyle = defineSlotStyle({
  slot: "site-download-action",
  base: "flex self-start",
  variants: {},
  defaultVariants: {},
});

/** A notice standing above a page's parts, outlined in the accent (open this page on the computer). */
export const siteNoticeStyle = defineSlotStyle({
  slot: "site-notice",
  base: SITE_CARD,
  // The outline is a variant so it is written after the card's hairline and wins over it.
  variants: {
    tone: {
      accent: "border-(--site-accent)",
    },
  },
  defaultVariants: { tone: "accent" },
});

/** A notice's title at the text size. */
export const siteNoticeTitleStyle = defineSlotStyle({
  slot: "site-notice-title",
  base: "font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** Install steps, one card under the other. */
export const siteInstallStepsStyle = defineSlotStyle({
  slot: "site-install-steps",
  base: "m-0 flex min-w-0 list-none flex-col gap-3 p-0",
  variants: {},
  defaultVariants: {},
});

/** One install step: what to do beside a sketch of what the screen shows; stacked below the narrow tier. */
export const siteInstallStepStyle = defineSlotStyle({
  slot: "site-install-step",
  base:
    "grid min-w-0 grid-cols-2 items-center gap-4 rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface) p-4 @max-page-narrow/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

/** The step's number and words. */
export const siteInstallStepHeadStyle = defineSlotStyle({
  slot: "site-install-step-head",
  base: "flex min-w-0 gap-3",
  variants: {},
  defaultVariants: {},
});

/** The step's number on an accent disc. */
export const siteStepDiscStyle = defineSlotStyle({
  slot: "site-step-disc",
  base:
    "grid size-7 shrink-0 place-items-center rounded-(--site-radius-full) bg-(--site-accent) font-(family-name:--site-font-mono) text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-strong) text-(--site-on-accent) [&_svg]:size-3.5",
  variants: {
    done: {
      true: "bg-(--site-good)",
      false: "",
    },
  },
  defaultVariants: { done: false },
});

/** The step's title, tag and what to do, one under the other. */
export const siteInstallStepTextStyle = defineSlotStyle({
  slot: "site-install-step-text",
  base: "flex min-w-0 flex-col gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** The step's title at the text size. */
export const siteInstallStepTitleStyle = defineSlotStyle({
  slot: "site-install-step-title",
  base: "font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** Where a step's tag stands: at the start, its own width. */
export const siteInstallStepTagStyle = defineSlotStyle({
  slot: "site-install-step-tag",
  base: "flex self-start",
  variants: {},
  defaultVariants: {},
});

/** What the step asks, muted. */
export const siteInstallStepBodyStyle = defineSlotStyle({
  slot: "site-install-step-body",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** A drawn stand-in for the screen a step shows: a window with a title bar and one thing on it. */
export const siteSketchStyle = defineSlotStyle({
  slot: "site-sketch",
  base: "relative h-20 min-w-0 overflow-hidden rounded-(--site-radius-lg) border border-(--site-line) bg-(--site-surface-sunken)",
  variants: {},
  defaultVariants: {},
});

/** The sketch's title bar: a short bar and a long one. */
export const siteSketchBarStyle = defineSlotStyle({
  slot: "site-sketch-bar",
  base: "flex h-4 gap-1 bg-(--site-surface) px-2 py-1",
  variants: {},
  defaultVariants: {},
});

/** One bar of the sketch's title bar; `accent` marks the place the step points at. */
export const siteSketchLineStyle = defineSlotStyle({
  slot: "site-sketch-line",
  base: "block rounded-(--site-radius-xs)",
  variants: {
    span: {
      short: "w-1/4 bg-(--site-line)",
      long: "flex-1 bg-(--site-line)",
      accent: "flex-1 bg-(--site-accent-soft)",
    },
  },
  defaultVariants: { span: "short" },
});

/** The words on the sketch; a sketch with a progress bar holds them a step higher. */
export const siteSketchLabelStyle = defineSlotStyle({
  slot: "site-sketch-label",
  base: "absolute left-3 text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label)",
  variants: {
    kind: {
      progress: "top-6",
      pill: "top-7",
      code: "top-7 font-(family-name:--site-font-mono) text-(length:--site-fs-heading) leading-(--site-lh-heading) tracking-(--site-tracking-code)",
    },
  },
  defaultVariants: { kind: "pill" },
});

/** The sketch's progress bar along its foot. */
export const siteSketchTrackStyle = defineSlotStyle({
  slot: "site-sketch-track",
  base: "absolute right-3 bottom-3.5 left-3 h-2 overflow-hidden rounded-(--site-radius-full) bg-(--site-line)",
  variants: {},
  defaultVariants: {},
});

/** The share of the sketch's progress bar done. */
export const siteSketchFillStyle = defineSlotStyle({
  slot: "site-sketch-fill",
  base: "block h-full rounded-(--site-radius-full) bg-(--site-accent)",
  variants: {},
  defaultVariants: {},
});

/** The button the sketch points at, on the voice's soft ground. */
export const siteSketchPillStyle = defineSlotStyle({
  slot: "site-sketch-pill",
  base:
    "absolute top-6 right-3 rounded-(--site-radius-md) bg-(--site-voice-soft) px-2 py-0.5 text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) text-(--site-voice-text)",
  variants: {},
  defaultVariants: {},
});

/** A video: the play toggle, its title and what it shows, and how much of it has played. */
export const siteVideoStyle = defineSlotStyle({
  slot: "site-video",
  base: SITE_CARD,
  variants: {},
  defaultVariants: {},
});

/** The video's toggle and words. */
export const siteVideoRowStyle = defineSlotStyle({
  slot: "site-video-row",
  base: "flex min-w-0 items-center gap-3",
  variants: {},
  defaultVariants: {},
});

/** A round play and pause toggle in the accent. */
export const siteVideoToggleStyle = defineSlotStyle({
  slot: "site-video-toggle",
  base:
    "grid size-11 shrink-0 cursor-pointer place-items-center rounded-(--site-radius-full) border-0 bg-(--site-accent) p-0 text-(--site-on-accent) outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) hover:bg-(--site-accent-strong) focus-visible:shadow-[var(--site-focus-ring)] [&_svg]:size-4",
  variants: {},
  defaultVariants: {},
});

/** The video's title and what it shows. */
export const siteVideoTextStyle = defineSlotStyle({
  slot: "site-video-text",
  base: "flex min-w-0 flex-1 flex-col",
  variants: {},
  defaultVariants: {},
});

/** The video's title. */
export const siteVideoTitleStyle = defineSlotStyle({
  slot: "site-video-title",
  base: "font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** How much of something has played or is done: a thin track and its filled share. */
export const siteProgressStyle = defineSlotStyle({
  slot: "site-progress",
  base: "relative block h-1.5 overflow-hidden rounded-(--site-radius-full) bg-(--site-surface-sunken)",
  variants: {},
  defaultVariants: {},
});

/** The filled share of a progress track. */
export const siteProgressFillStyle = defineSlotStyle({
  slot: "site-progress-fill",
  base: "absolute inset-y-0 left-0 block bg-(--site-accent) transition-[width] duration-(--site-duration-fast) ease-(--site-ease)",
  variants: {},
  defaultVariants: {},
});

/** A line of words that ends in an action (not working? see troubleshooting). */
export const siteActionLineStyle = defineSlotStyle({
  slot: "site-action-line",
  base: "m-0 flex min-w-0 flex-wrap items-center gap-2 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Questions that open to their answers, one at a time, ruled apart on one card. */
export const siteDisclosureListStyle = defineSlotStyle({
  slot: "site-disclosure-list",
  base: "flex min-w-0 flex-col divide-y divide-(--site-line) overflow-hidden rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface)",
  variants: {},
  defaultVariants: {},
});

/** One question and, when open, its answer. */
export const siteDisclosureStyle = defineSlotStyle({
  slot: "site-disclosure",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** The question, a full-width button that opens and closes its answer. */
export const siteDisclosureButtonStyle = defineSlotStyle({
  slot: "site-disclosure-button",
  base:
    "flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-4 py-3.5 text-left font-(family-name:--site-font-sans) text-(length:--site-fs-base) leading-(--site-lh-base) font-(--site-fw-strong) text-(--site-ink) outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) hover:bg-(--site-surface-sunken) focus-visible:shadow-[var(--site-focus-ring-inset)]",
  variants: {},
  defaultVariants: {},
});

/** The question's words. */
export const siteDisclosureLabelStyle = defineSlotStyle({
  slot: "site-disclosure-label",
  base: "min-w-0 flex-1",
  variants: {},
  defaultVariants: {},
});

/** The chevron that turns over when the answer is open. */
export const siteDisclosureMarkStyle = defineSlotStyle({
  slot: "site-disclosure-mark",
  base: "flex shrink-0 transition-transform duration-(--site-duration-fast) ease-(--site-ease) [&_svg]:size-4",
  variants: {
    open: {
      true: "rotate-180",
      false: "",
    },
  },
  defaultVariants: { open: false },
});

/** The answer: what is wrong, what to do, and a message to copy. */
export const siteDisclosurePanelStyle = defineSlotStyle({
  slot: "site-disclosure-panel",
  base: "flex min-w-0 flex-col gap-2 px-4 pb-4 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane)",
  variants: {},
  defaultVariants: {},
});

/** The answer's words, the cause first in the strong weight. */
export const siteDisclosureTextStyle = defineSlotStyle({
  slot: "site-disclosure-text",
  base: "m-0",
  variants: {},
  defaultVariants: {},
});

/** The cause at the start of an answer. */
export const siteDisclosureLeadStyle = defineSlotStyle({
  slot: "site-disclosure-lead",
  base: "font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** Numbered things to do, muted. */
export const siteNumberedListStyle = defineSlotStyle({
  slot: "site-numbered-list",
  base: "m-0 flex min-w-0 list-decimal flex-col gap-1 pl-5 text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** One thing to do. */
export const siteNumberedItemStyle = defineSlotStyle({
  slot: "site-numbered-item",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** A message to copy as it is (for an IT administrator), and the button that copies it. */
export const siteCopyStyle = defineSlotStyle({
  slot: "site-copy",
  base: "flex min-w-0 flex-col items-start gap-2",
  variants: {},
  defaultVariants: {},
});

/** The message, kept as written, in the mono family on a sunken ground. */
export const siteCopyTextStyle = defineSlotStyle({
  slot: "site-copy-text",
  base:
    "m-0 w-full whitespace-pre-wrap break-words rounded-(--site-radius-lg) border border-(--site-line) bg-(--site-surface-sunken) px-3 py-2.5 font-(family-name:--site-font-mono) text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label)",
  variants: {},
  defaultVariants: {},
});
