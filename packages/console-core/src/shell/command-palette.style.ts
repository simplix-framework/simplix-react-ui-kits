import { defineSlotStyle } from "@simplix-react/ui/design";

/** A key the reader presses, drawn as a keycap. */
export const keyCapStyle = defineSlotStyle({
  slot: "console-key-cap",
  base: "h-[18px] min-w-[18px] rounded-sm border bg-muted px-1 font-mono text-(length:--fs-label) leading-none text-muted-foreground",
  variants: {
    /** A keycap on the top bar, which sits on the bar's own ground rather than on a card. */
    onbar: { true: "bg-transparent", false: "" },
  },
  defaultVariants: { onbar: false },
});

/**
 * The top bar's search field: a field-shaped control that opens the command palette. At a window
 * of 1280px or narrower it folds to its glyph, so the area tabs keep their one line.
 */
export const barSearchStyle = defineSlotStyle({
  slot: "console-bar-search",
  base: "h-8 gap-2 rounded-md border border-input bg-background pl-3 pr-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:shadow-[var(--focus-halo)] max-[1281px]:w-8 max-[1281px]:justify-center max-[1281px]:pl-0 max-[1281px]:pr-0 max-[1281px]:[&>kbd]:!hidden max-[1281px]:[&>span]:!hidden mr-2 w-60 max-w-none max-[1441px]:w-50",
  variants: {},
  defaultVariants: {},
});

/** The word in the top bar's search field. */
export const barSearchLabelStyle = defineSlotStyle({
  slot: "console-bar-search-label",
  base: "text-left",
  variants: {},
  defaultVariants: {},
});

/** The palette's panel: one surface holding the field, the list and the key hints. */
export const paletteStyle = defineSlotStyle({
  slot: "console-palette",
  as: "part",
  base: "gap-0 overflow-hidden",
  variants: {},
  defaultVariants: {},
});

/** The Esc keycap at the end of the palette's field, which says how to put it away. */
export const paletteEscStyle = defineSlotStyle({
  slot: "console-palette-esc",
  base: "inset-y-0 right-4",
  variants: {},
  defaultVariants: {},
});

/** The palette's scrolling list of results. */
export const paletteListStyle = defineSlotStyle({
  slot: "console-palette-list",
  as: "part",
  base: "p-1.5",
  variants: {},
  defaultVariants: {},
});

/** The second line of a result: where it lives, or what it acts on. */
export const paletteSubStyle = defineSlotStyle({
  slot: "console-palette-sub",
  base: "text-xs text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** The keys at the end of a result that reach it without the palette. */
export const paletteKeysStyle = defineSlotStyle({
  slot: "console-palette-keys",
  base: "ml-auto gap-1",
  variants: {},
  defaultVariants: {},
});

/** The part of a result's name the query matched. */
export const paletteMatchStyle = defineSlotStyle({
  slot: "console-palette-match",
  base: "bg-transparent font-semibold text-primary",
  variants: {},
  defaultVariants: {},
});

/** The row of key hints under the list. */
export const paletteFootStyle = defineSlotStyle({
  slot: "console-palette-foot",
  base: "gap-4 border-t py-2 text-xs text-muted-foreground px-3.5",
  variants: {},
  defaultVariants: {},
});

/** One hint in the foot: its keys and what they do. */
export const paletteHintStyle = defineSlotStyle({
  slot: "console-palette-hint",
  base: "gap-[5px]",
  variants: {},
  defaultVariants: {},
});

/** The shortcut list: a two-column grid of what a key does and the key. */
export const shortcutListStyle = defineSlotStyle({
  slot: "console-shortcut-list",
  base: "gap-x-6 gap-y-2.5 text-sm",
  variants: {},
  defaultVariants: {},
});

/** The keys column of the shortcut list. */
export const shortcutKeysStyle = defineSlotStyle({
  slot: "console-shortcut-keys",
  base: "gap-1",
  variants: {},
  defaultVariants: {},
});
