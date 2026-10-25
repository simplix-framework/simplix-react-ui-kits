import { defineSlotStyle } from "@simplix-react/ui/design";

/** A derived cell whose value is held: neutral with a dashed edge, never a hazard tone and never 0. */
export const formSheetHeldStyle = defineSlotStyle({
  slot: "console-form-sheet-held",
  base: "inline-block rounded-sm border border-dashed border-muted-foreground/50 px-1.5 text-muted-foreground",
  variants: {},
  defaultVariants: {},
});

/** One cell of a source table, top-aligned so merged cells read like the source. */
export const formSheetCellStyle = defineSlotStyle({
  slot: "console-form-sheet-cell",
  as: "part",
  base: "align-top border",
  variants: { header: { true: "bg-muted/50 font-medium", false: "" } },
  defaultVariants: { header: false },
});

/** A source page image, fitted to its sheet. */
export const formSheetSourceImageStyle = defineSlotStyle({
  slot: "console-form-sheet-source-image",
  as: "part",
  base: "block w-full object-contain",
  variants: {},
  defaultVariants: {},
});

/** A column of a source table: a tick column centres its marks. */
export const formSheetColumnStyle = defineSlotStyle({
  slot: "console-form-sheet-column",
  as: "part",
  base: "",
  variants: { tick: { true: "text-center", false: "" } },
  defaultVariants: { tick: false },
});

/** A source line set in from its list: a numbered clause or an indented line. */
export const formSheetIndentStyle = defineSlotStyle({
  slot: "console-form-sheet-indent",
  as: "part",
  base: "",
  variants: { depth: { clause: "pl-4", note: "pl-3" } },
  defaultVariants: { depth: "clause" },
});

/** A link to the record a derived value came from, set flush with the value above it. */
export const formSheetDerivedLinkStyle = defineSlotStyle({
  slot: "console-form-sheet-derived-link",
  as: "part",
  base: "px-0",
  variants: {},
  defaultVariants: {},
});
