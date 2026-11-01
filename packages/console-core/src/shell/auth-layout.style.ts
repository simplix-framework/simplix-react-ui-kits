import { defineSlotStyle } from "@simplix-react/ui/design";
/** The page the sign-in forms are centred on. */
export const authPageStyle = defineSlotStyle({
  slot: "console-auth-page",
  as: "part",
  base: "bg-background px-4 py-8",
  variants: {},
  defaultVariants: {},
});

/** The product mark centred over the sign-in form. */
export const authBrandStyle = defineSlotStyle({
  slot: "console-auth-brand",
  base: "mx-auto text-foreground",
  variants: {},
  defaultVariants: {},
});

/** The reader's own controls in the corner of the sign-in page: language and theme. */
export const authPreferencesStyle = defineSlotStyle({
  slot: "console-auth-preferences",
  as: "part",
  base: "",
  variants: {},
  defaultVariants: {},
});
