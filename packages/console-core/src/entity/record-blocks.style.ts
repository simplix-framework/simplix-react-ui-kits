import { defineSlotStyle } from "@simplix-react/ui/design";

/** A verb the reader cannot use, with the reason under its button. */
export const verbBlockedStyle = defineSlotStyle({
  slot: "console-verb-blocked",
  base: "gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** Why the verb above cannot be used. */
export const verbBlockedReasonStyle = defineSlotStyle({
  slot: "console-verb-blocked-reason",
  base: "text-left text-xs leading-snug text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/**
 * A note that explains a detail, a form or a dialog: a card on the raised surface, with an
 * optional icon at its start. `plain` is the same sentence inside a card that already frames it.
 */
export const recordNoteStyle = defineSlotStyle({
  slot: "console-record-note",
  base: "flex items-start gap-2 text-xs leading-relaxed text-muted-foreground",
  variants: {
    framed: {
      true: "rounded-lg border border-border bg-muted/40 px-3 py-2.5",
      false: "",
    },
  },
  defaultVariants: { framed: true },
});

/** The icon at the start of a framed note. */
export const recordNoteIconStyle = defineSlotStyle({
  slot: "console-record-note-icon",
  base: "mt-px size-4 shrink-0 text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
