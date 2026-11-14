import { defineSlotStyle } from "@simplix-react/ui/design";

/** After payment: the steps from paid to the apps switched over, outlined in the accent. */
export const siteProgressChainStyle = defineSlotStyle({
  slot: "site-progress-chain",
  base: "flex min-w-0 flex-col gap-3 rounded-(--site-radius-xl) border-2 border-(--site-accent) bg-(--site-surface) p-4",
  variants: {},
  defaultVariants: {},
});

/** The chain's steps. */
export const siteChainStepsStyle = defineSlotStyle({
  slot: "site-chain-steps",
  base: "m-0 flex list-none flex-col gap-2 p-0",
  variants: {},
  defaultVariants: {},
});

/** One step of the chain: done or running in the ink, waiting muted. */
export const siteChainStepStyle = defineSlotStyle({
  slot: "site-chain-step",
  base: "flex min-w-0 items-center gap-2.5 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane)",
  variants: {
    state: {
      done: "text-(--site-ink)",
      running: "text-(--site-ink)",
      waiting: "text-(--site-ink-muted)",
    },
  },
  defaultVariants: { state: "waiting" },
});

/** A chain step's disc: filled with a check when done, a spinner while running, a ring while waiting. */
export const siteChainDiscStyle = defineSlotStyle({
  slot: "site-chain-disc",
  base: "grid size-6 shrink-0 place-items-center rounded-(--site-radius-full) border-2 [&_svg]:size-3",
  variants: {
    state: {
      done: "border-(--site-accent) bg-(--site-accent) text-(--site-on-accent)",
      running: "border-(--site-line)",
      waiting: "border-(--site-line)",
    },
  },
  defaultVariants: { state: "waiting" },
});

/** A chain step's words. */
export const siteChainLabelStyle = defineSlotStyle({
  slot: "site-chain-label",
  base: "min-w-0 flex-1",
  variants: {},
  defaultVariants: {},
});

/** What is ready now, on the sunken ground. */
export const siteChainReadyStyle = defineSlotStyle({
  slot: "site-chain-ready",
  base: "m-0 self-start rounded-(--site-radius-lg) bg-(--site-surface-sunken) px-3 py-2 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {},
  defaultVariants: {},
});

/** The chain's last line: what to do with the window now. */
export const siteChainNoteStyle = defineSlotStyle({
  slot: "site-chain-note",
  base: "m-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The done page's round mark on the good colour's soft ground. */
export const siteDoneMarkStyle = defineSlotStyle({
  slot: "site-done-mark",
  base: "grid size-14 place-items-center rounded-(--site-radius-full) bg-(--site-good-soft) text-(--site-good) [&_svg]:size-7",
  variants: {},
  defaultVariants: {},
});

/** The done page's title, the page's one h1. */
export const siteDoneTitleStyle = defineSlotStyle({
  slot: "site-done-title",
  base: "m-0 font-(family-name:--site-font-display) text-(length:--site-fs-title) leading-(--site-lh-title) font-(--site-fw-title) tracking-(--site-tracking-display)",
  variants: {},
  defaultVariants: {},
});

/** The done page's sentences, a readable measure wide: the body in the reading size, the notice in small print. */
export const siteDoneTextStyle = defineSlotStyle({
  slot: "site-done-text",
  base: "m-0 max-w-xl text-(--site-ink-muted)",
  variants: {
    size: {
      body: "text-(length:--site-fs-body) leading-(--site-lh-body)",
      caption: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
    },
  },
  defaultVariants: { size: "body" },
});
