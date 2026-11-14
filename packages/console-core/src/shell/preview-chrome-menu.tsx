import { useState, type ReactNode } from "react";
import { Popover, PopoverTrigger, Stack, Tooltip, TooltipContent, TooltipTrigger } from "@simplix-react/ui";

import {
  ConsoleMenuBranch,
  ConsoleMenuBranchRow,
  ConsoleMenuFlyout,
  ConsoleMenuInactiveRow,
  ConsoleMenuLinkRow,
  ConsoleMenuRailButton,
  ConsoleMenuFold,
} from "./menu-tree";
import { ConsolePhoneMenuSheet, ConsolePhoneMenuSection } from "./phone-shell";
import type { ConsolePreviewChrome } from "./preview-chrome";
import type { ConsolePreviewMenuEntry, ConsolePreviewMenuGroup } from "./preview-chrome-types";

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
export function destinationsOf(chrome: ConsolePreviewChrome): Destination[] {
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

/** The preview's phone menu reuses its declared desktop destinations and navigation port. */
export function ConsolePreviewPhoneMenu({ chrome, open, onOpenChange }: {
  readonly chrome: ConsolePreviewChrome;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  return (
    <ConsolePhoneMenuSheet open={open} onOpenChange={onOpenChange} title={chrome.title} description={chrome.labels.menu} footer={chrome.settings}>
      <Stack gap="md" onClickCapture={(event) => {
        const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
        if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const href = link.getAttribute("href");
        if (!href) return;
        event.preventDefault();
        onOpenChange(false);
        if (chrome.navigate) chrome.navigate(href);
        else window.location.assign(href);
      }}>
        {chrome.areas.map((area) => {
          const menu = chrome.menuFor(area.key);
          if (!menu.groups.length) return area.href ? (
            <ConsolePhoneMenuSection key={area.key}>
              <ConsoleMenuLinkRow href={area.href} label={area.label} current={area.key === chrome.area} />
            </ConsolePhoneMenuSection>
          ) : null;
          return <ConsolePhoneMenuSection key={area.key} title={area.label}>
            {menu.groups.map((group) => (
              <ConsolePhoneMenuSection key={group.key} title={menu.groups.length === 1 && group.label === area.label ? undefined : group.label}>
                {group.entries.map((entry) => <EntryRow key={entry.key} entry={entry} current={chrome.current} />)}
              </ConsolePhoneMenuSection>
            ))}
          </ConsolePhoneMenuSection>
        })}
      </Stack>
    </ConsolePhoneMenuSheet>
  );
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

export function MenuGroup({
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

/** One destination as a mark of its own on the rail: pressing it opens it, and one with no screen is drawn inactive. */
export function RailEntry({ entry, current, onOpen }: { readonly entry: ConsolePreviewMenuEntry; readonly current: string | undefined; readonly onOpen: (href: string) => void }) {
  const href = entry.href;
  return (
    <ConsoleMenuRailButton
      active={holds(entry, current)}
      label={textOf(entry.label)}
      disabled={href === undefined}
      aria-description={entry.inactiveReason}
      onClick={href ? () => onOpen(href) : undefined}
    >
      {entry.icon}
    </ConsoleMenuRailButton>
  );
}

export function RailGroup({ group, current }: { readonly group: ConsolePreviewMenuGroup; readonly current: string | undefined }) {
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
