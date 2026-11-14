import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The framework select's trigger drawn in the site design: the control line, the value and the
 * chevron in the muted ink; the line takes the accent while the list is open.
 */
export const siteSelectStyle = defineSlotStyle({
  slot: "site-select",
  as: "part",
  base:
    "inline-flex min-w-0 cursor-pointer items-center justify-between gap-1.5 rounded-(--site-radius-md) border border-(--site-control-line) bg-(--site-surface) py-0 pr-2 pl-2.5 text-left font-(family-name:--site-font-sans) text-(--site-ink) shadow-none outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) hover:border-(--site-ink-muted) focus-visible:shadow-[var(--site-focus-ring)] data-[state=open]:border-(--site-accent) data-[disabled]:cursor-not-allowed data-[disabled]:opacity-(--site-dim) [&>[data-slot=field-chevron]]:m-0 [&>[data-slot=field-chevron]]:size-3.5 [&>[data-slot=field-chevron]]:shrink-0 [&>[data-slot=field-chevron]]:text-(--site-ink-muted) [&>[data-slot=field-chevron]]:opacity-100",
  variants: {
    size: {
      md: "h-(--site-control) text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) font-(--site-fw-base)",
      sm: "h-(--site-control-sm) text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
    },
    block: {
      true: "w-full",
      false: "w-auto",
    },
  },
  defaultVariants: { size: "md", block: false },
});

/** The value the trigger shows; cut with an ellipsis where it is longer than the trigger. */
export const siteSelectValueStyle = defineSlotStyle({
  slot: "site-select-value",
  base: "min-w-0 truncate",
  variants: {
    placeholder: {
      true: "text-(--site-ink-muted)",
      false: "",
    },
  },
  defaultVariants: { placeholder: false },
});

/** The framework select's list drawn as a site floating card. */
export const siteSelectMenuStyle = defineSlotStyle({
  slot: "site-select-menu",
  as: "part",
  base: "max-h-80 min-w-48 overflow-y-auto rounded-(--site-radius-lg) border border-(--site-line) bg-(--site-surface-raised) p-1.5 text-(--site-ink) shadow-[var(--site-shadow-float)] outline-none",
  variants: {},
  defaultVariants: {},
});

/** One option of the list: the check before the chosen one, the label, then its description. */
export const siteSelectOptionStyle = defineSlotStyle({
  slot: "site-select-option",
  as: "part",
  base:
    "relative flex w-full min-w-0 cursor-pointer select-none items-center gap-2 rounded-(--site-radius-md) py-1.5 pr-2 pl-7 text-left text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) data-[highlighted]:bg-(--site-surface-sunken) data-[disabled]:cursor-default data-[disabled]:opacity-(--site-dim) [&>span:first-child]:left-2 [&>span:first-child]:text-(--site-accent) [&>span:first-child_svg]:size-3.5",
  variants: {},
  defaultVariants: {},
});
