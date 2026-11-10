/**
 * Where the reader's help-panel width lives between visits: under the app's preference namespace
 * (`usePreferenceNamespace`).
 *
 * <p>Its own key, outside every token store's prefix. Signing out clears a token store by
 * sweeping its prefix, so a preference parked inside is erased by the one act it has to outlive -
 * the panel would come back narrow after every sign-in with nothing saying why.
 */
const keyFor = (namespace: string) => `${namespace}.prefs:manual-width`;

/**
 * The narrowest the panel may be dragged.
 *
 * <p>The manual's pictures are drawn at the width the screen they show was drawn at, so below
 * this the picture is the thing the reader came for and cannot make out. Narrower than the prose
 * needs is a panel that costs its width and answers nothing.
 */
export const MIN_MANUAL_WIDTH = 320;

/** The widest, so the panel cannot take the screen it is explaining. */
export const MAX_MANUAL_WIDTH = 900;

/** What it opens at before anybody has dragged it. */
export const DEFAULT_MANUAL_WIDTH = 480;

/**
 * @param width a width to keep inside the two bounds
 * @returns that width, clamped
 */
export const clampManualWidth = (width: number) =>
  Math.min(MAX_MANUAL_WIDTH, Math.max(MIN_MANUAL_WIDTH, Math.round(width)));

/**
 * @param namespace the app's preference namespace
 * @returns the width the reader last left, or the default
 */
export function readManualWidth(namespace: string): number {
  try {
    const held = Number(localStorage.getItem(keyFor(namespace)));
    return Number.isFinite(held) && held > 0 ? clampManualWidth(held) : DEFAULT_MANUAL_WIDTH;
  } catch {
    return DEFAULT_MANUAL_WIDTH;
  }
}

/**
 * @param namespace the app's preference namespace
 * @param width the width to keep
 */
export function writeManualWidth(namespace: string, width: number): void {
  try {
    localStorage.setItem(keyFor(namespace), String(clampManualWidth(width)));
  } catch {
    /* storage unavailable - the width lasts this visit, which beats refusing the drag */
  }
}
