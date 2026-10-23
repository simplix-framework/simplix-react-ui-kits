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

/**
 * One bar of the bars shape. The last bar is the period the figure is a reading of, so a design can
 * set it apart; classic draws every bar alike.
 */
export const tileSparkBarStyle = defineSlotStyle({
  slot: "console-tile-spark-bar",
  base: "",
  variants: {
    mark: { plain: "", last: "", lastToned: "" },
  },
  defaultVariants: { mark: "plain" },
});
