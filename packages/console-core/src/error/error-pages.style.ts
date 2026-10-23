import { defineSlotStyle } from "@simplix-react/ui/design";

/** The band an error page is centred in. */
export const errorPageStyle = defineSlotStyle({
  slot: "console-error-page",
  as: "part",
  base: "py-8",
  variants: {},
  defaultVariants: {},
});

/**
 * The tint an error page's icon is read by: amber for something being worked on, red for a
 * failure, slate for a refusal, blue for a sign-in.
 *
 * <p>The design system names four tones (default, muted, primary, destructive) and only the red
 * of a server error is among them; the other three carry a distinction the tokens do not make,
 * and collapsing them would make a maintenance window and a crash the same colour. The tint is a
 * part on the framework empty state's icon badge.
 */
export const errorPageIconStyle = defineSlotStyle({
  slot: "console-error-page-icon",
  as: "part",
  base: "",
  variants: {
    tint: {
      amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
      red: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
      slate: "bg-slate-100 text-slate-600 dark:bg-slate-800/30 dark:text-slate-300",
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    },
  },
  defaultVariants: { tint: "slate" },
});
