import { defineSlotStyle } from "@simplix-react/ui/design";

/** The label type every word of a sketch is set in: small, strong, slightly tracked. */
const SKETCH_TYPE = "text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label)";

/**
 * A small drawn window of the product, the picture a help article shows beside a step: a hairline
 * card on the surface with the float shadow, at most the small container's width, centred.
 */
export const siteScreenStyle = defineSlotStyle({
  slot: "site-screen",
  base: `mx-auto flex w-full max-w-sm min-w-0 flex-col overflow-hidden rounded-(--site-radius-lg) border border-(--site-line) bg-(--site-surface) text-(--site-ink) shadow-[var(--site-shadow-float)] ${SKETCH_TYPE}`,
  variants: {},
  defaultVariants: {},
});

/** The sketch's title bar on the sunken ground, its close mark at the end. */
export const siteScreenHeadStyle = defineSlotStyle({
  slot: "site-screen-head",
  base: "flex items-center justify-between border-b border-(--site-line) bg-(--site-surface-sunken) px-2.5 py-1.5",
  variants: {},
  defaultVariants: {},
});

/** The close mark in the title bar, a glyph the product draws. */
export const siteScreenCloseStyle = defineSlotStyle({
  slot: "site-screen-close",
  base: "flex shrink-0 text-(--site-ink-muted) [&_svg]:size-3",
  variants: {},
  defaultVariants: {},
});

/** What the sketched screen holds, in rows. */
export const siteScreenBodyStyle = defineSlotStyle({
  slot: "site-screen-body",
  base: "flex flex-col gap-0.5 py-1.5",
  variants: {},
  defaultVariants: {},
});

/** The sketch's footer: a line of words and an action pill at the end. */
export const siteScreenFootStyle = defineSlotStyle({
  slot: "site-screen-foot",
  base: "flex items-center justify-between gap-2 border-t border-(--site-line) px-2.5 py-1.5",
  variants: {},
  defaultVariants: {},
});

/** One row of the sketched screen; a failed one sits on the bad state's soft ground. */
export const siteScreenRowStyle = defineSlotStyle({
  slot: "site-screen-row",
  base: "flex min-w-0 flex-col gap-1 px-2.5 py-1.5",
  variants: {
    state: {
      ok: "",
      bad: "rounded-(--site-radius-md) bg-(--site-bad-soft)",
      wait: "",
    },
  },
  defaultVariants: { state: "ok" },
});

/** The row's own line: its disc, its words and its figure. */
export const siteScreenLineStyle = defineSlotStyle({
  slot: "site-screen-line",
  base: "flex min-w-0 items-center gap-2",
  variants: {},
  defaultVariants: {},
});

/** The row's state as a disc: good with a tick, bad with a mark, an empty ring while it waits. */
export const siteScreenDiscStyle = defineSlotStyle({
  slot: "site-screen-disc",
  base: `grid size-4 shrink-0 place-items-center rounded-(--site-radius-full) [&_svg]:size-2.5 ${SKETCH_TYPE}`,
  variants: {
    state: {
      ok: "bg-(--site-good) text-(--site-on-accent)",
      bad: "bg-(--site-bad) text-(--site-on-accent)",
      wait: "border border-(--site-line)",
    },
  },
  defaultVariants: { state: "ok" },
});

/** The row's words, cut to one line. */
export const siteScreenTextStyle = defineSlotStyle({
  slot: "site-screen-text",
  base: "min-w-0 flex-1 truncate",
  variants: {},
  defaultVariants: {},
});

/** The row's figure at its end, in the mono family. */
export const siteScreenMetaStyle = defineSlotStyle({
  slot: "site-screen-meta",
  base: "shrink-0 font-(family-name:--site-font-mono) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** Words under a row or in a sketch's parts: plain, muted, or in the bad state's colour. */
export const siteScreenWordsStyle = defineSlotStyle({
  slot: "site-screen-words",
  base: "",
  variants: {
    tone: {
      plain: "",
      muted: "text-(--site-ink-muted)",
      bad: "text-(--site-bad)",
    },
  },
  defaultVariants: { tone: "plain" },
});

/** Pills side by side under a row. */
export const siteScreenPillsStyle = defineSlotStyle({
  slot: "site-screen-pills",
  base: "flex gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** A button of the sketched screen, drawn as a pill: outlined, in the accent, or in the voice colour. */
export const siteScreenPillStyle = defineSlotStyle({
  slot: "site-screen-pill",
  base: "rounded-(--site-radius-md) px-2 py-0.5",
  variants: {
    tone: {
      plain: "border border-(--site-line)",
      accent: "bg-(--site-accent) text-(--site-on-accent)",
      voice: "bg-(--site-voice) text-(--site-on-voice)",
    },
  },
  defaultVariants: { tone: "plain" },
});

/** A notice across the sketched screen on the warning's soft ground, its action at the end. */
export const siteScreenNoticeStyle = defineSlotStyle({
  slot: "site-screen-notice",
  base: "mx-2 flex items-center gap-2 rounded-(--site-radius-md) bg-(--site-warn-soft) px-2 py-1.5",
  variants: {},
  defaultVariants: {},
});

/** The notice's title over its words. */
export const siteScreenNoticeTextStyle = defineSlotStyle({
  slot: "site-screen-notice-text",
  base: "flex min-w-0 flex-1 flex-col",
  variants: {},
  defaultVariants: {},
});

/** Lines standing for text the sketch does not spell out. */
export const siteScreenLinesStyle = defineSlotStyle({
  slot: "site-screen-lines",
  base: "flex flex-col gap-1 px-2.5 pt-1",
  variants: {},
  defaultVariants: {},
});

/** One standing line, long, middling or short. */
export const siteScreenLineBarStyle = defineSlotStyle({
  slot: "site-screen-line-bar",
  base: "block h-1.5 rounded-(--site-radius-xs) bg-(--site-line)",
  variants: {
    length: {
      long: "w-11/12",
      middle: "w-4/5",
      short: "w-2/3",
    },
  },
  defaultVariants: { length: "long" },
});

/** A meter in the sketch: its label and value, the bar, and a line under it. */
export const siteScreenMeterStyle = defineSlotStyle({
  slot: "site-screen-meter",
  base: "flex flex-col gap-1 px-2.5",
  variants: {},
  defaultVariants: {},
});

/** The meter's label at the start and its value at the end. */
export const siteScreenMeterHeadStyle = defineSlotStyle({
  slot: "site-screen-meter-head",
  base: "flex justify-between",
  variants: {},
  defaultVariants: {},
});

/** The meter's track. */
export const siteScreenTrackStyle = defineSlotStyle({
  slot: "site-screen-track",
  base: "block h-1.5 overflow-hidden rounded-(--site-radius-full) bg-(--site-surface-sunken)",
  variants: {},
  defaultVariants: {},
});

/** The meter's fill, in the warning's colour when little is left. */
export const siteScreenFillStyle = defineSlotStyle({
  slot: "site-screen-fill",
  base: "block h-full",
  variants: {
    tone: {
      accent: "bg-(--site-accent)",
      warn: "bg-(--site-warn)",
    },
  },
  defaultVariants: { tone: "accent" },
});
