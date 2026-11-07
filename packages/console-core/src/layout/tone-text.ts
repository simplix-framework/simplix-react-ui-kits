import { STATUS_TONES, type StatusTone } from "@simplix-react/ui";

/** A class that sets the text colour, with or without variant prefixes (`text-red-700`, `dark:text-red-400`). */
const TEXT_COLOUR_CLASS = /^(?:[a-z][\w-]*:)*text-/;

/**
 * The classes that colour a figure's text in a tone, read from the tone's outline slot.
 *
 * <p>A tone's `icon` slot is the colour of a mark (`text-emerald-500`), which needs 3:1 against
 * its ground and sits near 2.3:1 for success and 3.8:1 for info once it is used for words. The
 * outline slot is the one the framework draws a tone's text in on a plain ground (`text-emerald-700
 * dark:text-emerald-400`), so the figure takes its text classes and leaves the border classes
 * behind. A tone whose outline names no text colour has none to give.
 *
 * @param tone the tone the figure is drawn in
 * @returns the text-colour classes of the tone, or `undefined` where the tone names none
 */
export function toneTextClass(tone: StatusTone): string | undefined {
  const classes = STATUS_TONES[tone].outline.split(/\s+/).filter((name) => TEXT_COLOUR_CLASS.test(name));
  return classes.length > 0 ? classes.join(" ") : undefined;
}
