import type { StatusTone } from "@simplix-react/ui";

import type { MarkTone } from "./chart-tip";

/**
 * The mark tone a status tone is drawn in on a chart: the same colour the status badge of that value
 * draws in a list, so a dashboard card and the screen it leads to agree on what each state looks
 * like. A dashboard mark has no `pending` or `processing`, so both are drawn as `info`, the tone a
 * state still in motion reads as.
 *
 * @param tone the tone the module's own tone map gives the value
 */
export function markToneOf(tone: StatusTone): MarkTone {
  switch (tone) {
    case "pending":
    case "processing":
      return "info";
    default:
      return tone;
  }
}

/**
 * The categorical series tone of the `index`th mark in a row of marks with no tone of their own: the
 * three series colours in turn, so neighbouring segments and meters never share a colour.
 *
 * @param index the mark's position, from zero
 */
export function seriesTone(index: number): MarkTone {
  return `series-${((Math.abs(Math.trunc(index)) % 3) + 1) as 1 | 2 | 3}`;
}
