import { defineSlotStyle } from "@simplix-react/ui/design";

/** One notice of the live board; a notice that asks for action is boxed in the warning colour. */
export const liveNoticeStyle = defineSlotStyle({
  slot: "console-live-notice",
  as: "part",
  base: "px-2 py-1",
  variants: {
    action: { true: "rounded-md border border-warning/50", false: "" },
  },
  defaultVariants: { action: false },
});

/** The action pushed to the far end of a notice. */
export const liveNoticeActionStyle = defineSlotStyle({
  slot: "console-live-notice-action",
  base: "ml-auto",
  variants: {},
  defaultVariants: {},
});
