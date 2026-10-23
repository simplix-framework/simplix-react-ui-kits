import { defineSlotStyle } from "@simplix-react/ui/design";

/** A button of a message, drawn as the channel draws it at the grade the wording fixed. */
export const wordingButtonStyle = defineSlotStyle({
  slot: "console-wording-button",
  base: "rounded-md border px-3 py-2 text-center",
  variants: {
    grade: {
      PRIMARY: "border-primary bg-primary text-primary-foreground",
      NORMAL: "border-input bg-background",
      URGENT: "border-destructive bg-destructive text-destructive-foreground",
    },
  },
  defaultVariants: { grade: "NORMAL" },
});

/** A mail client's own frame around a previewed message. */
export const mailCardStyle = defineSlotStyle({
  slot: "console-mail-card",
  base: "mx-auto rounded-md border bg-background",
  variants: {},
  defaultVariants: {},
});

/** The subject and addresses of a previewed mail. */
export const mailHeaderStyle = defineSlotStyle({
  slot: "console-mail-header",
  base: "border-b bg-muted/40 px-4 py-3",
  variants: {},
  defaultVariants: {},
});

/** The body of a previewed mail. */
export const mailBodyStyle = defineSlotStyle({
  slot: "console-mail-body",
  base: "px-4 py-4",
  variants: {},
  defaultVariants: {},
});

/** The footer of a previewed mail. */
export const mailFooterStyle = defineSlotStyle({
  slot: "console-mail-footer",
  base: "border-t bg-muted/20 px-4 py-3",
  variants: {},
  defaultVariants: {},
});

/** The column a messenger bubble is previewed in. */
export const chatPreviewStyle = defineSlotStyle({
  slot: "console-chat-preview",
  base: "mx-auto",
  variants: {},
  defaultVariants: {},
});

/** The bubble of a previewed chat message. */
export const chatCardStyle = defineSlotStyle({
  slot: "console-chat-card",
  base: "rounded-lg border bg-muted/40 px-3 py-3",
  variants: {},
  defaultVariants: {},
});
