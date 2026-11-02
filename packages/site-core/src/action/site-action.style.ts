import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * A site action: a link or a button drawn as a pressable box. `tone` says how strongly it asks to be
 * pressed (one primary per region), `size` follows the region it stands in (`sm` inside a row, `lg` in a
 * hero), and
 * `block` stretches it over its column, as a plan card's actions are.
 *
 * <p>`size` is declared before `tone`: the rules are written in declaration order at one
 * specificity, so the quiet tone's narrower side room, which draws no ground, wins over the size's.
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
      quiet: "bg-transparent px-2 text-(--site-accent-strong) hover:bg-(--site-accent-soft)",
    },
    block: {
      true: "w-full",
      false: "",
    },
  },
  defaultVariants: { tone: "secondary", size: "md", block: false },
});
