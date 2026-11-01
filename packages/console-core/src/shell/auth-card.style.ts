import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The sign-in panel's heading, on the title type step, so every surface that signs a person in
 * (the console, a hosted identity page) draws its title from the same token.
 */
export const authCardTitleStyle = defineSlotStyle({
  slot: "console-auth-card-title",
  as: "part",
  base: "text-(length:--text-title) leading-(--text-title--line-height) font-(--text-title--font-weight) tracking-(--text-title--letter-spacing)",
  variants: {},
  defaultVariants: {},
});

/** The messages the sign-in panel opens with. */
export const authCardNoticesStyle = defineSlotStyle({
  slot: "console-auth-card-notices",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The sign-in panel's content: its form or its message and button. */
export const authCardBodyStyle = defineSlotStyle({
  slot: "console-auth-card-body",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});

/** The row of links under the sign-in panel's rule. */
export const authCardFootStyle = defineSlotStyle({
  slot: "console-auth-card-foot",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});
