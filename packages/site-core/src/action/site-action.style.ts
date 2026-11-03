import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * A site action: a link or a button drawn as a pressable box. `tone` says how strongly it asks to be
 * pressed (one primary per region), `size` follows the region it stands in (`sm` inside a row, `lg` in a
 * hero), and
 * `block` stretches it over its column, as a plan card's actions are.
 *
 * <p>The variants are written in declaration order at one specificity. `pad` comes last: a quiet
 * action draws no ground, so it takes narrower side room than the size gives, and how much narrower
 * depends on the size (`quietSm`, `quietMd`); {@link actionPad} picks it from the tone and the size.
 * `subtle` is a quiet action in the muted ink (a way out that should not draw the eye, such as
 * cancelling a subscription); `danger` is outlined in the bad colour for an action that removes.
 */
export const siteActionStyle = defineSlotStyle({
  slot: "site-action",
  base:
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-(--site-radius-md) border border-transparent font-(family-name:--site-font-sans) font-(--site-fw-strong) no-underline outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) focus-visible:shadow-[var(--site-focus-ring)] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-(--site-control-disabled) disabled:text-(--site-ink-disabled) [&_svg]:size-4 [&_svg]:shrink-0",
  variants: {
    size: {
      md: "h-(--site-control) px-3.5 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane)",
      sm: "h-(--site-control-sm) px-2.5 text-(length:--site-fs-caption) leading-(--site-lh-caption)",
      lg: "h-(--site-control-lg) rounded-(--site-radius-lg) px-4.5 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane)",
    },
    tone: {
      primary: "bg-(--site-accent) text-(--site-on-accent) hover:bg-(--site-accent-strong)",
      secondary: "border-(--site-line) bg-(--site-surface) text-(--site-ink) hover:bg-(--site-surface-sunken)",
      quiet: "bg-transparent text-(--site-accent-strong) hover:bg-(--site-accent-soft)",
      subtle: "bg-transparent text-(--site-ink-muted) hover:bg-(--site-accent-soft)",
      danger: "border-(--site-bad) bg-transparent text-(--site-bad) hover:bg-(--site-bad-soft)",
    },
    block: {
      true: "w-full",
      false: "",
    },
    pad: {
      size: "",
      quietSm: "px-1.5",
      quietMd: "px-2",
    },
    // Below the page's narrow tier an action whose place there is elsewhere (a bar's more menu) leaves the row.
    narrow: {
      shown: "",
      hidden: "@max-page-narrow/page:hidden",
    },
  },
  defaultVariants: { tone: "secondary", size: "md", block: false, pad: "size", narrow: "shown" },
});

/** The side room an action takes: its size's, or a quiet action's narrower room for that size. */
export function actionPad(tone: "primary" | "secondary" | "quiet" | "subtle" | "danger" | undefined, size: "md" | "sm" | "lg" | undefined): "size" | "quietSm" | "quietMd" {
  if (tone !== "quiet" && tone !== "subtle") return "size";
  return size === "sm" ? "quietSm" : "quietMd";
}

/**
 * Why a disabled action cannot run, for a screen reader only, where the page draws no line that says
 * so; the action is described by it. It is taken out of the layout, so it moves nothing beside it.
 */
export const siteActionReasonStyle = defineSlotStyle({
  slot: "site-action-reason",
  base: "sr-only",
  variants: {},
  defaultVariants: {},
});
