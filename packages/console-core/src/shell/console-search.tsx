import { KeyboardIcon, LanguagesIcon, MoonIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, SunIcon } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocalePicker, useTranslation } from "@simplix-react/i18n/react";

import { ConsoleCommandPalette, ConsoleShortcutList, type ConsoleCommand, type ConsoleShortcut } from "./command-palette";
import { useConsoleHotkeys } from "./console-hotkeys";
import type { FederatedSearchSource } from "./federated-search";
import { PACKAGE_NAMESPACE } from "./locales";
import { useConsoleRecents, type ConsoleRecent } from "./palette-recents";
import type { SidebarCollapse } from "./sidebar-collapse";
import { useTheme } from "./use-theme";

/** A screen the account may open, as the console search lists it. */
export interface ConsoleSearchDestination {
  /** What identifies it among the destinations. */
  readonly key: string;
  /** Its menu entry's name. */
  readonly label: string;
  /** The menu group it sits in. */
  readonly sub?: string;
  readonly icon?: ReactNode;
  readonly href: string;
}

/** What the console search is built from, all of it the product's. */
export interface ConsoleSearchOptions {
  /** The screens the account may open, in menu order: the menu already narrowed by its gates. */
  readonly destinations: readonly ConsoleSearchDestination[];
  /** The screen on show; a destination stood on becomes a recent, however it was reached. */
  readonly route: string;
  /** Opens an address inside the console. */
  readonly navigate: (href: string) => void;
  /** The lists the search asks for records; absent or empty, it finds screens and actions only. */
  readonly records?: readonly FederatedSearchSource[];
  /**
   * Where this reader's recents are kept: a key per signed-in account, outside the sign-in store's
   * prefix (signing out sweeps that prefix, and recents outlive a session). `null` keeps none, which
   * is right until the account is known and wherever recents of one account must not show to
   * another sharing the browser.
   */
  readonly recentsKey: string | null;
  /** The product's own actions, each a real operation the account may run, drawn before the console's. */
  readonly actions?: readonly ConsoleCommand[];
  /** The menu column's fold on a wide window, offered as an action and on 「[」; absent on a phone. */
  readonly collapse?: SidebarCollapse;
}

/** What {@link useConsoleSearch} hands the shell. */
export interface ConsoleSearch {
  /** Opens the palette: the top bar's field and the phone bar's glyph call it. */
  readonly open: () => void;
  /** The palette and the shortcut list, mounted once beside the window. */
  readonly element: ReactNode;
}

/**
 * The console's search for one window: one palette that the top bar's field, the phone bar's
 * glyph and ⌘K or Ctrl+K open, finding the screens the account may open, the records the
 * product's sources hold, and the actions. Before anything is typed it offers what this reader
 * opened last.
 *
 * <p>The console's own actions are the ones every console has and each runs a real operation:
 * the interface language, light or dark, the menu's fold, the list of keys.
 */
export function useConsoleSearch({ destinations, route, navigate, records, recentsKey, actions, collapse }: ConsoleSearchOptions): ConsoleSearch {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/chrome`);
  const [open, setOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);
  const { locale, locales, setLocale } = useLocalePicker();
  const { isDark, toggleDarkMode } = useTheme();
  const { recents, add } = useConsoleRecents(recentsKey);

  const byHref = useMemo(() => new Map(destinations.map((destination) => [destination.href, destination])), [destinations]);
  const sourceLabels = useMemo(() => new Map((records ?? []).map((source) => [source.key, source.label])), [records]);

  const standing = byHref.get(route);
  const standingHref = standing?.href;
  const standingLabel = standing?.label;
  const standingSub = standing?.sub;
  useEffect(() => {
    if (standingHref && standingLabel) add({ key: `page:${standingHref}`, kind: "page", label: standingLabel, sub: standingSub, href: standingHref });
  }, [standingHref, standingLabel, standingSub, add]);

  // A recent is drawn in today's language where the console still knows its name: a screen by its
  // menu entry, a record's list by its source. A record's own name stays as it was when opened.
  const shownRecents = useMemo(
    () =>
      recents.flatMap((recent): ConsoleRecent[] => {
        if (recent.kind === "page") {
          const destination = byHref.get(recent.href);
          // A screen the account may no longer open is not offered.
          return destination ? [{ ...recent, label: destination.label, sub: destination.sub }] : [];
        }
        const label = sourceLabels.get(recent.key.split(":")[1] ?? "");
        return label ? [{ ...recent, sub: label }] : [];
      }),
    [recents, byHref, sourceLabels],
  );

  const commands = useMemo<ConsoleCommand[]>(
    () => [
      ...destinations.map((destination) => ({
        key: `go:${destination.key}`,
        group: "go" as const,
        label: destination.label,
        sub: destination.sub,
        icon: destination.icon,
        href: destination.href,
        run: () => navigate(destination.href),
      })),
      ...(actions ?? []),
      ...locales
        .filter((option) => option.value !== locale)
        .map((option) => ({
          key: `action:locale:${option.value}`,
          group: "action" as const,
          label: t("palette.actions.language", { language: option.displayName }),
          icon: <LanguagesIcon aria-hidden />,
          run: () => setLocale(option.value),
        })),
      {
        key: "action:theme",
        group: "action" as const,
        label: t(isDark ? "palette.actions.toLight" : "palette.actions.toDark"),
        icon: isDark ? <SunIcon aria-hidden /> : <MoonIcon aria-hidden />,
        run: toggleDarkMode,
      },
      ...(collapse
        ? [
            {
              key: "action:rail",
              group: "action" as const,
              label: t(collapse.collapsed ? "palette.actions.expand" : "palette.actions.collapse"),
              icon: collapse.collapsed ? <PanelLeftOpenIcon aria-hidden /> : <PanelLeftCloseIcon aria-hidden />,
              keys: ["["],
              run: collapse.toggle,
            },
          ]
        : []),
      { key: "action:shortcuts", group: "action" as const, label: t("palette.actions.shortcuts"), icon: <KeyboardIcon aria-hidden />, keys: ["?"], run: () => setShortcuts(true) },
    ],
    [destinations, actions, locales, locale, setLocale, isDark, toggleDarkMode, collapse, navigate, t],
  );

  const shortcutRows = useMemo<ConsoleShortcut[]>(
    () => [
      { label: t("shortcuts.palette"), keys: [["⌘", "K"], ["Ctrl", "K"]] },
      { label: t("shortcuts.search"), keys: [["/"]] },
      ...(collapse ? [{ label: t("shortcuts.rail"), keys: [["["]] }] : []),
      { label: t("shortcuts.close"), keys: [["Esc"]] },
      { label: t("shortcuts.list"), keys: [["?"]] },
    ],
    [collapse, t],
  );

  useConsoleHotkeys({
    togglePalette: () => setOpen((was) => !was),
    openPalette: () => setOpen(true),
    toggleRail: collapse?.toggle,
    showShortcuts: () => setShortcuts(true),
  });

  return {
    open: () => setOpen(true),
    element: (
      <>
        <ConsoleCommandPalette open={open} onOpenChange={setOpen} commands={commands} records={records} recents={shownRecents} navigate={navigate} onOpened={add} />
        <ConsoleShortcutList open={shortcuts} onOpenChange={setShortcuts} shortcuts={shortcutRows} />
      </>
    ),
  };
}
