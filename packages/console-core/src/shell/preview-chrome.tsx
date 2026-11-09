import {
  BellIcon,
  CircleHelpIcon,
  KeyboardIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Button,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Flex,
  Popover,
  PopoverTrigger,
  Stack,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@simplix-react/ui";
import { partAttributes } from "@simplix-react/ui/design";
import { zoneLabel } from "../datetime";
import { ManualPanel, useManualStore } from "../manual";
import type { ConsoleArea } from "./area-switch";
import {
  ConsoleCommandPalette,
  ConsoleShortcutList,
  type ConsoleCommand,
  type ConsoleShortcut,
} from "./command-palette";
import { useConsole } from "./console-context";
import { ConsoleStatusStrip, type ConsoleStatusStripProps, ConsoleTopBar } from "./console-top-bar";
import { useConsoleHotkeys } from "./console-hotkeys";
import { PACKAGE_NAMESPACE } from "./locales";
import {
  ConsoleMenuBranch,
  ConsoleMenuBranchRow,
  ConsoleMenuColumn,
  ConsoleMenuFlyout,
  ConsoleMenuInactiveRow,
  ConsoleMenuLinkRow,
  ConsoleMenuRail,
  ConsoleMenuRailButton,
  ConsoleMenuFold,
  ConsoleMenuSlot,
} from "./menu-tree";
import { ConsoleServiceLinks, type ConsoleServiceLink } from "./service-links";
import { useSidebarCollapse } from "./sidebar-collapse";
import { consoleWindowStyle } from "./console-window.style";

/** One destination in the preview's menu. */
export interface ConsolePreviewMenuEntry {
  readonly key: string;
  readonly label: ReactNode;
  readonly icon?: ReactNode;
  /** Where the row goes. Absent, the row is drawn inactive, as the console draws an unbuilt screen. */
  readonly href?: string;
  /** Why an inactive row cannot be opened, announced and shown on hover, as the console shows it. */
  readonly inactiveReason?: string;
  /** The mark at the end of an inactive row, saying which kind of unavailable it is. */
  readonly inactiveMark?: ReactNode;
  readonly children?: readonly ConsolePreviewMenuEntry[];
}

/** One cluster of the menu: a branch row and the destinations under it. */
export interface ConsolePreviewMenuGroup {
  readonly key: string;
  readonly label: ReactNode;
  readonly icon?: ReactNode;
  readonly entries: readonly ConsolePreviewMenuEntry[];
}

/** The menu column of one area. */
export interface ConsolePreviewMenu {
  /** The area's name, over the column. */
  readonly title: ReactNode;
  readonly groups: readonly ConsolePreviewMenuGroup[];
}

/** The words the chrome prints, in the product's own catalogue. */
export interface ConsolePreviewChromeLabels {
  readonly search: string;
  readonly site: string;
  readonly noSite: string;
  readonly notifications: string;
  /** What the bell's list says when nothing is waiting. */
  readonly noNotifications: string;
  readonly account: string;
  readonly signOut: string;
  readonly menu: string;
  readonly rail: string;
  readonly expand: string;
  readonly collapse: string;
  readonly status: string;
  readonly quiet: string;
  /** The workplace clock, with the zone already filled in by {@link ConsolePreviewChrome.siteClock}. */
  readonly siteClock: (zone: string) => string;
}

/** One reading on the right of the status strip. */
export interface ConsolePreviewStatusSegment {
  readonly label: string;
  /** `warn` when the reading is something somebody has to act on. */
  readonly tone?: "plain" | "warn";
}

/** What the status strip reports beyond the workplace's zone. */
export interface ConsolePreviewStatus {
  /** What is happening now. Absent, the strip says nothing is waiting. */
  readonly ticker?: { readonly text: string; readonly live?: boolean };
  /** The shift the workplace is on, read after its zone in the same reading. */
  readonly shift?: string;
  /** Readings after the zone, in order. */
  readonly segments?: readonly ConsolePreviewStatusSegment[];
  /**
   * The workplace's wall clock when the preview opens, as `HH:MM:SS`, so a still of the page reads
   * the story's own time. It ticks from there. Absent, the strip draws no clock.
   */
  readonly clockStart?: string;
}

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
}

/** Whether an entry is the current destination or holds it. */
function holds(entry: ConsolePreviewMenuEntry, current: string | undefined): boolean {
  if (current === undefined) return false;
  return entry.key === current || (entry.children ?? []).some((child) => holds(child, current));
}

/** A label the palette can match, or nothing when the product handed in markup. */
const textOf = (node: ReactNode): string | undefined => (typeof node === "string" ? node : undefined);

/** A destination the palette can open: a menu row that has an address and a name in words. */
interface Destination {
  readonly key: string;
  readonly label: string;
  readonly path: string;
  readonly href: string;
  readonly icon?: ReactNode;
}

/** Every destination of every area, with the area and cluster it sits under. */
function destinationsOf(chrome: ConsolePreviewChrome): Destination[] {
  const found: Destination[] = [];
  for (const area of chrome.areas) {
    const menu = chrome.menuFor(area.key);
    const areaLabel = textOf(area.label) ?? area.key;
    const walk = (entry: ConsolePreviewMenuEntry, path: string) => {
      if (entry.children) {
        entry.children.forEach((child) => walk(child, path));
        return;
      }
      const label = textOf(entry.label);
      if (entry.href && label) found.push({ key: entry.key, label, path, href: entry.href, icon: entry.icon });
    };
    for (const group of menu.groups) {
      const path = menu.groups.length > 1 ? `${areaLabel} / ${textOf(group.label) ?? group.key}` : areaLabel;
      group.entries.forEach((entry) => walk(entry, path));
    }
  }
  return found;
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
        onSearch={() => setPalette(true)}
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
                foot={chrome.services && <ConsoleServiceLinks layout="rail" {...chrome.services} />}
              >
                {menu.groups.map((group) => (
                  <RailGroup key={group.key} group={group} current={chrome.current} />
                ))}
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

/**
 * The fold of every branch the reader has toggled, kept for the life of the page.
 *
 * <p>A branch that opened only when it held the current screen showed a different column on every
 * screen, so a destination seen on one screen was missing on the next. Every branch now starts
 * open, and a fold the reader chose outlives the move to another screen because the chrome is
 * remounted per screen and this map is not.
 */
const branchFolds = new Map<string, boolean>();

function useBranchFold(key: string, forced: boolean): readonly [boolean, () => void] {
  const [open, setOpen] = useState(() => forced || (branchFolds.get(key) ?? true));
  const toggle = () => {
    branchFolds.set(key, !open);
    setOpen(!open);
  };
  return [forced || open, toggle];
}

function MenuGroup({
  group,
  single,
  current,
}: {
  readonly group: ConsolePreviewMenuGroup;
  readonly single: boolean;
  readonly current: string | undefined;
}) {
  const [open, toggle] = useBranchFold(`group:${group.key}`, single);
  return (
    <Stack gap="xs">
      {single ? null : (
        <ConsoleMenuBranchRow weight="cluster" icon={group.icon} label={group.label} open={open} onToggle={toggle} />
      )}
      <ConsoleMenuFold open={single || open}>
        <ConsoleMenuBranch ruled={!single}>
          {group.entries.map((entry) => (
            <EntryRow key={entry.key} entry={entry} current={current} />
          ))}
        </ConsoleMenuBranch>
      </ConsoleMenuFold>
    </Stack>
  );
}

function RailGroup({ group, current }: { readonly group: ConsolePreviewMenuGroup; readonly current: string | undefined }) {
  const [open, setOpen] = useState(false);
  const active = group.entries.some((entry) => holds(entry, current));
  const name = textOf(group.label);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ConsoleMenuRailButton active={active} label={name} onMouseEnter={() => setOpen(true)}>
          {group.icon}
        </ConsoleMenuRailButton>
      </PopoverTrigger>
      <ConsoleMenuFlyout title={group.label} onMouseLeave={() => setOpen(false)}>
        {group.entries.map((entry) => (
          <EntryRow key={entry.key} entry={entry} current={current} />
        ))}
      </ConsoleMenuFlyout>
    </Popover>
  );
}

function EntryRow({ entry, current }: { readonly entry: ConsolePreviewMenuEntry; readonly current: string | undefined }) {
  const [open, toggle] = useBranchFold(`entry:${entry.key}`, false);
  if (entry.children) {
    return (
      <Stack gap="xs">
        <ConsoleMenuBranchRow icon={entry.icon} label={entry.label} open={open} onToggle={toggle} />
        <ConsoleMenuFold open={open}>
          <ConsoleMenuBranch ruled>
            {entry.children.map((child) => (
              <EntryRow key={child.key} entry={child} current={current} />
            ))}
          </ConsoleMenuBranch>
        </ConsoleMenuFold>
      </Stack>
    );
  }
  if (!entry.href) {
    const row = <ConsoleMenuInactiveRow icon={entry.icon} label={entry.label} mark={entry.inactiveMark} aria-description={entry.inactiveReason} />;
    if (!entry.inactiveReason) return row;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{row}</TooltipTrigger>
        <TooltipContent>{entry.inactiveReason}</TooltipContent>
      </Tooltip>
    );
  }
  return <ConsoleMenuLinkRow href={entry.href} current={entry.key === current} icon={entry.icon} label={entry.label} />;
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
