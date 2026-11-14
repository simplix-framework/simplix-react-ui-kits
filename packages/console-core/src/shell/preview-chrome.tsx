import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BellIcon, CircleHelpIcon, KeyboardIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Button, DropdownMenuItem, DropdownMenuSeparator, Flex } from "@simplix-react/ui";
import { partAttributes } from "@simplix-react/ui/design";

import { zoneLabel } from "../datetime";
import { ManualPanel, useManualStore } from "../manual";
import type { ConsoleArea } from "./area-switch";
import { ConsoleCommandPalette, ConsoleShortcutList, type ConsoleCommand, type ConsoleShortcut } from "./command-palette";
import { useConsole } from "./console-context";
import { ConsoleStatusStrip, type ConsoleStatusStripProps, ConsoleTopBar } from "./console-top-bar";
import { useConsoleHotkeys } from "./console-hotkeys";
import { PACKAGE_NAMESPACE } from "./locales";
import { ConsoleMenuColumn, ConsoleMenuRail, ConsoleMenuSlot } from "./menu-tree";
import { ConsoleMenuSearch } from "./menu-search";
import { ConsoleServiceLinks, type ConsoleServiceLink } from "./service-links";
import { useSidebarCollapse } from "./sidebar-collapse";
import { consoleWindowStyle } from "./console-window.style";
import type { ConsolePreviewChromeLabels, ConsolePreviewMenu, ConsolePreviewStatus } from "./preview-chrome-types";
import { MenuGroup, RailEntry, RailGroup, destinationsOf } from "./preview-chrome-menu";

/** What the window around a previewed screen draws. */
export interface ConsolePreviewChrome {
  /** The product mark beside the title. */
  readonly mark?: ReactNode;
  readonly title: ReactNode;
  /** A short tag after the title saying who the console is for. */
  readonly badge?: ReactNode;
  readonly areas: readonly ConsoleArea[];
  /** The area the window opens on, which is the one holding the screen. */
  readonly area: string;
  /** The menu column of an area, asked again whenever the reader switches area. */
  readonly menuFor: (area: string) => ConsolePreviewMenu;
  /** The destination the screen is, marked in the column and opened in its branch. */
  readonly current?: string;
  readonly labels: ConsolePreviewChromeLabels;
  /**
   * The reader's language and light/dark controls, wired to whatever owns those settings in the
   * preview. The console's own `LocalePicker` and `DarkModeToggle` keep their choice in local storage
   * and reapply it on mount, which would overrule the preview's settings.
   */
  readonly settings: ReactNode;
  /** The name the column's collapse choice is kept under. */
  readonly namespace: string;
  /** How many notifications are unread, pinned to the bell. */
  readonly notificationCount?: number;
  /** What the status strip reports. */
  readonly status?: ConsolePreviewStatus;
  /**
   * The strip exactly as a product draws it (its own ticker, segments and, where it has one, clock).
   * Given, it replaces the strip composed from `status`, the workplace's zone and the ticking clock,
   * for a product whose strip reads a service and says nothing of the workplace.
   */
  readonly strip?: ConsoleStatusStripProps;
  /**
   * The go-to chords: 「G」 then the letter opens the menu destination of that key. Each also heads
   * the palette's go-to list.
   */
  readonly go?: Readonly<Record<string, string>>;
  /** Actions of the product's own, listed in the palette beside the chrome's. */
  readonly commands?: readonly ConsoleCommand[];
  /** Opens a destination's address. Absent, the window's location is changed. */
  readonly navigate?: (href: string) => void;
  /** The route the help panel answers for. */
  readonly manualRoute?: string;
  /**
   * The services beside the console, at the foot of the column and of the rail, as the console draws
   * them. A service with no address is left out.
   */
  readonly services?: { readonly title: string; readonly links: readonly ConsoleServiceLink[] };
  /**
   * Where the search field stands: in the top bar (`bar`, the default) or at the foot of the menu
   * (`menu`), where the top bar draws none. The palette it opens is the same.
   */
  readonly searchIn?: "bar" | "menu";
}

/**
 * The console's three bands around a previewed screen: the area bar on top, the area's menu on the
 * left, the status strip at the foot.
 *
 * <p>For drawing a page as it sits in the running console when there is no router and no session:
 * the menu and the words come in as props, the signed-in account and the workplace come from
 * {@link useConsole}, and the column collapses to a rail exactly as the console's does. The command
 * palette (⌘K, 「/」 or the bar's search) and the keys listed under 「?」 work as they do in the
 * console.
 */
export function ConsolePreviewWindowChrome({
  chrome,
  children,
}: {
  readonly chrome: ConsolePreviewChrome;
  readonly children: ReactNode;
}) {
  const { labels } = chrome;
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/chrome`);
  const [area, setArea] = useState(chrome.area);
  useEffect(() => setArea(chrome.area), [chrome.area]);
  const { collapsed, toggle } = useSidebarCollapse(chrome.namespace);
  const menu = chrome.menuFor(area);
  const searchInMenu = chrome.searchIn === "menu";
  const [palette, setPalette] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);
  const [bell, setBell] = useState(false);
  const toggleManual = useManualStore((s) => s.toggle);
  const { displayName, roleName, sites, site, selectSite, siteTimeZone } = useConsole();
  const zone = site && siteTimeZone ? labels.siteClock(zoneLabel(siteTimeZone, new Date())) : labels.noSite;
  const clock = useTickingClock(chrome.status?.clockStart);
  const manualOpen = useManualStore((s) => s.open);

  const navigate = chrome.navigate ?? ((href: string) => window.location.assign(href));
  const destinations = useMemo(() => destinationsOf(chrome), [chrome]);
  const goTo = useMemo(() => {
    const byKey = new Map(destinations.map((d) => [d.key, d]));
    return Object.entries(chrome.go ?? {}).flatMap(([letter, key]) => {
      const destination = byKey.get(key);
      return destination ? [{ letter, destination }] : [];
    });
  }, [chrome.go, destinations]);

  const commands = useMemo<ConsoleCommand[]>(
    () => [
      ...goTo.map(({ letter, destination }) => ({
        key: `go:${destination.key}`,
        group: "go" as const,
        label: destination.label,
        icon: destination.icon,
        keys: ["G", letter.toUpperCase()],
        run: () => navigate(destination.href),
      })),
      {
        key: "action:notifications",
        group: "action",
        label: t("palette.actions.notifications"),
        icon: <BellIcon aria-hidden />,
        run: () => setBell(true),
      },
      {
        key: "action:rail",
        group: "action",
        label: collapsed ? labels.expand : labels.collapse,
        icon: collapsed ? <PanelLeftOpenIcon aria-hidden /> : <PanelLeftCloseIcon aria-hidden />,
        keys: ["["],
        run: toggle,
      },
      {
        key: "action:help",
        group: "action",
        label: t("palette.actions.help"),
        icon: <CircleHelpIcon aria-hidden />,
        run: toggleManual,
      },
      ...(chrome.commands ?? []),
      {
        key: "action:shortcuts",
        group: "action",
        label: t("palette.actions.shortcuts"),
        icon: <KeyboardIcon aria-hidden />,
        keys: ["?"],
        run: () => setShortcuts(true),
      },
      ...destinations.map((destination) => ({
        key: `menu:${destination.key}`,
        group: "menu" as const,
        label: destination.label,
        sub: destination.path,
        icon: destination.icon,
        run: () => navigate(destination.href),
      })),
    ],
    // `navigate` is rebuilt every render when the product hands none; the destinations carry the change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [goTo, destinations, collapsed, labels, toggle, toggleManual, chrome.commands, chrome.navigate, t],
  );

  const shortcutRows = useMemo<ConsoleShortcut[]>(
    () => [
      { label: t("shortcuts.palette"), keys: [["⌘", "K"]] },
      { label: t("shortcuts.search"), keys: [["/"]] },
      { label: t("shortcuts.rail"), keys: [["["]] },
      ...goTo.map(({ letter, destination }) => ({
        label: t("shortcuts.go", { name: destination.label }),
        keys: [["G", letter.toUpperCase()]],
      })),
      { label: t("shortcuts.close"), keys: [["Esc"]] },
      { label: t("shortcuts.list"), keys: [["?"]] },
    ],
    [goTo, t],
  );

  useConsoleHotkeys({
    togglePalette: () => setPalette((open) => !open),
    openPalette: () => setPalette(true),
    toggleRail: menu.groups.length > 0 ? toggle : undefined,
    showShortcuts: () => setShortcuts(true),
    go: Object.fromEntries(goTo.map(({ letter, destination }) => [letter, () => navigate(destination.href)])),
  });

  return (
    <Flex direction="column" gap="none" className="h-dvh" {...partAttributes(consoleWindowStyle, {})}>
      <ConsoleTopBar
        mark={chrome.mark}
        title={chrome.title}
        badge={chrome.badge}
        areas={chrome.areas}
        area={area}
        onArea={setArea}
        onSearch={searchInMenu ? undefined : () => setPalette(true)}
        region={{
          label: labels.site,
          current: site?.siteName,
          empty: labels.noSite,
          items: sites.map((candidate) => ({ key: candidate.siteId, label: candidate.siteName })),
          onSelect: selectSite,
        }}
        notifications={{
          label: labels.notifications,
          empty: labels.noNotifications,
          count: chrome.notificationCount ?? 0,
          open: bell,
          onOpenChange: setBell,
        }}
        onHelp={toggleManual}
        helpOpen={manualOpen}
        settings={chrome.settings}
        account={{
          name: displayName,
          role: roleName,
          menu: (
            <>
              <DropdownMenuItem disabled>{labels.account}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>{labels.signOut}</DropdownMenuItem>
            </>
          ),
        }}
      />
      <Flex gap="none" flex overflow="hidden">
        {menu.groups.length > 0 && (
          <ConsoleMenuSlot>
            {collapsed ? (
              <ConsoleMenuRail
                label={labels.rail}
                lead={
                  <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label={labels.expand} title={labels.expand}>
                    <PanelLeftOpenIcon />
                  </Button>
                }
                search={searchInMenu ? <ConsoleMenuSearch layout="rail" onOpen={() => setPalette(true)} /> : undefined}
                foot={chrome.services && <ConsoleServiceLinks layout="rail" {...chrome.services} />}
              >
                {/* An area of one group is a mark per destination; several groups are a mark each, opening their rows. */}
                {menu.groups.length === 1
                  ? menu.groups[0]?.entries.map((entry) => <RailEntry key={entry.key} entry={entry} current={chrome.current} onOpen={navigate} />)
                  : menu.groups.map((group) => <RailGroup key={group.key} group={group} current={chrome.current} />)}
              </ConsoleMenuRail>
            ) : (
              <ConsoleMenuColumn
                label={labels.menu}
                title={menu.title}
                action={
                  <Button variant="ghost" size="icon-xs" onClick={toggle} aria-label={labels.collapse} title={labels.collapse}>
                    <PanelLeftCloseIcon />
                  </Button>
                }
                search={searchInMenu ? <ConsoleMenuSearch layout="column" onOpen={() => setPalette(true)} /> : undefined}
                foot={chrome.services && <ConsoleServiceLinks layout="column" {...chrome.services} />}
              >
                {menu.groups.map((group) => (
                  <MenuGroup
                    key={group.key}
                    group={group}
                    single={menu.groups.length === 1}
                    current={chrome.current}
                  />
                ))}
              </ConsoleMenuColumn>
            )}
          </ConsoleMenuSlot>
        )}
        {children}
        {manualOpen && <ManualPanel route={chrome.manualRoute ?? "/"} />}
      </Flex>
      <ConsoleStatusStrip {...previewStripProps(chrome, zone, clock)} />
      <ConsoleCommandPalette open={palette} onOpenChange={setPalette} commands={commands} />
      <ConsoleShortcutList open={shortcuts} onOpenChange={setShortcuts} shortcuts={shortcutRows} />
    </Flex>
  );
}

/**
 * The strip along the preview's foot: the product's own when the chrome gives one, otherwise the
 * ticker, the workplace's zone with its shift, the readings and the ticking clock.
 *
 * @param chrome what the window draws
 * @param zone the workplace's zone reading, already worded
 * @param clock the ticking clock's reading, absent when the chrome starts none
 */
export function previewStripProps(chrome: ConsolePreviewChrome, zone: string, clock: string | undefined): ConsoleStatusStripProps {
  if (chrome.strip) return chrome.strip;
  return {
    label: chrome.labels.status,
    ticker: { text: chrome.status?.ticker?.text ?? chrome.labels.quiet, live: chrome.status?.ticker?.live },
    segments: [{ label: chrome.status?.shift ? `${zone} · ${chrome.status.shift}` : zone }, ...(chrome.status?.segments ?? [])],
    clock,
  };
}

/** Seconds since midnight of an `HH:MM:SS` reading. */
function secondsOf(clock: string): number {
  const [h = 0, m = 0, s = 0] = clock.split(":").map(Number);
  return (h * 60 + m) * 60 + s;
}

/** The workplace's wall clock, ticking each second from the reading the preview opened at. */
function useTickingClock(start: string | undefined): string | undefined {
  const [opened] = useState(() => Date.now());
  const [now, setNow] = useState(opened);
  useEffect(() => {
    if (start === undefined) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [start]);
  if (start === undefined) return undefined;
  const total = secondsOf(start) + Math.floor((now - opened) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 3600) % 24)}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
}

export * from "./preview-chrome-types";
export * from "./preview-chrome-menu";
