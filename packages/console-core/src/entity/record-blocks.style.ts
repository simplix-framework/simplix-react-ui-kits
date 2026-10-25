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
