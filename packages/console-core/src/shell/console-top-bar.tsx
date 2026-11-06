import { BellIcon, ChevronDownIcon, CircleHelpIcon, ClockIcon, MapPinIcon } from "lucide-react";
import type { ReactNode } from "react";
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
  MenuLink,
  Popover,
  PopoverTrigger,
  Stack,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";
import { InitialsAvatar } from "../identity/initials-avatar";
import { EllipsisText } from "../layout";
import { UNBUILT, type ActionOrUnbuilt } from "../notice";
import { ConsoleAreaSwitch, type ConsoleArea } from "./area-switch";
import { ConsoleBarSearch } from "./command-palette";
import { CountedIconButton } from "./counted-icon-button";
import { PACKAGE_NAMESPACE } from "./locales";
import { ConsoleMenuFlyout } from "./menu-tree";
import {
  previewAccountCaretStyle,
  previewAccountNameStyle,
  previewAccountStyle,
  previewBadgeStyle,
  previewBrandLinkStyle,
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
  previewUnbuiltStyle,
} from "./preview-chrome.style";

/** The region picker: which region the console is reading, and the ones it may switch to. */
export interface ConsoleTopBarRegion {
  /** What the picker is, over its list. */
  readonly label: string;
  /** The region in force, or absent when none is. */
  readonly current?: string;
  /** What the picker says when no region is in force. */
  readonly empty: string;
  readonly items: readonly { readonly key: string; readonly label: string }[];
  /** Picks a region, or {@link UNBUILT} where the console has no regions behind the picker. */
  readonly onSelect: ((key: string) => void) | typeof UNBUILT;
}

/** The bell: how many notifications wait, and the list it opens. */
export interface ConsoleTopBarNotifications {
  readonly label: string;
  /** What the list says when nothing is waiting. */
  readonly empty: string;
  readonly count?: number;
  readonly open?: boolean;
  /** Opens and closes the list, or {@link UNBUILT} where nothing sends notifications yet. */
  readonly onOpenChange: ((open: boolean) => void) | typeof UNBUILT;
}

/** The signed-in person and what their menu holds. */
export interface ConsoleTopBarAccount {
  readonly name: string;
  /** The account's id, which seeds the avatar's tone so the reader has the colour every screen gives them. */
  readonly id?: string;
  /** The role, under the name in the menu. */
  readonly role?: ReactNode;
  /** The menu's rows, as `DropdownMenuItem`s, under the name. */
  readonly menu: ReactNode;
}

/** Props for {@link ConsoleTopBar}. */
export interface ConsoleTopBarProps {
  /** The product mark, before the title. */
  readonly mark?: ReactNode;
  /** The console's name beside the mark. */
  readonly title: ReactNode;
  /** A short tag after the title saying who the console is for, such as a staff marker. */
  readonly badge?: ReactNode;
  /**
   * Where pressing the brand leads (the console's first screen) and what that link is called for a
   * screen reader. Absent, the brand is drawn and does nothing.
   */
  readonly home?: { readonly href: string; readonly label: string };
  readonly areas: readonly ConsoleArea[];
  readonly area: string;
  readonly onArea: (area: string) => void;
  /** Opens the search, or {@link UNBUILT}. */
  readonly onSearch: ActionOrUnbuilt;
  readonly region: ConsoleTopBarRegion;
  readonly notifications: ConsoleTopBarNotifications;
  /** Opens the help, or {@link UNBUILT}. */
  readonly onHelp: ActionOrUnbuilt;
  /** Whether the help is open, for the button's pressed state. */
  readonly helpOpen?: boolean;
  /** The language and light or dark controls, owned by whoever keeps those settings. */
  readonly settings?: ReactNode;
  readonly account: ConsoleTopBarAccount;
  /**
   * Why an {@link UNBUILT} control does nothing, in the product's words. Absent, the kit's own
   * "not built yet" sentence.
   */
  readonly unbuiltReason?: string;
}

/**
 * A control drawn as it will look, pressed by nobody: disabled, with the reason on hover and focus,
 * and the clock mark the menu's unbuilt rows carry.
 */
function Unbuilt({ reason, children }: { readonly reason: string; readonly children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* A disabled button takes no pointer, so the wrapper carries the hover and the focus. */}
        <span tabIndex={0} aria-description={reason} {...slotAttributes(previewUnbuiltStyle, {})}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}

/**
 * The console's top bar: the brand and the area tabs on the left; the search, the region, the bell,
 * the help, the reader's settings and the account on the right.
 *
 * <p>Every control is drawn whether or not something stands behind it, so the bar reads the same
 * in every build; one handed {@link UNBUILT} is drawn inactive and says why. The bar holds no
 * product names: the product passes its brand, its words and its menu.
 */
export function ConsoleTopBar({
  mark,
  title,
  badge,
  home,
  areas,
  area,
  onArea,
  onSearch,
  region,
  notifications,
  onHelp,
  helpOpen,
  settings,
  account,
  unbuiltReason,
}: ConsoleTopBarProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/chrome`);
  const { t: common } = useTranslation("common");
  const reason = unbuiltReason ?? common("shell.nav.notBuilt");

  const search =
    onSearch === UNBUILT ? (
      <Unbuilt reason={reason}>
        {/* `inert`: the drawn search is a picture of the control, so it takes neither the pointer
            nor the focus; the wrapper carries both, with the reason. */}
        <span className="pointer-events-none" aria-hidden inert>
          <ConsoleBarSearch onOpen={() => undefined} />
        </span>
      </Unbuilt>
    ) : (
      <ConsoleBarSearch onOpen={onSearch} />
    );

  const regionButton = (
    <Button
      variant="outline"
      size="sm"
      dropdown
      disabled={region.onSelect === UNBUILT}
      {...partAttributes(previewSiteStyle, {})}
    >
      <MapPinIcon size={14} />
      <EllipsisText maxWidth="md">{region.current ?? region.empty}</EllipsisText>
    </Button>
  );
  const regionPicker =
    region.onSelect === UNBUILT ? (
      <Unbuilt reason={reason}>{regionButton}</Unbuilt>
    ) : (
      <RegionMenu region={region} onSelect={region.onSelect}>
        {regionButton}
      </RegionMenu>
    );

  const bell =
    notifications.onOpenChange === UNBUILT ? (
      <Unbuilt reason={reason}>
        <Button variant="ghost" size="icon-sm" disabled aria-label={notifications.label} {...partAttributes(previewToolStyle, {})}>
          <BellIcon />
        </Button>
      </Unbuilt>
    ) : (
      <NotificationsButton notifications={notifications} onOpenChange={notifications.onOpenChange} />
    );

  const help =
    onHelp === UNBUILT ? (
      <Unbuilt reason={reason}>
        <Button variant="ghost" size="icon-sm" disabled aria-label={t("help")} {...partAttributes(previewToolStyle, {})}>
          <CircleHelpIcon />
        </Button>
      </Unbuilt>
    ) : (
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
    );

  return (
    // The bar's height, rule and inset, as the console's own top bar writes them.
    <Stack gap="none" shrink={false} {...partAttributes(previewTopBarStyle, {})}>
      <Flex align="center" gap="sm" {...partAttributes(previewTopBarRowStyle, {})}>
        <Flex align="center" gap="md" flex minSize wrap {...partAttributes(previewTopBarLeadStyle, {})}>
          {(() => {
            const brand = (
              <Flex align="center" gap="xs" shrink={false} {...partAttributes(previewBrandStyle, {})}>
                {mark}
                <Heading level={6} {...partAttributes(previewTitleStyle, {})}>
                  {title}
                </Heading>
                {badge && <span {...slotAttributes(previewBadgeStyle, {})}>{badge}</span>}
              </Flex>
            );
            return home ? (
              <MenuLink href={home.href} attributes={{ ...slotAttributes(previewBrandLinkStyle, {}), "aria-label": home.label }}>
                {brand}
              </MenuLink>
            ) : (
              brand
            );
          })()}
          <ConsoleAreaSwitch areas={areas} current={area} onSelect={onArea} />
        </Flex>
        <Flex align="center" gap="xs" shrink={false} {...partAttributes(previewToolsStyle, {})}>
          {search}
          {regionPicker}
          {bell}
          {help}
          {settings && (
            <span className="contents" {...partAttributes(previewSettingsStyle, {})}>
              {settings}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" {...partAttributes(previewAccountStyle, {})}>
                <InitialsAvatar name={account.name} seed={account.id ?? account.name} />
                <EllipsisText maxWidth="sm" {...partAttributes(previewAccountNameStyle, {})}>
                  {account.name}
                </EllipsisText>
                <ChevronDownIcon aria-hidden className="size-3.5" {...slotAttributes(previewAccountCaretStyle, {})} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <Stack gap="none">
                  <span>{account.name}</span>
                  {account.role && (
                    <Text size="caption" tone="muted">
                      {account.role}
                    </Text>
                  )}
                </Stack>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {account.menu}
            </DropdownMenuContent>
          </DropdownMenu>
        </Flex>
      </Flex>
    </Stack>
  );
}

function RegionMenu({
  region,
  onSelect,
  children,
}: {
  readonly region: ConsoleTopBarRegion;
  readonly onSelect: (key: string) => void;
  readonly children: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      {/* `DropdownMenuContent` publishes a floor and no width. */}
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{region.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {region.items.map((item) => (
          <DropdownMenuItem key={item.key} onSelect={() => onSelect(item.key)}>
            <EllipsisText>{item.label}</EllipsisText>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The bell and its count, opening the list of what is waiting. */
function NotificationsButton({
  notifications,
  onOpenChange,
}: {
  readonly notifications: ConsoleTopBarNotifications;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const open = notifications.open ?? false;
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <span>
          <CountedIconButton count={notifications.count ?? 0} label={notifications.label} onClick={() => onOpenChange(!open)}>
            <BellIcon />
          </CountedIconButton>
        </span>
      </PopoverTrigger>
      <ConsoleMenuFlyout title={notifications.label}>
        <Text size="caption" tone="muted" {...partAttributes(previewFlyoutTitleStyle, {})}>
          {notifications.empty}
        </Text>
      </ConsoleMenuFlyout>
    </Popover>
  );
}

/** One reading on the right of the status strip. */
export interface ConsoleStatusSegment {
  readonly label: string;
  /** `warn` when the reading is something somebody has to act on. */
  readonly tone?: "plain" | "warn";
}

/** Props for {@link ConsoleStatusStrip}. */
export interface ConsoleStatusStripProps {
  /** The strip's accessible name. */
  readonly label: string;
  /** What is happening now, on the left. */
  readonly ticker: { readonly text: string; readonly live?: boolean };
  /** Readings on the right, in order. */
  readonly segments?: readonly ConsoleStatusSegment[];
  /** The wall clock at the right end, as the product formats it. Absent, no clock is drawn. */
  readonly clock?: string;
}

/**
 * The strip along the window's foot: what is happening now on the left, the readings and the clock
 * on the right. A product with nothing to report yet passes the sentence saying so as the ticker
 * and no readings, rather than readings it does not have.
 */
export function ConsoleStatusStrip({ label, ticker, segments = [], clock }: ConsoleStatusStripProps) {
  const live = Boolean(ticker.live);
  return (
    // The strip's height, rule, chrome tint and inset, as the console's own strip writes them.
    <Flex
      align="center"
      gap="md"
      shrink={false}
      className="h-7 overflow-hidden whitespace-nowrap"
      aria-label={label}
      {...partAttributes(previewStatusStyle, {})}
    >
      <span className="flex min-w-0 flex-1 items-center" {...slotAttributes(previewTickerStyle, { live })}>
        {live && (
          <span aria-hidden className="relative shrink-0" {...slotAttributes(previewLiveDotStyle, {})}>
            <span className="absolute" {...slotAttributes(previewLivePulseStyle, {})} />
          </span>
        )}
        <span className="truncate">{ticker.text}</span>
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
