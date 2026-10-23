import { BellIcon, MapPinIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, UserIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
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
  Input,
  Popover,
  PopoverTrigger,
  Stack,
  Text,
} from "@simplix-react/ui";
import { zoneLabel } from "../datetime";
import { EllipsisText } from "../layout";
import { ConsoleAreaSwitch, type ConsoleArea } from "./area-switch";
import { useConsole } from "./console-context";
import { CountedIconButton } from "./counted-icon-button";
import {
  ConsoleMenuBranch,
  ConsoleMenuBranchRow,
  ConsoleMenuColumn,
  ConsoleMenuFlyout,
  ConsoleMenuGlyph,
  ConsoleMenuInactiveRow,
  ConsoleMenuLinkRow,
  ConsoleMenuRail,
} from "./menu-tree";
import { useSidebarCollapse } from "./sidebar-collapse";

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
}

/** Whether an entry is the current destination or holds it. */
function holds(entry: ConsolePreviewMenuEntry, current: string | undefined): boolean {
  if (current === undefined) return false;
  return entry.key === current || (entry.children ?? []).some((child) => holds(child, current));
}

/**
 * The console's three bands around a previewed screen: the area bar on top, the area's menu on the
 * left, the status strip at the foot.
 *
 * <p>For drawing a page as it sits in the running console when there is no router and no session:
 * the menu and the words come in as props, the signed-in account and the workplace come from
 * {@link useConsole}, and the column collapses to a rail exactly as the console's does.
 */
export function ConsolePreviewWindowChrome({
  chrome,
  children,
}: {
  readonly chrome: ConsolePreviewChrome;
  readonly children: ReactNode;
}) {
  const { labels } = chrome;
  const [area, setArea] = useState(chrome.area);
  useEffect(() => setArea(chrome.area), [chrome.area]);
  const { collapsed, toggle } = useSidebarCollapse(chrome.namespace);
  const menu = chrome.menuFor(area);

  return (
    <Flex direction="column" gap="none" className="h-dvh bg-background">
      <PreviewTopBar chrome={chrome} area={area} onArea={setArea} />
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
                <Button variant="ghost" size="icon-xs" onClick={toggle} aria-label={labels.collapse}>
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
      </Flex>
      <PreviewStatusStrip labels={labels} />
    </Flex>
  );
}

function PreviewTopBar({
  chrome,
  area,
  onArea,
}: {
  readonly chrome: ConsolePreviewChrome;
  readonly area: string;
  readonly onArea: (area: string) => void;
}) {
  const { labels } = chrome;
  const { displayName, roleName, sites, site, selectSite } = useConsole();
  return (
    // The bar's height, rule and inset, as the console's own top bar writes them.
    <Stack gap="none" shrink={false} className="border-b bg-background">
      <Flex align="center" gap="sm" className="min-h-12 px-3">
        <Flex align="center" gap="md" flex minSize wrap className="py-1">
          <Flex align="center" gap="xs" shrink={false}>
            {chrome.mark}
            <Heading level={6}>{chrome.title}</Heading>
          </Flex>
          <ConsoleAreaSwitch areas={chrome.areas} current={area} onSelect={onArea} />
        </Flex>
        <Flex align="center" gap="xs" shrink={false}>
          {/* `Input` publishes no size or width, so the bar's search measure is written here. */}
          <Input type="search" disabled placeholder={labels.search} aria-label={labels.search} className="h-8 w-64 max-w-[40vw]" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" dropdown>
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
          <NotificationsButton label={labels.notifications} empty={labels.noNotifications} count={0} />
          {chrome.settings}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <UserIcon size={16} />
                <EllipsisText maxWidth="sm">{displayName}</EllipsisText>
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
function NotificationsButton({ label, empty, count }: { readonly label: string; readonly empty: string; readonly count: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span>
          <CountedIconButton count={count} label={label} onClick={() => setOpen(!open)}>
            <BellIcon />
          </CountedIconButton>
        </span>
      </PopoverTrigger>
      <ConsoleMenuFlyout title={label}>
        <Text size="caption" tone="muted" className="px-2">
          {empty}
        </Text>
      </ConsoleMenuFlyout>
    </Popover>
  );
}

function PreviewStatusStrip({ labels }: { readonly labels: ConsolePreviewChromeLabels }) {
  const { site, siteTimeZone } = useConsole();
  const zone = site && siteTimeZone ? labels.siteClock(zoneLabel(siteTimeZone, new Date())) : labels.noSite;
  return (
    // The strip's height, rule, chrome tint and inset, as the console's own strip writes them.
    <Flex align="center" justify="between" gap="md" shrink={false} className="h-7 border-t bg-muted/30 px-3" aria-label={labels.status}>
      <EllipsisText size="caption" tone="muted">
        {labels.quiet}
      </EllipsisText>
      <Text as="span" size="caption" tone="muted">
        {zone}
      </Text>
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
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={active ? "secondary" : "outline"} size="icon-sm" onMouseEnter={() => setOpen(true)}>
          <ConsoleMenuGlyph>{group.icon}</ConsoleMenuGlyph>
        </Button>
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
