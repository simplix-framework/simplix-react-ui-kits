import { defineSlotStyle } from "@simplix-react/ui/design";

/** A job in the tray; an unread one is ruled in the primary colour. */
export const jobCardStyle = defineSlotStyle({
  slot: "console-job-card",
  as: "part",
  base: "",
  variants: {
    unread: { true: "border-primary", false: "" },
  },
  defaultVariants: { unread: false },
});
