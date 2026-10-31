import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * A person drawn as the last two letters of their name on a round ground in a palette tone taken from
 * their id.
 */
export const initialsAvatarStyle = defineSlotStyle({
  slot: "console-initials-avatar",
  base: "inline-grid size-[26px] place-items-center rounded-full bg-[var(--avatar-ground)] text-(length:--fs-xs) leading-(--lh-xs) font-semibold tracking-[-0.04em] text-[var(--avatar-ink)]",
  variants: {
    size: { sm: "", lg: "size-10 text-(length:--fs-body-sm) leading-(--lh-body-sm)" },
  },
  defaultVariants: { size: "sm" },
});
