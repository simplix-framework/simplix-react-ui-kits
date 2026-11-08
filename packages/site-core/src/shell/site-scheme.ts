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

/**
 * What the scheme is written on: the document element's class list, and its style where it has one,
 * whose `color-scheme` tells the browser to draw its own controls and scrollbars in the same scheme.
 */
export interface SchemeTarget {
  readonly classList: { toggle(token: string, force: boolean): boolean; contains?(token: string): boolean };
  readonly style?: { colorScheme: string };
  /** With {@link removeAttribute} and {@link getBoundingClientRect}, lets a change of scheme draw without easing. */
  setAttribute?(name: string, value: string): void;
  removeAttribute?(name: string): void;
  /** Read once to bring the document's styles up to date, as any layout read does. */
  getBoundingClientRect?(): unknown;
}

/**
 * The mark the document element carries for the instant its scheme changes. The design's stylesheet
 * keys the motion durations off it (`:root[data-site-scheme-switch]`), so a part that eases its
 * colours (an action, a switch option) takes the new scheme in the same frame as the ground it
 * stands on.
 */
export const SCHEME_SWITCH_ATTRIBUTE = "data-site-scheme-switch";

/**
 * The address parameter a site hands the reader's choice to another origin in (a sign-in page, an
 * account page), as it hands the language over in `ui_locales`. Every part that writes or reads it
 * names this constant, so the two sides cannot drift apart.
 */
export const SCHEME_PARAM = "ui_scheme";

/** A value read as a choice where an unknown value means no choice at all, as an address parameter is read. */
export function parseSchemeParam(value: string | null | undefined): SiteScheme | null {
  return value === "light" || value === "dark" || value === "system" ? value : null;
}

/**
 * The first choice among `candidates` that names one, in the order given (the address parameter,
 * then a kept value), or the system's where none does.
 *
 * @param candidates the values to read, most specific first
 */
export function pickSiteScheme(...candidates: readonly (string | null | undefined)[]): SiteScheme {
  for (const candidate of candidates) {
    const choice = parseSchemeParam(candidate);
    if (choice !== null) return choice;
  }
  return "system";
}

/**
 * Marks `target` dark or light: the class the dark values key off, and its `color-scheme`.
 *
 * <p>A change of scheme draws in one frame. The grounds (a bar, a switch track) take the new values
 * at once, while a part that eases its colours would still be painting the old ink for the length of
 * its transition, so light ink stood on a dark ground for that long. The target carries
 * {@link SCHEME_SWITCH_ATTRIBUTE} while the class and the colour scheme change, a read brings the
 * document's styles up to date under it, and the mark is removed once the styles hold the new
 * values; no transition starts, because the styles the mark is removed from already equal the
 * ones it is removed to. A target that already carries the scheme is left as it is.
 */
export function markSiteScheme(target: SchemeTarget, dark: boolean): void {
  const changing = target.classList.contains?.("dark") !== dark;
  const quiet = changing && target.setAttribute !== undefined && target.removeAttribute !== undefined;
  if (quiet) target.setAttribute?.(SCHEME_SWITCH_ATTRIBUTE, "");
  target.classList.toggle("dark", dark);
  if (target.style) target.style.colorScheme = dark ? "dark" : "light";
  if (quiet) {
    target.getBoundingClientRect?.();
    target.removeAttribute?.(SCHEME_SWITCH_ATTRIBUTE);
  }
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
  markSiteScheme(target, query.matches);
  const listener = (event: { readonly matches: boolean }) => {
    markSiteScheme(target, event.matches);
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
  markSiteScheme(target, scheme === "dark");
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
    ').matches); var r = document.documentElement; r.classList.toggle("dark", d); if (r.style) r.style.colorScheme = d ? "dark" : "light"; })();'
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
