/** The part of the Web Storage API the memories use, so a product or a story can hand in its own. */
export type PresentationStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** The browser's local storage, or undefined where it cannot be reached (a private window, blocked site data). */
export function browserStorage(): PresentationStorage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch (error) {
    if (error instanceof DOMException || error instanceof TypeError) return undefined;
    throw error;
  }
}
