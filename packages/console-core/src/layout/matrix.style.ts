import { defineSlotStyle } from "@simplix-react/ui/design";

/** The frame the matrix scrolls sideways inside. */
export const matrixFrameStyle = defineSlotStyle({
  slot: "console-matrix-frame",
  base: "rounded-md border",
  variants: {},
  defaultVariants: {},
});

/** The top-left cell. */
export const matrixCornerStyle = defineSlotStyle({
  slot: "console-matrix-corner",
  base: "border-b bg-muted/60 px-3 py-2",
  variants: {},
  defaultVariants: {},
});

/** A column head; a marked column (a holiday, a closed period) stands apart. */
export const matrixHeadStyle = defineSlotStyle({
  slot: "console-matrix-head",
  base: "border-b px-3 py-2",
  variants: {
    centered: { true: "text-center", false: "" },
    marked: { true: "bg-warning/10", false: "bg-muted/60" },
  },
  defaultVariants: { centered: false, marked: false },
});

/** The first cell of a row. */
export const matrixRowHeadStyle = defineSlotStyle({
  slot: "console-matrix-row-head",
  base: "border-b bg-background px-3 py-2",
  variants: {},
  defaultVariants: {},
});

/** A cell where a row meets a column; a tone paints it, and a marked column paints it lightly where no tone does. */
export const matrixCellStyle = defineSlotStyle({
  slot: "console-matrix-cell",
  base: "border-b px-3 py-2",
  variants: {
    tone: {
      none: "",
      warning: "bg-warning/15",
      danger: "bg-destructive/15",
      muted: "bg-muted/40",
      // Awaiting an interpretation: neutral with a dashed inner edge, so it never reads as a hazard.
      pending: "bg-muted/30 outline-1 outline-dashed -outline-offset-4 outline-muted-foreground/50 text-muted-foreground",
    },
    marked: { true: "bg-warning/5", false: "" },
  },
  defaultVariants: { tone: "none", marked: false },
});
