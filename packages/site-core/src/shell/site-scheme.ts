import { useCallback, useEffect, useSyncExternalStore } from "react";

/** The query a site's colour scheme follows when the reader leaves it to the system. */
export const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

/** The reader's colour scheme choice: the system's, or always light or always dark. */
export type SiteScheme = "system" | "light" | "dark";

/** The choices in the order a theme control draws them. */
export const SITE_SCHEMES: readonly SiteScheme[] = ["system", "light", "dark"];

/**
 * Where the reader's choice is kept: its own namespace, outside any session store's prefix, so
 * signing out (which clears the session's keys) never takes the reader's look with it.
 */
export const SITE_SCHEME_KEY = "site.prefs:scheme";

/** What {@link followSystemScheme} reads the system setting through: a `MediaQueryList`. */
export interface SchemeQuery {
  readonly matches: boolean;
  addEventListener(type: "change", listener: (event: { readonly matches: boolean }) => void): void;
  removeEventListener(type: "change", listener: (event: { readonly matches: boolean }) => void): void;
}

/** What the scheme is written on: the document element's class list. */
export interface SchemeTarget {
  readonly classList: { toggle(token: string, force: boolean): boolean };
}

/** Where the choice is stored: `localStorage`, or any store with its three calls. */
export interface SchemeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** A stored value read as a choice: anything but `light` or `dark` (nothing stored, a stale value) is the system's. */
export function parseSiteScheme(value: string | null | undefined): SiteScheme {
  return value === "light" || value === "dark" ? value : "system";
}

/**
 * Draws `target` in the dark scheme exactly while the system asks for it, now and on every later
 * change, and returns the function that stops following.
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
 * Draws `target` in the chosen scheme: a light or dark choice is fixed, the system's is followed
 * through `query`. Returns the function that stops following, which does nothing for a fixed choice.
 */
export function applySiteScheme(scheme: SiteScheme, query: SchemeQuery, target: SchemeTarget): () => void {
  if (scheme === "system") return followSystemScheme(query, target);
  target.classList.toggle("dark", scheme === "dark");
  return () => {};
}

/**
 * The script a page runs in its document head, before the first paint, so the page opens in the
 * reader's choice instead of flashing the other scheme until the app mounts. It reads the same key
 * {@link useSiteScheme} writes and draws the same way {@link applySiteScheme} does; an unreadable
 * store leaves the page to the system.
 */
export function siteSchemeBootstrap(key: string = SITE_SCHEME_KEY): string {
  return (
    "(function () { var s = null; try { s = localStorage.getItem(" +
    JSON.stringify(key) +
    '); } catch (e) {} var d = s === "dark" || (s !== "light" && window.matchMedia(' +
    JSON.stringify(SYSTEM_DARK_QUERY) +
    ').matches); document.documentElement.classList.toggle("dark", d); })();'
  );
}

/** The choice in `storage`, read as {@link parseSiteScheme} reads it; a store that refuses to be read is the system's. */
export function readSiteScheme(storage: SchemeStorage | undefined, key: string = SITE_SCHEME_KEY): SiteScheme {
  try {
    return parseSiteScheme(storage?.getItem(key));
  } catch {
    return "system";
  }
}

/**
 * Keeps the choice in `storage`. The system's choice is kept as no value at all, so a reader who
 * never chose and one who went back to the system read the same. A store that refuses the write
 * leaves the choice for this page only.
 */
export function writeSiteScheme(storage: SchemeStorage | undefined, scheme: SiteScheme, key: string = SITE_SCHEME_KEY): void {
  try {
    if (scheme === "system") storage?.removeItem(key);
    else storage?.setItem(key, scheme);
  } catch {
    // Storage is unavailable (a private window, blocked site data): the choice holds until a reload.
  }
}

const listeners = new Set<() => void>();
/** The choice held for this page, so a store that refuses the write still answers what was chosen. */
let held: SiteScheme | undefined;

const browserStorage = (): SchemeStorage | undefined => {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
};

const snapshot = (): SiteScheme => held ?? readSiteScheme(browserStorage());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // Another tab of the same site changed the choice: this one follows.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== SITE_SCHEME_KEY && event.key !== null) return;
    held = undefined;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

/** The reader's choice and the call that changes it, for a theme control. */
export interface SiteSchemeChoice {
  readonly scheme: SiteScheme;
  readonly setScheme: (scheme: SiteScheme) => void;
}

/**
 * The reader's colour scheme choice, kept under {@link SITE_SCHEME_KEY} and shared by every part of
 * the page that asks for it. Whatever calls it with `apply` (a site window, once, at its root) draws
 * the document in that choice and keeps following the system while the choice is the system's.
 */
export function useSiteScheme({ apply = false }: { readonly apply?: boolean } = {}): SiteSchemeChoice {
  const scheme = useSyncExternalStore(subscribe, snapshot, () => "system" as const);
  useEffect(() => {
    if (!apply) return undefined;
    return applySiteScheme(scheme, window.matchMedia(SYSTEM_DARK_QUERY), document.documentElement);
  }, [apply, scheme]);
  const setScheme = useCallback((next: SiteScheme) => {
    held = next;
    writeSiteScheme(browserStorage(), next);
    listeners.forEach((listener) => listener());
  }, []);
  return { scheme, setScheme };
}
