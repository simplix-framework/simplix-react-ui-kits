import { defineSlotStyle } from "@simplix-react/ui/design";

/** The bar at the top of a phone screen. */
export const phoneBarStyle = defineSlotStyle({
  slot: "console-phone-bar",
  as: "part",
  base: "border-b border-border bg-card px-2 py-1",
  variants: {},
  defaultVariants: {},
});

/** The row of areas at the bottom of a phone screen. */
export const phoneTabbarStyle = defineSlotStyle({
  slot: "console-phone-tabbar",
  base: "border-t border-border bg-card",
  variants: {},
  defaultVariants: {},
});

/**
 * One entry of the phone's tab bar; the current one is in the primary colour. An unbuilt one keeps
 * its label's contrast (4.5:1 at least, read in daylight on a site) and says why in its tooltip.
 */
export const phoneTabStyle = defineSlotStyle({
  slot: "console-phone-tab",
  base: "gap-0.5 py-1.5",
  variants: {
    active: { true: "text-[var(--primary-text,color-mix(in_oklab,var(--primary)_70%,black))]", false: "text-muted-foreground" },
    unbuilt: { true: "cursor-not-allowed disabled:opacity-100", false: "" },
  },
  defaultVariants: { active: false, unbuilt: false },
});

/** The count on a tab. */
export const phoneTabBadgeStyle = defineSlotStyle({
  slot: "console-phone-tab-badge",
  base: "rounded-full bg-destructive px-1 text-center text-[0.625rem] font-medium leading-4 text-destructive-foreground",
  variants: {},
  defaultVariants: {},
});

/** The name under a tab's icon. */
export const phoneTabLabelStyle = defineSlotStyle({
  slot: "console-phone-tab-label",
  base: "text-xs",
  variants: {},
  defaultVariants: {},
});

/** The strip that scrolls sideways under the bar. */
export const phoneStripStyle = defineSlotStyle({
  slot: "console-phone-strip",
  base: "border-b border-border",
  variants: {},
  defaultVariants: {},
});

/** The screen's own action, at the near end of the reach. */
export const phoneActionBarStyle = defineSlotStyle({
  slot: "console-phone-action-bar",
  as: "part",
  base: "border-t border-border bg-card px-3 py-2",
  variants: {},
  defaultVariants: {},
});

/** A whole card that is one control; the accent marks the row the reader has not dealt with. */
export const phoneRowButtonStyle = defineSlotStyle({
  slot: "console-phone-row-button",
  base: "rounded-lg border px-3 py-2 text-left",
  variants: {
    accent: {
      true: "border-l-4 border-l-primary bg-card",
      false: "border-border bg-background",
    },
  },
  defaultVariants: { accent: false },
});

/**
 * A phone screen's own padded body: the gutter between the chrome and the content. Inputs inside it
 * are 48px tall for a thumb, and a small control (a clear button, a check box) keeps its drawn size
 * but answers a 44px square around it.
 */
export const phoneScreenBodyStyle = defineSlotStyle({
  slot: "console-phone-screen-body",
  as: "part",
  base: "p-3 [&_[data-slot=input]]:h-12 [&_[data-slot=field-select-trigger]]:h-12 [&_[data-slot=date-picker-trigger]]:h-12 [&_textarea]:min-h-24 [&_[data-slot=field-clear-button]]:relative [&_[data-slot=field-clear-button]]:after:absolute [&_[data-slot=field-clear-button]]:after:-inset-3 [&_[data-slot=field-clear-button]]:after:content-[''] [&_[role=checkbox]]:relative [&_[role=checkbox]]:after:absolute [&_[role=checkbox]]:after:-inset-3.5 [&_[role=checkbox]]:after:content-['']",
  variants: {},
  defaultVariants: {},
});

/** What a phone screen says when it has nothing to list. */
export const phoneEmptyStyle = defineSlotStyle({
  slot: "console-phone-empty",
  as: "part",
  base: "py-8 text-center",
  variants: {},
  defaultVariants: {},
});

/** The sheet the phone's menu tab raises from the bottom edge. */
export const phoneMenuSheetStyle = defineSlotStyle({
  slot: "console-phone-menu-sheet",
  base: "gap-3 rounded-t-lg px-4 pb-4",
  variants: {},
  defaultVariants: {},
});
