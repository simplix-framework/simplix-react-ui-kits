import { useEffect } from "react";

/** The query a site's colour scheme follows: the reader's system setting. */
export const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

/** What {@link followSystemScheme} reads the system setting through: a `MediaQueryList`. */
export interface SchemeQuery {
  readonly matches: boolean;
  addEventListener(type: "change", listener: (event: { readonly matches: boolean }) => void): void;
  removeEventListener(type: "change", listener: (event: { readonly matches: boolean }) => void): void;
}

/** What {@link followSystemScheme} writes the scheme on: the document element's class list. */
export interface SchemeTarget {
  readonly classList: { toggle(token: string, force: boolean): boolean };
}

/**
 * Draws `target` in the dark scheme exactly while the system asks for it, now and on every later
 * change, and returns the function that stops following. The site has no scheme control of its own,
 * so a choice stored by another app on the same origin never decides it.
 */
export function followSystemScheme(query: SchemeQuery, target: SchemeTarget): () => void {
  target.classList.toggle("dark", query.matches);
  const listener = (event: { readonly matches: boolean }) => {
    target.classList.toggle("dark", event.matches);
  };
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

/**
 * Keeps the document in the reader's system colour scheme while the component that calls it is
 * mounted. A site window calls it once, at its root.
 */
export function useSystemScheme(): void {
  useEffect(() => followSystemScheme(window.matchMedia(SYSTEM_DARK_QUERY), document.documentElement), []);
}
