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
  base: "px-3",
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
