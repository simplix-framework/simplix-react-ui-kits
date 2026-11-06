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
  base: "min-h-13 gap-5 pl-4 pr-3",
  variants: {},
  defaultVariants: {},
});

/** The product mark and the area switch at the start of the previewed top bar. */
export const previewTopBarLeadStyle = defineSlotStyle({
  slot: "console-preview-topbar-lead",
  as: "part",
  // Under 900px the brand and the area tabs tighten so the top level stays on one line beside the tools.
  base: "flex-nowrap gap-5 self-stretch py-0 transition-[gap] duration-[var(--dur-base)] ease-[var(--ease)] max-[900px]:gap-3",
  variants: {},
  defaultVariants: {},
});

/** The link a brand stands in when pressing it leads home: it shows the focus halo and no underline. */
export const previewBrandLinkStyle = defineSlotStyle({
  slot: "console-preview-brand-link",
  base: "flex shrink-0 items-center rounded-md no-underline text-inherit focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

/** The product mark and the product's name. */
export const previewBrandStyle = defineSlotStyle({
  slot: "console-preview-brand",
  as: "part",
  // Below 1180px the brand keeps only its mark.
  base: "gap-2.5 transition-[gap] duration-[var(--dur-base)] ease-[var(--ease)] max-[1180px]:gap-0 [&_svg]:h-6 [&_svg]:w-auto",
  variants: {},
  defaultVariants: {},
});

/** The product's name beside the mark. */
/** The short tag after the title saying who the console is for. */
export const previewBadgeStyle = defineSlotStyle({
  slot: "console-preview-badge",
  // Leaves with the title below 1180px, so the narrowed bar keeps only the mark.
  base: "inline-flex shrink-0 items-center rounded-sm border border-border px-1.5 py-px text-(length:--fs-2xs) font-semibold uppercase leading-4 tracking-wide text-muted-foreground max-[1180px]:hidden",
  variants: {},
  defaultVariants: {},
});

/** A bar control with nothing behind it yet: drawn as it will look, and quieter. */
export const previewUnbuiltStyle = defineSlotStyle({
  slot: "console-preview-unbuilt",
  base: "inline-flex cursor-default items-center opacity-60 focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {},
  defaultVariants: {},
});

export const previewTitleStyle = defineSlotStyle({
  slot: "console-preview-title",
  as: "part",
  // The name narrows and fades out below 1180px rather than vanishing, and comes back the same way.
  base: "max-w-[12em] overflow-clip whitespace-nowrap transition-[max-width,opacity] duration-[var(--dur-base)] ease-[var(--ease)] max-[1180px]:max-w-0 max-[1180px]:opacity-0",
  variants: {},
  defaultVariants: {},
});

/** The reader's controls at the end of the top bar. */
export const previewToolsStyle = defineSlotStyle({
  slot: "console-preview-tools",
  as: "part",
  base: "gap-0.5",
  variants: {},
  defaultVariants: {},
});

/** The product's own controls in the top bar (language, mode, display), drawn as the chrome's glyph controls. */
export const previewSettingsStyle = defineSlotStyle({
  slot: "console-preview-settings",
  as: "part",
  base: "[&_button]:size-8",
  variants: {},
  defaultVariants: {},
});

/** A glyph control in the top bar: help, language, mode. */
export const previewToolStyle = defineSlotStyle({
  slot: "console-preview-tool",
  as: "part",
  // The reader's tools are 32px squares with the shared hover and press.
  base: "size-8 text-muted-foreground transition-[background-color,color,scale] duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-accent hover:text-foreground active:scale-[0.98] [&_svg]:duration-[var(--dur-base)] [&_svg]:ease-[var(--ease-spring)]",
  variants: {},
  defaultVariants: {},
});

/** The workplace switch in the top bar. */
export const previewSiteStyle = defineSlotStyle({
  slot: "console-preview-site",
  as: "part",
  // One control with its caret; under 900px the site's name folds away and the mark stays.
  base: "h-7 gap-1.5 px-2.5 transition-[border-color,gap] duration-[var(--dur-base)] ease-[var(--ease)] max-[900px]:gap-0.5 [&>[data-slot=text]]:transition-[max-width,opacity] [&>[data-slot=text]]:duration-[var(--dur-base)] [&>[data-slot=text]]:ease-[var(--ease)] max-[900px]:[&>[data-slot=text]]:max-w-0! max-[900px]:[&>[data-slot=text]]:opacity-0 [&_[data-slot=button-caret]]:mr-0 [&_[data-slot=button-caret]]:border-0 [&_[data-slot=button-caret]]:pl-0",
  variants: {},
  defaultVariants: {},
});

/** The signed-in account's control at the end of the top bar. */
export const previewAccountStyle = defineSlotStyle({
  slot: "console-preview-account",
  as: "part",
  // Below 1281px the account keeps only its avatar.
  base: "ml-1.5 h-8 gap-2 pl-1 pr-1.5 hover:bg-accent max-[1281px]:[&_[data-part=console-preview-account-name]]:hidden",
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
  base: "opacity-60 max-[900px]:hidden",
  variants: {},
  defaultVariants: {},
});

/** The previewed console's status strip: its rule, chrome tint and inset. */
export const previewStatusStyle = defineSlotStyle({
  slot: "console-preview-status",
  as: "part",
  base: "border-t bg-muted/30 gap-4 px-4",
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
