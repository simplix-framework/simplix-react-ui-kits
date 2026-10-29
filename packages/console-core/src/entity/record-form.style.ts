import { defineSlotStyle } from "@simplix-react/ui/design";

/** The dashed ground a file is dropped on, tinted while one is dragged over it. */
export const attachmentDropStyle = defineSlotStyle({
  slot: "console-attachment-drop",
  base: "gap-3 rounded-md bg-muted/40 px-4 py-3 outline-1 outline-dashed outline-muted-foreground/40",
  variants: { dragging: { true: "bg-primary/10 outline-primary", false: "" } },
  defaultVariants: { dragging: false },
});

/** One row of a repeated field, ruled off from the row above it rather than boxed. */
export const repeatRowStyle = defineSlotStyle({
  slot: "repeat-row",
  as: "part",
  base: "border-t border-border pt-3 first:border-t-0 first:pt-0",
  variants: {},
  defaultVariants: {},
});

/** The fade at the foot of a scrolling form that says more fields lie below. */
export const formMoreStyle = defineSlotStyle({
  slot: "console-form-more",
  base: "",
  // Painted only while fields lie below: with nothing under it the strip is bare room, so a form
  // on a surface other than a card (a sign-in page) shows no card-coloured block.
  variants: { overflow: { true: "bg-gradient-to-t from-card to-transparent", false: "" } },
  defaultVariants: { overflow: false },
});

/** A one-time code: one card per digit, in a row centred in the form and read as one control. */
export const otpGroupStyle = defineSlotStyle({
  slot: "console-otp",
  base: "flex justify-center gap-2",
  variants: {},
  defaultVariants: {},
});

/** One digit of a one-time code, drawn as a card with the digit centred in a large type size. */
export const otpDigitStyle = defineSlotStyle({
  slot: "console-otp-digit",
  as: "part",
  base: "h-14 w-12 rounded-lg border border-border bg-card p-0 text-center text-2xl font-semibold tabular-nums shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 aria-invalid:border-destructive aria-invalid:ring-destructive/30 disabled:bg-muted disabled:opacity-60",
  variants: {},
  defaultVariants: {},
});
