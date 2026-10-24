import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The row holding a copyable value and its copy control. The control stays out of the way until the
 * value is pointed at or focused (always shown where there is no hover), a 22px ghost when it shows.
 */
export const copyableFieldStyle = defineSlotStyle({
  slot: "console-copyable-field",
  base: "gap-1 [&>[data-slot=button]]:size-[22px] [&>[data-slot=button]]:text-muted-foreground [&>[data-slot=button]]:opacity-0 [&>[data-slot=button]]:transition-opacity [&>[data-slot=button]]:duration-[var(--dur-fast)] hover:[&>[data-slot=button]]:opacity-100 focus-within:[&>[data-slot=button]]:opacity-100 [@media(hover:none)]:[&>[data-slot=button]]:opacity-100 [&>[data-slot=button]_svg]:size-3.5",
  variants: {},
  defaultVariants: {},
});
