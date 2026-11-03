import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * What every text control shares: the control line, the surface, the ink, the pointer and keyboard
 * answers, and the disabled and refused looks. A size or a shape is a variant or another slot.
 */
const SITE_FIELD =
  "block w-full min-w-0 rounded-(--site-radius-md) border border-(--site-control-line) bg-(--site-surface) font-(family-name:--site-font-sans) text-(--site-ink) outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) placeholder:text-(--site-ink-muted) hover:border-(--site-ink-muted) focus-visible:border-(--site-accent) focus-visible:shadow-[var(--site-focus-ring)] disabled:cursor-not-allowed disabled:opacity-(--site-dim) aria-invalid:border-(--site-bad)";

/** A field: its name over its control, and any note under it. `muted` draws the name in the muted ink. */
export const siteFieldStyle = defineSlotStyle({
  slot: "site-field",
  base: "flex min-w-0 flex-col gap-1 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
  variants: {
    muted: {
      true: "text-(--site-ink-muted)",
      false: "",
    },
  },
  defaultVariants: { muted: false },
});

/** Fields side by side, one below the narrow tier. */
export const siteFieldRowStyle = defineSlotStyle({
  slot: "site-field-row",
  base: "grid min-w-0 grid-cols-2 gap-2.5 @max-page-narrow/page:grid-cols-1",
  variants: {},
  defaultVariants: {},
});

/** A short line under a control: a hint, or what is wrong with the value in the bad colour. */
export const siteFieldNoteStyle = defineSlotStyle({
  slot: "site-field-note",
  base: "min-w-0",
  variants: {
    tone: {
      muted: "text-(--site-ink-muted)",
      bad: "text-(--site-bad)",
      good: "text-(--site-good)",
      warn: "text-(--site-warn)",
    },
    // `inherit` is the field's small print; `caption` the caption size on its own line under a form.
    size: {
      inherit: "",
      caption: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
    },
  },
  defaultVariants: { tone: "muted", size: "inherit" },
});

/** A control and what stands beside it on one line (an address and where it came from). */
export const siteFieldInlineStyle = defineSlotStyle({
  slot: "site-field-inline",
  base: "flex min-w-0 items-center gap-2",
  variants: {},
  defaultVariants: {},
});

/** A one-line text field. */
export const siteInputStyle = defineSlotStyle({
  slot: "site-input",
  base: SITE_FIELD,
  variants: {
    size: {
      md: "h-(--site-control) px-2.5 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) font-(--site-fw-base)",
      sm: "h-(--site-control-sm) px-2 text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption)",
    },
    // A value read character by character (a recovery code) in the mono family.
    mono: {
      true: "font-(family-name:--site-font-mono)",
      false: "",
    },
  },
  defaultVariants: { size: "md", mono: false },
});

/** A text of several lines, in the reading size and leading. */
export const siteTextareaStyle = defineSlotStyle({
  slot: "site-textarea",
  base: `${SITE_FIELD} min-h-16 resize-none px-2.5 py-2 text-(length:--site-fs-notes) leading-(--site-lh-notes) font-(--site-fw-base)`,
  variants: {},
  defaultVariants: {},
});

/** A checkbox and its words on one line; the whole line presses the box. */
export const siteCheckStyle = defineSlotStyle({
  slot: "site-checkbox-row",
  base: "inline-flex min-w-0 cursor-pointer items-center gap-2 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) font-(--site-fw-base) text-(--site-ink)",
  variants: {},
  defaultVariants: {},
});

/** A checkbox's words. */
export const siteCheckLabelStyle = defineSlotStyle({
  slot: "site-checkbox-label",
  base: "min-w-0",
  variants: {},
  defaultVariants: {},
});

/** The word before a consent the next step needs ("Required"), drawn for the eye only. */
export const siteCheckBadgeStyle = defineSlotStyle({
  slot: "site-checkbox-badge",
  base: "mr-1 text-(length:--site-fs-label) leading-(--site-lh-label) font-(--site-fw-strong) tracking-(--site-tracking-label) not-italic text-(--site-accent-text)",
  variants: {},
  defaultVariants: {},
});

/**
 * The framework checkbox drawn in the site design: a 16px box on the control line that fills with
 * the accent when checked. A part over the framework's own slot, so every property the framework
 * draws is set here.
 */
export const siteCheckboxStyle = defineSlotStyle({
  slot: "site-checkbox",
  as: "part",
  base:
    "inline-grid size-4 shrink-0 cursor-pointer place-items-center rounded-(--site-radius-xs) border border-(--site-control-line) bg-(--site-surface) p-0 text-(--site-on-accent) shadow-none outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) hover:border-(--site-accent) focus-visible:shadow-[var(--site-focus-ring)] data-[state=checked]:border-(--site-accent) data-[state=checked]:bg-(--site-accent) data-[state=checked]:text-(--site-on-accent) data-[state=indeterminate]:text-(--site-on-accent) data-[state=checked]:hover:border-(--site-accent-strong) data-[state=checked]:hover:bg-(--site-accent-strong) data-[state=indeterminate]:border-(--site-accent) data-[state=indeterminate]:bg-(--site-accent) disabled:cursor-not-allowed disabled:opacity-(--site-dim) [&_svg]:size-3",
  variants: {},
  defaultVariants: {},
});

/**
 * The framework switch drawn in the site design: a 30 by 18 track on the control line with a 14px
 * thumb, filled with the accent when on.
 */
export const siteToggleStyle = defineSlotStyle({
  slot: "site-toggle",
  as: "part",
  base:
    "relative inline-flex h-4.5 w-7.5 shrink-0 cursor-pointer items-center rounded-(--site-radius-full) border border-(--site-control-line) bg-(--site-surface-sunken) p-px shadow-none outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) hover:border-(--site-accent) focus-visible:shadow-[var(--site-focus-ring)] data-[state=checked]:border-(--site-accent) data-[state=checked]:bg-(--site-accent) data-[state=checked]:hover:border-(--site-accent-strong) data-[state=checked]:hover:bg-(--site-accent-strong) disabled:cursor-not-allowed disabled:opacity-(--site-dim) [&>[data-slot=switch-thumb]]:block [&>[data-slot=switch-thumb]]:size-3.5 [&>[data-slot=switch-thumb]]:translate-x-0 [&>[data-slot=switch-thumb]]:rounded-(--site-radius-full) [&>[data-slot=switch-thumb]]:bg-(--site-control-line) [&>[data-slot=switch-thumb]]:shadow-none [&>[data-slot=switch-thumb]]:transition-transform [&>[data-slot=switch-thumb]]:duration-(--site-duration-base) data-[state=checked]:[&>[data-slot=switch-thumb]]:translate-x-3 data-[state=checked]:[&>[data-slot=switch-thumb]]:bg-(--site-on-accent)",
  variants: {},
  defaultVariants: {},
});

/** A switch and its words on one line. */
export const siteToggleRowStyle = defineSlotStyle({
  slot: "site-toggle-row",
  base: "inline-flex min-w-0 cursor-pointer items-center gap-2 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) text-(--site-ink)",
  variants: {},
  defaultVariants: {},
});

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

/** The six-digit code's row of cells, centred. */
export const siteCodeStyle = defineSlotStyle({
  slot: "site-code",
  as: "part",
  base: "flex w-full items-center justify-center gap-2",
  variants: {},
  defaultVariants: {},
});

/** One square cell of the code; a refused code draws a heavier border in the bad colour. */
export const siteCodeCellStyle = defineSlotStyle({
  slot: "site-code-cell",
  as: "part",
  base:
    "aspect-square w-(--site-code-cell) min-w-0 shrink rounded-(--site-radius-md) bg-(--site-surface) p-0 text-center font-(family-name:--site-font-mono) text-(length:--site-fs-digits) leading-(--site-lh-digits) font-(--site-fw-digits) tracking-normal text-(--site-ink) caret-(--site-accent) shadow-none outline-none transition-colors duration-(--site-duration-fast) ease-(--site-ease) focus-visible:border-(--site-accent) focus-visible:shadow-[var(--site-focus-ring)] disabled:cursor-not-allowed disabled:bg-(--site-surface-sunken) disabled:opacity-(--site-dim)",
  variants: {
    invalid: {
      true: "border-2 border-(--site-bad)",
      false: "border border-(--site-control-line) hover:border-(--site-ink-muted)",
    },
  },
  defaultVariants: { invalid: false },
});

/** A few choices, each a card with a radio mark, a title and a line of body. */
export const siteRadioCardsStyle = defineSlotStyle({
  slot: "site-radio-cards",
  base: "flex min-w-0 flex-col gap-1.5",
  variants: {},
  defaultVariants: {},
});

/** One choice of {@link siteRadioCardsStyle}: the accent outline and soft ground when chosen. */
export const siteRadioCardStyle = defineSlotStyle({
  slot: "site-radio-card",
  base:
    "flex min-w-0 cursor-pointer items-start gap-2.5 rounded-(--site-radius-lg) border px-3 py-2.5 text-left font-(family-name:--site-font-sans) text-(--site-ink) outline-none transition-colors duration-(--site-duration-base) ease-(--site-ease) focus-visible:shadow-[var(--site-focus-ring)] disabled:cursor-not-allowed disabled:opacity-(--site-dim)",
  variants: {
    checked: {
      true: "border-(--site-accent) bg-(--site-accent-soft)",
      false: "border-(--site-line) bg-(--site-surface) hover:border-(--site-control-line)",
    },
  },
  defaultVariants: { checked: false },
});

/** The radio mark of a card: a ring, with a dot when chosen. */
export const siteRadioMarkStyle = defineSlotStyle({
  slot: "site-radio-mark",
  base: "mt-0.5 grid size-4 shrink-0 place-items-center rounded-(--site-radius-full) border-2",
  variants: {
    checked: {
      true: "border-(--site-accent)",
      false: "border-(--site-control-line)",
    },
  },
  defaultVariants: { checked: false },
});

/** The dot inside a chosen card's radio mark. */
export const siteRadioDotStyle = defineSlotStyle({
  slot: "site-radio-dot",
  base: "size-2 rounded-(--site-radius-full) bg-(--site-accent)",
  variants: {},
  defaultVariants: {},
});

/** A card's title and body, one over the other. */
export const siteRadioTextStyle = defineSlotStyle({
  slot: "site-radio-text",
  base: "flex min-w-0 flex-col gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** A card's title, with a badge beside it. */
export const siteRadioTitleStyle = defineSlotStyle({
  slot: "site-radio-title",
  base: "flex items-center gap-1.5 text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) font-(--site-fw-strong)",
  variants: {},
  defaultVariants: {},
});

/** A card's body line. */
export const siteRadioBodyStyle = defineSlotStyle({
  slot: "site-radio-body",
  base: "text-(length:--site-fs-caption) leading-(--site-lh-caption) font-(--site-fw-caption) text-(--site-ink-muted)",
  variants: {},
  defaultVariants: {},
});

/**
 * A question that only goes ahead once a word is typed (deleting a voice, deleting the account): on
 * the bad colour's soft ground for a deletion that cannot be undone, or a plain card.
 */
export const siteConfirmStyle = defineSlotStyle({
  slot: "site-confirm",
  base: "flex min-w-0 flex-col",
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

/**
 * A slider: the track and the thumb on one line as tall as the thumb's reach. The whole line takes a
 * press, so a press beside the thin track still moves the value; a disabled slider dims.
 */
export const siteSliderStyle = defineSlotStyle({
  slot: "site-slider",
  base: "flex h-(--site-slider-size) w-full min-w-0 flex-1 cursor-pointer touch-none items-center select-none",
  variants: {
    disabled: {
      true: "cursor-not-allowed opacity-(--site-dim)",
      false: "",
    },
  },
  defaultVariants: { disabled: false },
});

/** The slider's track, sunken with a hairline inside its edge. */
export const siteSliderTrackStyle = defineSlotStyle({
  slot: "site-slider-track",
  base: "relative block h-(--site-slider-track-size) w-full rounded-(--site-radius-full) bg-(--site-slider-track) shadow-[inset_0_0_0_1px_var(--site-slider-track-line)]",
  variants: {},
  defaultVariants: {},
});

/** The share of the track up to the value, in the accent; its width is the share. */
export const siteSliderFillStyle = defineSlotStyle({
  slot: "site-slider-fill",
  base: "block h-full rounded-(--site-radius-full) bg-(--site-slider-fill)",
  variants: {},
  defaultVariants: {},
});

/**
 * The thumb, centred on the value: a ringed disc that takes the soft accent under the pointer, the
 * focus ring from the keyboard, and grows while it is pressed or dragged.
 */
export const siteSliderThumbStyle = defineSlotStyle({
  slot: "site-slider-thumb",
  base: "absolute top-1/2 block size-(--site-slider-thumb-size) -translate-1/2 rounded-(--site-radius-full) border-(length:--site-slider-thumb-ring) border-solid border-(--site-slider-thumb-line) bg-(--site-slider-thumb) outline-none transition-transform duration-(--site-duration-fast) ease-(--site-ease) hover:bg-(--site-slider-thumb-hover) focus-visible:shadow-[var(--site-focus-ring)] active:scale-(--site-slider-press)",
  variants: {
    dragging: {
      true: "scale-(--site-slider-press)",
      false: "",
    },
  },
  defaultVariants: { dragging: false },
});

/** The reasons a rejected request names field by field, under the error dialog's sentence. */
export const siteErrorReasonsStyle = defineSlotStyle({
  slot: "site-error-reasons",
  base: "m-0 flex min-w-0 flex-col gap-1 ps-5",
  variants: {},
  defaultVariants: {},
});

/** One field's reason, in the reading size of a pane, as a list item. */
export const siteErrorReasonStyle = defineSlotStyle({
  slot: "site-error-reason",
  base: "list-disc text-(length:--site-fs-body-pane) leading-(--site-lh-body-pane) text-(--site-ink)",
  variants: {},
  defaultVariants: {},
});
