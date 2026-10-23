// Hook that persists color theme + dark mode to localStorage and syncs with the DOM.
// Built on useSyncExternalStore to safely synchronize external state (localStorage, DOM)
// with React rendering.
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { THEMES } from "@simplix-react/ui";

const COLOR_THEME_KEY = "color-theme";
const DARK_MODE_KEY = "dark-mode";

export interface ColorThemeConfig {
  value: string;
  label: string;
  primaryColor?: string;
}

// Color themes come from the framework manifest (@simplix-react/ui THEMES) —
// the single source whose token values ship in the framework theme.css/presets.
// `default` is the neutral base (no data-color-theme attribute).
export const COLOR_THEMES: ColorThemeConfig[] = THEMES;

// Helpers to read stored values. Fall back to "default" / light when unset.
function getStoredColorTheme(): string {
  return localStorage.getItem(COLOR_THEME_KEY) || "default";
}

// Light is the console's default and the OS preference does not decide it. Dark
// is entered only by an explicit choice stored under DARK_MODE_KEY, so a fresh
// profile, a cleared storage and an automated capture run all open light. This
// mirrors the pre-render bootstrap in each app's index.html; the two must agree,
// or the screen flips on mount.
function getStoredDarkMode(): boolean {
  return localStorage.getItem(DARK_MODE_KEY) === "true";
}

// Applies theme to the DOM. CSS uses [data-color-theme="..."] selectors to switch theme variables.
function applyColorTheme(theme: string) {
  const root = document.documentElement;
  if (theme === "default") {
    root.removeAttribute("data-color-theme");
  } else {
    root.setAttribute("data-color-theme", theme);
  }
}

function applyDarkMode(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

// Pub/sub pattern required by useSyncExternalStore.
// When theme or dark mode changes, emitChange() re-renders all subscribed components.
const listeners = new Set<() => void>();
function emitChange() {
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Module-scoped snapshots used as getSnapshot for useSyncExternalStore.
// Assigning a new value triggers React change detection.
let snapshotColorTheme = getStoredColorTheme();
let snapshotDarkMode = getStoredDarkMode();

export function useTheme() {
  const colorTheme = useSyncExternalStore(
    subscribe,
    () => snapshotColorTheme,
    () => "default",
  );

  const isDark = useSyncExternalStore(
    subscribe,
    () => snapshotDarkMode,
    () => false,
  );

  const setColorTheme = useCallback((theme: string) => {
    localStorage.setItem(COLOR_THEME_KEY, theme);
    applyColorTheme(theme);
    snapshotColorTheme = theme;
    emitChange();
  }, []);

  const setDarkMode = useCallback((dark: boolean) => {
    localStorage.setItem(DARK_MODE_KEY, String(dark));
    applyDarkMode(dark);
    snapshotDarkMode = dark;
    emitChange();
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!snapshotDarkMode);
  }, [setDarkMode]);

  // Sync DOM on mount
  useEffect(() => {
    applyColorTheme(snapshotColorTheme);
    applyDarkMode(snapshotDarkMode);
  }, []);

  return { colorTheme, isDark, setColorTheme, setDarkMode, toggleDarkMode };
}
