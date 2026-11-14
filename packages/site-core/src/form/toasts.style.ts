import { defineSlotStyle } from "@simplix-react/ui/design";

/** Where the toasts appear: centred along the bottom of the window, above the page. */
export const siteToastsStyle = defineSlotStyle({
  slot: "site-toasts",
  base: "pointer-events-none fixed inset-x-3 bottom-3 z-30 flex flex-col items-center gap-2",
  variants: {},
  defaultVariants: {},
});

/** A short notice that a command took effect: one line on the ink ground with the accent's dot. */
export const siteToastStyle = defineSlotStyle({
  slot: "site-toast",
  base:
    "pointer-events-auto flex w-max max-w-full min-w-0 items-center gap-2.5 rounded-(--site-radius-lg) bg-(--site-ink) font-(family-name:--site-font-sans) text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) text-(--site-surface) shadow-[var(--site-shadow-float)]",
  variants: {
    action: {
      true: "py-1.5 pr-1.5 pl-3.5",
      false: "px-4 py-2.5",
    },
  },
  defaultVariants: { action: false },
});

/** The toast's dot: the accent, or the tone of a warning or a failure. */
export const siteToastDotStyle = defineSlotStyle({
  slot: "site-toast-dot",
  base: "size-2 shrink-0 rounded-(--site-radius-full)",
  variants: {
    tone: {
      good: "bg-(--site-accent)",
      warn: "bg-(--site-warn)",
      bad: "bg-(--site-bad)",
    },
  },
  defaultVariants: { tone: "good" },
});

/** The toast's line. */
export const siteToastMessageStyle = defineSlotStyle({
  slot: "site-toast-message",
  base: "min-w-0 break-keep",
  variants: {},
  defaultVariants: {},
});

/** The toast's one action, such as undo. */
export const siteToastActionStyle = defineSlotStyle({
  slot: "site-toast-action",
  base:
    "inline-flex h-(--site-control-sm) shrink-0 cursor-pointer items-center rounded-(--site-radius-md) border-0 bg-transparent px-2.5 font-(family-name:--site-font-sans) text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-strong) text-(--site-surface) no-underline outline-none hover:bg-(--site-ink-muted) focus-visible:shadow-[var(--site-focus-ring)]",
  variants: {},
  defaultVariants: {},
});
