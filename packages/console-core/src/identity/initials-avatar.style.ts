import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * A person drawn as the last two letters of their name on a round ground tinted by a hue taken from
 * their id.
 */
export const initialsAvatarStyle = defineSlotStyle({
  slot: "console-initials-avatar",
  base: "inline-grid size-[26px] place-items-center rounded-full bg-[oklch(0.93_0.035_var(--avatar-h))] text-(length:--fs-xs) leading-(--lh-xs) font-semibold tracking-[-0.04em] text-[oklch(0.42_0.08_var(--avatar-h))] dark:bg-[oklch(0.34_0.05_var(--avatar-h))] dark:text-[oklch(0.88_0.05_var(--avatar-h))]",
  variants: {
    size: { sm: "", lg: "size-10 text-(length:--fs-body-sm) leading-(--lh-body-sm)" },
  },
  defaultVariants: { size: "sm" },
});
