import { defineSlotStyle } from "@simplix-react/ui/design";

import { SITE_FIELD, SITE_FIELD_NARROW } from "./form.style";

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
  base: `${SITE_FIELD} ${SITE_FIELD_NARROW}`,
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
  base: `${SITE_FIELD} min-h-16 resize-none px-2.5 py-2 text-(length:--site-fs-notes) leading-(--site-lh-notes) font-(--site-fw-base) ${SITE_FIELD_NARROW}`,
  variants: {},
  defaultVariants: {},
});
