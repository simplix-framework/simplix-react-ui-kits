import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * A person drawn as the last two letters of their name on a ground tinted by a hue taken from
 * their id. The classic design leaves it out, so a list that asks for it reads as before there.
 */
export const initialsAvatarStyle = defineSlotStyle({
  slot: "console-initials-avatar",
  base: "hidden",
  variants: {
    size: { sm: "", lg: "" },
  },
  defaultVariants: { size: "sm" },
});
