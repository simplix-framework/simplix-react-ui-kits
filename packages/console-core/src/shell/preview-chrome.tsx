import {
  BellIcon,
  ChevronDownIcon,
  CircleHelpIcon,
  ClockIcon,
  KeyboardIcon,
  MapPinIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Flex,
  Heading,
  Popover,
  PopoverTrigger,
  Stack,
  Text,
} from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";
import { zoneLabel } from "../datetime";
import { EllipsisText } from "../layout";
import { ManualPanel, useManualStore } from "../manual";
import { ConsoleAreaSwitch, type ConsoleArea } from "./area-switch";
import {
  ConsoleBarSearch,
  ConsoleCommandPalette,
  ConsoleShortcutList,
  type ConsoleCommand,
  type ConsoleShortcut,
} from "./command-palette";
import { useConsole } from "./console-context";
import { useConsoleHotkeys } from "./console-hotkeys";
import { CountedIconButton } from "./counted-icon-button";
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
} from "./menu-tree";
import { useSidebarCollapse } from "./sidebar-collapse";
import { consoleWindowStyle } from "./console-window.style";
import {
  previewAccountCaretStyle,
  previewAccountNameStyle,
  previewAccountStyle,
  previewAvatarStyle,
  previewBrandStyle,
  previewClockStyle,
  previewFlyoutTitleStyle,
  previewLiveDotStyle,
  previewLivePulseStyle,
  previewSegmentRuleStyle,
  previewSegmentStyle,
  previewSettingsStyle,
  previewSiteStyle,
  previewStatusStyle,
  previewTickerStyle,
  previewTitleStyle,
  previewToolStyle,
  previewToolsStyle,
  previewTopBarLeadStyle,
  previewTopBarRowStyle,
  previewTopBarStyle,
} from "./preview-chrome.style";

/** One destination in the preview's menu. */
export interface ConsolePreviewMenuEntry {
  readonly key: string;
  readonly label: ReactNode;
  readonly icon?: ReactNode;
  /** Where the row goes. Absent, the row is drawn inactive, as the console draws an unbuilt screen. */
  readonly href?: string;
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
      <PreviewTopBar
        chrome={chrome}
        area={area}
        onArea={setArea}
        onSearch={() => setPalette(true)}
        bell={bell}
        onBell={setBell}
        onHelp={toggleManual}
        helpOpen={manualOpen}
      />
      <Flex gap="none" flex overflow="hidden">
        {menu.groups.length > 0 &&
          (collapsed ? (
            <ConsoleMenuRail
              label={labels.rail}
              lead={
                <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label={labels.expand} title={labels.expand}>
                  <PanelLeftOpenIcon />
                </Button>
              }
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
          ))}
        {children}
        {manualOpen && <ManualPanel route={chrome.manualRoute ?? "/"} />}
      </Flex>
      <PreviewStatusStrip labels={labels} status={chrome.status} />
      <ConsoleCommandPalette open={palette} onOpenChange={setPalette} commands={commands} />
      <ConsoleShortcutList open={shortcuts} onOpenChange={setShortcuts} shortcuts={shortcutRows} />
    </Flex>
  );
}

/** The two characters an avatar shows: a Korean name's given name, otherwise the first two letters. */
function initialsOf(name: string): string {
  const trimmed = name.trim();
  if (/^[가-힣]{3,}$/.test(trimmed)) return trimmed.slice(1, 3);
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

function PreviewTopBar({
  chrome,
  area,
  onArea,
  onSearch,
  bell,
  onBell,
  onHelp,
  helpOpen,
}: {
  readonly chrome: ConsolePreviewChrome;
  readonly area: string;
  readonly onArea: (area: string) => void;
  readonly onSearch: () => void;
  readonly bell: boolean;
  readonly onBell: (open: boolean) => void;
  readonly onHelp: () => void;
  readonly helpOpen: boolean;
}) {
  const { labels } = chrome;
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/chrome`);
  const { displayName, roleName, sites, site, selectSite } = useConsole();
  return (
    // The bar's height, rule and inset, as the console's own top bar writes them.
    <Stack gap="none" shrink={false} {...partAttributes(previewTopBarStyle, {})}>
      <Flex align="center" gap="sm" {...partAttributes(previewTopBarRowStyle, {})}>
        <Flex align="center" gap="md" flex minSize wrap {...partAttributes(previewTopBarLeadStyle, {})}>
          <Flex align="center" gap="xs" shrink={false} {...partAttributes(previewBrandStyle, {})}>
            {chrome.mark}
            <Heading level={6} {...partAttributes(previewTitleStyle, {})}>
              {chrome.title}
            </Heading>
          </Flex>
          <ConsoleAreaSwitch areas={chrome.areas} current={area} onSelect={onArea} />
        </Flex>
        <Flex align="center" gap="xs" shrink={false} {...partAttributes(previewToolsStyle, {})}>
          <ConsoleBarSearch onOpen={onSearch} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" dropdown {...partAttributes(previewSiteStyle, {})}>
                <MapPinIcon size={14} />
                <EllipsisText maxWidth="md">{site?.siteName ?? labels.noSite}</EllipsisText>
              </Button>
            </DropdownMenuTrigger>
            {/* `DropdownMenuContent` publishes a floor and no width. */}
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{labels.site}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sites.map((candidate) => (
                <DropdownMenuItem key={candidate.siteId} onSelect={() => selectSite(candidate.siteId)}>
                  <EllipsisText>{candidate.siteName}</EllipsisText>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <NotificationsButton
            label={labels.notifications}
            empty={labels.noNotifications}
            count={chrome.notificationCount ?? 0}
            open={bell}
            onOpenChange={onBell}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onHelp}
            aria-label={t("help")}
            aria-pressed={helpOpen}
            title={t("help")}
            {...partAttributes(previewToolStyle, {})}
          >
            <CircleHelpIcon />
          </Button>
          <span className="contents" {...partAttributes(previewSettingsStyle, {})}>
            {chrome.settings}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" {...partAttributes(previewAccountStyle, {})}>
                <span aria-hidden className="inline-grid shrink-0 place-items-center" {...slotAttributes(previewAvatarStyle, {})}>
                  {initialsOf(displayName)}
                </span>
                <EllipsisText maxWidth="sm" {...partAttributes(previewAccountNameStyle, {})}>
                  {displayName}
                </EllipsisText>
                <ChevronDownIcon aria-hidden className="size-3.5" {...slotAttributes(previewAccountCaretStyle, {})} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <Stack gap="none">
                  <span>{displayName}</span>
                  <Text size="caption" tone="muted">
                    {roleName}
                  </Text>
                </Stack>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>{labels.account}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>{labels.signOut}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Flex>
      </Flex>
    </Stack>
  );
}

/** The bell and its count, opening a list that says nothing is waiting: the preview holds no notifications. */
function NotificationsButton({
  label,
  empty,
  count,
  open,
  onOpenChange,
}: {
  readonly label: string;
  readonly empty: string;
  readonly count: number;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <span>
          <CountedIconButton count={count} label={label} onClick={() => onOpenChange(!open)}>
            <BellIcon />
          </CountedIconButton>
        </span>
      </PopoverTrigger>
      <ConsoleMenuFlyout title={label}>
        <Text size="caption" tone="muted" {...partAttributes(previewFlyoutTitleStyle, {})}>
          {empty}
        </Text>
      </ConsoleMenuFlyout>
    </Popover>
  );
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

function PreviewStatusStrip({
  labels,
  status,
}: {
  readonly labels: ConsolePreviewChromeLabels;
  readonly status: ConsolePreviewStatus | undefined;
}) {
  const { site, siteTimeZone } = useConsole();
  const zone = site && siteTimeZone ? labels.siteClock(zoneLabel(siteTimeZone, new Date())) : labels.noSite;
  const clock = useTickingClock(status?.clockStart);
  const ticker = status?.ticker;
  const live = Boolean(ticker?.live);
  const segments: ConsolePreviewStatusSegment[] = [
    { label: status?.shift ? `${zone} · ${status.shift}` : zone },
    ...(status?.segments ?? []),
  ];
  return (
    // The strip's height, rule, chrome tint and inset, as the console's own strip writes them.
    <Flex
      align="center"
      gap="md"
      shrink={false}
      className="h-7 overflow-hidden whitespace-nowrap"
      aria-label={labels.status}
      {...partAttributes(previewStatusStyle, {})}
    >
      <span className="flex min-w-0 flex-1 items-center" {...slotAttributes(previewTickerStyle, { live })}>
        {live && (
          <span aria-hidden className="relative shrink-0" {...slotAttributes(previewLiveDotStyle, {})}>
            <span className="absolute" {...slotAttributes(previewLivePulseStyle, {})} />
          </span>
        )}
        <span className="truncate">{ticker?.text ?? labels.quiet}</span>
      </span>
      <span className="flex shrink-0 items-center">
        {segments.map((segment, index) => (
          <span key={segment.label} className="flex items-center">
            {index > 0 && <span aria-hidden className="inline-block" {...slotAttributes(previewSegmentRuleStyle, {})} />}
            <span {...slotAttributes(previewSegmentStyle, { tone: segment.tone ?? "plain" })}>{segment.label}</span>
          </span>
        ))}
        {clock && (
          <span className="flex items-center" {...slotAttributes(previewClockStyle, {})}>
            <ClockIcon aria-hidden size={12} />
            <time>{clock}</time>
          </span>
        )}
      </span>
    </Flex>
  );
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
  const [open, setOpen] = useState(single || group.entries.some((entry) => holds(entry, current)));
  return (
    <Stack gap="xs">
      {single ? null : (
        <ConsoleMenuBranchRow weight="cluster" icon={group.icon} label={group.label} open={open} onToggle={() => setOpen(!open)} />
      )}
      {(single || open) && (
        <ConsoleMenuBranch ruled={!single}>
          {group.entries.map((entry) => (
            <EntryRow key={entry.key} entry={entry} current={current} />
          ))}
        </ConsoleMenuBranch>
      )}
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
  const [open, setOpen] = useState(() => holds(entry, current));
  if (entry.children) {
    return (
      <Stack gap="xs">
        <ConsoleMenuBranchRow icon={entry.icon} label={entry.label} open={open} onToggle={() => setOpen(!open)} />
        {open && (
          <ConsoleMenuBranch ruled>
            {entry.children.map((child) => (
              <EntryRow key={child.key} entry={child} current={current} />
            ))}
          </ConsoleMenuBranch>
        )}
      </Stack>
    );
  }
  if (!entry.href) return <ConsoleMenuInactiveRow icon={entry.icon} label={entry.label} />;
  return <ConsoleMenuLinkRow href={entry.href} current={entry.key === current} icon={entry.icon} label={entry.label} />;
}
