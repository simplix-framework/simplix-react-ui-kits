import { defineSlotStyle } from "@simplix-react/ui/design";

/** The display settings panel. */
export const displaySettingsStyle = defineSlotStyle({
  slot: "console-display-settings",
  as: "part",
  base: "w-80 gap-4 p-4",
  variants: {},
  defaultVariants: {},
});

/** One group of choices: its heading and its options. */
export const displaySettingsGroupStyle = defineSlotStyle({
  slot: "console-display-settings-group",
  base: "gap-2 [&>h3]:text-xs [&>h3]:font-semibold [&>h3]:text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** A theme as a card: its swatch and its name, pressed while it is the theme in force. */
export const displaySettingsThemeStyle = defineSlotStyle({
  slot: "console-display-settings-theme",
  base: "gap-2 rounded-md border px-2 py-1.5 text-xs text-foreground [transition:border-color_var(--dur-fast)_var(--ease),background-color_var(--dur-fast)_var(--ease)] hover:bg-accent focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)]",
  variants: {
    selected: { true: "border-primary bg-accent font-semibold", false: "border-border" },
  },
  defaultVariants: { selected: false },
});

/** The colour dot inside a theme card. */
export const displaySettingsSwatchStyle = defineSlotStyle({
  slot: "console-display-settings-swatch",
  base: "rounded-full bg-[var(--swatch)] ring-1 ring-black/10",
  variants: {},
  defaultVariants: {},
});

/** A row of choices: designs, fills, densities, modes. */
export const displaySettingsChoicesStyle = defineSlotStyle({
  slot: "console-display-settings-choices",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});

/** The grid of theme cards. */
export const displaySettingsThemesStyle = defineSlotStyle({
  slot: "console-display-settings-themes",
  base: "gap-1.5",
  variants: {},
  defaultVariants: {},
});
