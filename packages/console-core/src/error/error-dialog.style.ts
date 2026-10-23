import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The circle behind the failure glyph, tinted per kind of failure.
 *
 * <p>The circle and its tint have no token: the design system names four tones and these are
 * seven kinds of failure.
 */
export const errorIconStyle = defineSlotStyle({
  slot: "console-error-icon",
  as: "part",
  base: "rounded-full",
  variants: {
    kind: {
      server: "bg-red-50 dark:bg-red-950/30",
      client: "bg-amber-50 dark:bg-amber-950/30",
      network: "bg-slate-100 dark:bg-slate-800/30",
      auth: "bg-slate-100 dark:bg-slate-800/30",
      validation: "bg-yellow-50 dark:bg-yellow-950/30",
      unknown: "bg-gray-100 dark:bg-gray-800/30",
      gateway: "bg-amber-50 dark:bg-amber-950/30",
    },
  },
  defaultVariants: { kind: "unknown" },
});

/** The failure glyph itself, coloured per kind of failure. */
export const errorGlyphStyle = defineSlotStyle({
  slot: "console-error-glyph",
  base: "",
  variants: {
    kind: {
      server: "text-red-500",
      client: "text-amber-500",
      network: "text-slate-500",
      auth: "text-slate-500",
      validation: "text-yellow-500",
      unknown: "text-gray-500",
      gateway: "text-amber-500",
    },
  },
  defaultVariants: { kind: "unknown" },
});
