import { defineSlotStyle } from "@simplix-react/ui/design";

/** The previewed console's top bar: its rule and its ground. */
export const previewTopBarStyle = defineSlotStyle({
  slot: "console-preview-topbar",
  as: "part",
  base: "border-b bg-background",
  variants: {},
  defaultVariants: {},
});

/** The row inside the previewed top bar. */
export const previewTopBarRowStyle = defineSlotStyle({
  slot: "console-preview-topbar-row",
  as: "part",
  base: "min-h-12 px-3",
  variants: {},
  defaultVariants: {},
});

/** The product mark and the area switch at the start of the previewed top bar. */
export const previewTopBarLeadStyle = defineSlotStyle({
  slot: "console-preview-topbar-lead",
  as: "part",
  base: "py-1",
  variants: {},
  defaultVariants: {},
});

/** The product mark and the product's name. */
export const previewBrandStyle = defineSlotStyle({
  slot: "console-preview-brand",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The product's name beside the mark. */
export const previewTitleStyle = defineSlotStyle({
  slot: "console-preview-title",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The reader's controls at the end of the top bar. */
export const previewToolsStyle = defineSlotStyle({
  slot: "console-preview-tools",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The product's own controls in the top bar (language, mode, display), drawn as the chrome's glyph controls. */
export const previewSettingsStyle = defineSlotStyle({
  slot: "console-preview-settings",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** A glyph control in the top bar: help, language, mode. */
export const previewToolStyle = defineSlotStyle({
  slot: "console-preview-tool",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The workplace switch in the top bar. */
export const previewSiteStyle = defineSlotStyle({
  slot: "console-preview-site",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The signed-in account's control at the end of the top bar. */
export const previewAccountStyle = defineSlotStyle({
  slot: "console-preview-account",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The account's name in the top bar, which a narrow window drops before the avatar. */
export const previewAccountNameStyle = defineSlotStyle({
  slot: "console-preview-account-name",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The caret after the account's name, which says the control opens a menu. */
export const previewAccountCaretStyle = defineSlotStyle({
  slot: "console-preview-account-caret",
  base: "opacity-60",
  variants: {},
  defaultVariants: {},
});

/** The signed-in account's initials in a circle. */
export const previewAvatarStyle = defineSlotStyle({
  slot: "console-preview-avatar",
  base: "size-6 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The previewed console's status strip: its rule, chrome tint and inset. */
export const previewStatusStyle = defineSlotStyle({
  slot: "console-preview-status",
  as: "part",
  base: "border-t bg-muted/30 px-3",
  variants: {},
  defaultVariants: {},
});

/** A flyout's title, inset to the rows' own inset so it lines up with them. */
export const previewFlyoutTitleStyle = defineSlotStyle({
  slot: "console-preview-flyout-title",
  as: "part",
  base: "px-2",
  variants: {},
  defaultVariants: {},
});

/** What is happening now, at the start of the status strip. */
export const previewTickerStyle = defineSlotStyle({
  slot: "console-preview-ticker",
  base: "gap-2 text-xs text-muted-foreground",
  variants: {
    /** Something is live and waiting on someone: set in the strip's strong ink. */
    live: { true: "font-medium text-foreground", false: "" },
  },
  defaultVariants: { live: false },
});

/** The dot before a live ticker, ringed by a pulse. */
export const previewLiveDotStyle = defineSlotStyle({
  slot: "console-preview-live-dot",
  base: "size-[7px] rounded-full bg-destructive",
  variants: {},
  defaultVariants: {},
});

/** The pulse ringing the live dot. */
export const previewLivePulseStyle = defineSlotStyle({
  slot: "console-preview-live-pulse",
  base: "-inset-[3px] animate-ping rounded-full border-[1.5px] border-destructive motion-reduce:animate-none",
  variants: {},
  defaultVariants: {},
});

/** One reading on the right of the status strip. */
export const previewSegmentStyle = defineSlotStyle({
  slot: "console-preview-segment",
  base: "text-xs text-muted-foreground",
  variants: {
    tone: { plain: "", warn: "font-semibold text-amber-700 dark:text-amber-400" },
  },
  defaultVariants: { tone: "plain" },
});

/** The short rule between two readings. */
export const previewSegmentRuleStyle = defineSlotStyle({
  slot: "console-preview-segment-rule",
  base: "mx-3 h-2.5 w-px bg-border",
  variants: {},
  defaultVariants: {},
});

/** The workplace clock at the end of the status strip. */
export const previewClockStyle = defineSlotStyle({
  slot: "console-preview-clock",
  base: "ml-3 gap-1.5 border-l pl-3 text-xs tabular-nums text-muted-foreground",
  variants: {},
  defaultVariants: {},
});
