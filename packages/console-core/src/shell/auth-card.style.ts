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
