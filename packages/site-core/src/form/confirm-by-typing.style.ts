import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * A question that only goes ahead once a word is typed (deleting a voice, deleting the account): on
 * the bad colour's soft ground for a deletion that cannot be undone, or a plain card.
 */
export const siteConfirmStyle = defineSlotStyle({
  slot: "site-confirm",
  base: "flex min-w-0 flex-col outline-none",
  variants: {
    tone: {
      danger: "gap-2.5 rounded-(--site-radius-lg) bg-(--site-bad-soft) p-3.5",
      plain: "gap-3 rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface) p-4",
    },
  },
  defaultVariants: { tone: "danger" },
});

/** The question's title: the bad colour on the danger ground. */
export const siteConfirmTitleStyle = defineSlotStyle({
  slot: "site-confirm-title",
  base: "font-(--site-fw-strong)",
  variants: {
    tone: {
      danger: "text-(--site-bad)",
      plain: "",
    },
  },
  defaultVariants: { tone: "danger" },
});

/** What the deletion takes with it: a paragraph, or a list of points. */
export const siteConfirmBodyStyle = defineSlotStyle({
  slot: "site-confirm-body",
  base: "m-0 min-w-0 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {
    list: {
      true: "flex list-disc flex-col gap-1 pl-4.5 text-(--site-ink-muted)",
      false: "",
    },
  },
  defaultVariants: { list: false },
});

/** One point of the list. */
export const siteConfirmPointStyle = defineSlotStyle({
  slot: "site-confirm-point",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** The question's actions: the deletion, then the way back. */
export const siteConfirmActionsStyle = defineSlotStyle({
  slot: "site-confirm-actions",
  base: "flex flex-wrap gap-2",
  variants: {},
  defaultVariants: {},
});
