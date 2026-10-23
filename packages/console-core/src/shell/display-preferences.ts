// The reader's display choices beyond colour theme and dark mode: the design, the card fill and
// the row density. Stored per browser like the theme, applied to the document element, and read
// by ConsoleProviders so the framework draws in the chosen design and density.
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { THEMES, type UIDefaults } from "@simplix-react/ui";

export type CardFill = "plain" | "outline" | "raised" | "tint" | "lead";
export type Density = UIDefaults["density"];

export interface DisplayPreferences {
  /** The chosen design id, or null for the kit's own design. */
  design: string | null;
  /** The chosen card fill, or null for the one the colour theme names. */
  fill: CardFill | null;
  /** The chosen density, or null for the design's own. */
  density: Density | null;
}

const KEY = "display-preferences";
const EMPTY: DisplayPreferences = { design: null, fill: null, density: null };

function read(): DisplayPreferences {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<DisplayPreferences>) } : EMPTY;
  } catch (error) {
    // A value written by an older build, or storage the browser refuses: start from the defaults.
    if (error instanceof SyntaxError || error instanceof DOMException) return EMPTY;
    throw error;
  }
}

let snapshot: DisplayPreferences = typeof localStorage === "undefined" ? EMPTY : read();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The fill in force: the reader's choice, else the colour theme's, else plain. */
export function resolveFill(prefs: DisplayPreferences, colorTheme: string): CardFill {
  return prefs.fill ?? THEMES.find((t) => t.value === colorTheme)?.fill ?? "plain";
}

/** Writes the fill on the document element; plain is the absence of the attribute. */
export function applyFill(fill: CardFill) {
  const root = document.documentElement;
  if (fill === "plain") root.removeAttribute("data-fill");
  else root.setAttribute("data-fill", fill);
}

/** The reader's display preferences and their setter. */
export function useDisplayPreferences() {
  const prefs = useSyncExternalStore(subscribe, () => snapshot, () => EMPTY);
  const update = useCallback((patch: Partial<DisplayPreferences>) => {
    snapshot = { ...snapshot, ...patch };
    localStorage.setItem(KEY, JSON.stringify(snapshot));
    listeners.forEach((l) => l());
  }, []);
  return { prefs, update };
}

/**
 * Keeps `data-fill` on the document element in step with the preferences and the colour theme.
 *
 * @param colorTheme - the colour theme in force
 */
export function useAppliedFill(colorTheme: string) {
  const { prefs } = useDisplayPreferences();
  const fill = resolveFill(prefs, colorTheme);
  useEffect(() => applyFill(fill), [fill]);
  return fill;
}
