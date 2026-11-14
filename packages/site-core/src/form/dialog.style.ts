import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The framework dialog drawn as a site card over the page: a raised surface with a hairline, the
 * float shadow, the content in one column.
 */
export const siteDialogStyle = defineSlotStyle({
  slot: "site-dialog",
  as: "part",
  base:
    "flex max-h-11/12 w-80 max-w-11/12 flex-col gap-3 overflow-y-auto rounded-(--site-radius-2xl) border border-(--site-line) bg-(--site-surface-raised) p-4 font-(family-name:--site-font-sans) text-(length:--site-fs-base) leading-(--site-lh-base) text-(--site-ink) shadow-[var(--site-shadow-float)] outline-none",
  variants: {},
  defaultVariants: {},
});

/** The dialog's head: the title and description, then the close button. */
export const siteDialogHeadStyle = defineSlotStyle({
  slot: "site-dialog-head",
  base: "flex items-start gap-2",
  variants: {},
  defaultVariants: {},
});

/** The title and description, one over the other. */
export const siteDialogTitlesStyle = defineSlotStyle({
  slot: "site-dialog-titles",
  base: "flex min-w-0 flex-1 flex-col gap-1",
  variants: {},
  defaultVariants: {},
});

/** The dialog's title. */
export const siteDialogTitleStyle = defineSlotStyle({
  slot: "site-dialog-title",
  as: "part",
  base: "m-0 text-(length:--site-fs-heading) leading-(--site-lh-heading) font-(--site-fw-strong) text-(--site-ink)",
  variants: {},
  defaultVariants: {},
});

/** The sentence under the title. */
export const siteDialogDescriptionStyle = defineSlotStyle({
  slot: "site-dialog-description",
  as: "part",
  base: "m-0 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/** The close button in the corner, named for the dialog. */
export const siteDialogCloseStyle = defineSlotStyle({
  slot: "site-dialog-close",
  base:
    "grid size-6 shrink-0 cursor-pointer place-items-center rounded-(--site-radius-sm) border-0 bg-transparent p-0 text-(--site-ink-muted) outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) hover:bg-(--site-surface-sunken) hover:text-(--site-ink) focus-visible:shadow-[var(--site-focus-ring)] [&_svg]:size-3",
  variants: {},
  defaultVariants: {},
});

/** The dialog's actions at the end, the committing one last. */
export const siteDialogFootStyle = defineSlotStyle({
  slot: "site-dialog-foot",
  base: "flex flex-wrap justify-end gap-2 pt-1",
  variants: {},
  defaultVariants: {},
});
