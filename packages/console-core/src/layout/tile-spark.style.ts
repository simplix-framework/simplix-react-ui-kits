import { defineSlotStyle } from "@simplix-react/ui/design";

/** The shape inside a tile; it takes the tile's tone, or the muted colour where the tile has none. */
export const tileSparkStyle = defineSlotStyle({
  slot: "console-tile-spark",
  base: "",
  variants: {
    toned: { true: "", false: "text-muted-foreground" },
  },
  defaultVariants: { toned: false },
});
