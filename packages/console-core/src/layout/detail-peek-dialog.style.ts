import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The peek trigger at the end of a value.
 *
 * **The press target stays 28px and the line it sits on goes back to 20px.** `icon-xs` is
 * `size-7`, and a value that pairs a name with this trigger is laid out as a row of the two -
 * so the button, not the text, decided the value's height, and a detail column centring its
 * values dropped every peeked one 4px below its label while the plain rows beside it sat
 * true. Measured on the running console at 1440: 3px from the label's top on a plain row,
 * 7px on a peeked one.
 *
 * `-my-1` takes 4px off each end of the button's OUTER box, so it contributes 20px to the
 * line while its border box stays 28px and overflows the line invisibly - a ghost button
 * paints nothing until it is hovered. The hit area is therefore untouched, which is the
 * whole point: the alternative fix, shrinking the box to `size-5`, would have aligned the
 * row by making the thing harder to press.
 *
 * **Not the container's alignment.** `items-baseline` and `items-center` both follow the
 * value's height, so either would fix this row and break the ones that are genuinely tall -
 * a 32px avatar, `DetailImageField`'s 96px picture, a two-line value whose label belongs
 * beside its FIRST line. `items-start` is right and stays; what was wrong was a 12px glyph
 * claiming 28px of vertical space.
 */
export const peekTriggerStyle = defineSlotStyle({
  slot: "console-peek-trigger",
  as: "part",
  base: "-my-1",
  variants: {},
  defaultVariants: {},
});
