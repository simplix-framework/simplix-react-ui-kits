/**
 * The mark the document element carries for the instant the colour scheme or the colour theme
 * changes. The console stylesheet (`styles/console-tokens.css`) nils every transition under it, so a
 * part that eases its colours takes the new values in the same frame as the ground it stands on.
 */
export const SCHEME_SWITCH_ATTRIBUTE = "data-console-scheme-switch";

/** The part of an element a change of scheme needs: the mark, and a read that brings its styles up to date. */
export interface SchemeSwitchTarget {
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
  /** Read once under the mark, as any layout read brings the document's styles up to date. */
  getBoundingClientRect(): unknown;
}

/**
 * Draws a change of scheme in one frame.
 *
 * <p>A ground (the page, a panel) takes the new scheme at once, while a part that eases its colours
 * (a button, a row, a chip) would keep painting the old ink for the length of its transition, so
 * light ink stood on a dark ground for that long. The target carries {@link SCHEME_SWITCH_ATTRIBUTE}
 * while `change` runs, a read brings the document's styles up to date under it (every transition
 * duration is nil there, so none starts), and the mark is removed once the styles hold the new
 * values: the styles it is removed from already equal the ones it is removed to, so no transition
 * starts then either.
 *
 * @param target the document element
 * @param change what changes the scheme: a class, an attribute
 */
export function drawSchemeChange(target: SchemeSwitchTarget, change: () => void): void {
  target.setAttribute(SCHEME_SWITCH_ATTRIBUTE, "");
  try {
    change();
    target.getBoundingClientRect();
  } finally {
    target.removeAttribute(SCHEME_SWITCH_ATTRIBUTE);
  }
}
