import { ArrowLeftIcon, SearchIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Button,
  Flex,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Icon,
  MenuLink,
  Heading,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
  useMediaQuery,
  type ButtonProps,
  type IconName,
  Stack,
} from "@simplix-react/ui";

import { PHONE_WINDOW } from "../layout/window-size";
import { ConsoleWindow } from "./console-window";
import { PACKAGE_NAMESPACE } from "./locales";
import { previewBrandLinkStyle } from "./preview-chrome.style";
import {
  phoneActionBarStyle,
  phoneBarStyle,
  phoneBarTitleStyle,
  phoneEmptyStyle,
  phoneRowButtonStyle,
  phoneScreenBodyStyle,
  phoneStripStyle,
  phoneTabBadgeStyle,
  phoneTabLabelStyle,
  phoneTabStyle,
  phoneTabbarStyle, phoneMenuSheetStyle } from "./phone-shell.style";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

/**
 * How tall and wide anything a thumb has to hit is drawn.
 *
 * <p>44px, which is what a finger covers. A control smaller than this is reachable with a mouse
 * and missed with a hand, and a screen built for a phone that keeps desktop hit areas reads as
 * working right up to the moment somebody uses it.
 */
export const TOUCH_TARGET = "min-h-11 min-w-11";

/** Whether the window this is rendering into belongs to a phone. */
export function useConsoleOnAPhone(): boolean {
  return useMediaQuery(PHONE_WINDOW);
}

/** One entry of the bar along the bottom. */
export interface ConsolePhoneTab {
  /** What decides which entry is the one being looked at. */
  readonly key: string;
  /** What it is called, in the reader's language. */
  readonly label: string;
  /** The glyph above the label, which is what a thumb aims at. */
  readonly icon: IconName;
  /**
   * Where it goes, or absent where the screen behind it is not built.
   *
   * <p>An entry without a destination is drawn and does not respond, for the reason
   * {@link UnbuiltAction} gives: an entry that vanishes teaches that the console cannot do the
   * thing, and one that is there and inactive teaches that it cannot do it yet.
   */
  readonly to?: string;
  /**
   * A plain address to leave for, where no router is mounted (a preview). Used when `to` is
   * absent; an entry with neither is drawn inactive.
   */
  readonly href?: string;
  /** How many are waiting behind it, drawn as a count on the glyph. */
  readonly badge?: number;
  /**
   * What pressing it does, for an entry that opens something over the screen rather than leaving
   * for another one - the full menu, which a bar of four or five entries cannot hold.
   *
   * <p>Taken in place of {@link to}: an entry is either a destination or a control, and one that
   * is both answers a press twice.
   */
  readonly onPress?: () => void;
}

/** Props for {@link ConsolePhoneBar}. */
export interface ConsolePhoneBarProps {
  /** What the bar says this screen is, or absent where the bar carries the brand alone. */
  readonly title?: ReactNode;
  /** The product's mark and name, drawn at the head of the bar on every screen. */
  readonly brand?: ReactNode;
  /** Where pressing the brand leads and what that link is called for a screen reader; absent, the brand does nothing. */
  readonly home?: { readonly href: string; readonly label: string };
  /** Whether there is somewhere to go back to. */
  readonly back?: boolean;
  /** Controls at the end of the bar, each a touch target of its own. */
  readonly actions?: ReactNode;
}

/**
 * The bar along the top of a phone screen: back, the brand, the page title and the controls at the
 * end, in one row a thumb's height.
 *
 * <p>Here rather than inside {@link ConsolePhoneShell} because a window with no area tabs, the top
 * bar window of an app for the people a product serves, draws the same bar with a menu button at
 * its end. Written twice the two would stop agreeing on the first change to either.
 */
export function ConsolePhoneBar({ title, brand, home, back = false, actions }: ConsolePhoneBarProps) {
  return (
    <Flex
      align="center"
      gap="xs"
      shrink={false}
      role="banner"
      className={TOUCH_TARGET}
      {...partAttributes(phoneBarStyle, {})}
    >
      {back && <PhoneBackButton />}
      {/* One line, cut with an ellipsis rather than wrapped: a title that wraps at a phone's
          width pushes the screen down by as many lines as it takes, and 「알림 센터」 came out
          four lines tall at one character each. */}
      {brand != null && (
        <>
          {home ? (
            <MenuLink href={home.href} className={TOUCH_TARGET} attributes={{ ...slotAttributes(previewBrandLinkStyle, {}), "aria-label": home.label }}>
              <Flex align="center" shrink={false}>
                {brand}
              </Flex>
            </MenuLink>
          ) : (
            <Flex align="center" shrink={false}>
              {brand}
            </Flex>
          )}
          {title != null && <Separator orientation="vertical" className="h-5" />}
        </>
      )}
      {/* The page header draws no title on a phone, so this is the screen's one level-one heading. A bar with no title
          draws a plain filler that keeps the controls at the end. */}
      {title != null ? (
        <Heading as="h1" level={brand != null ? 6 : 5} className="min-w-0 flex-1 truncate" {...partAttributes(phoneBarTitleStyle, {})}>
          {title}
        </Heading>
      ) : (
        <Text size={brand != null ? undefined : "lg"} weight="semibold" className="min-w-0 flex-1 truncate" />
      )}
      {actions}
    </Flex>
  );
}

/** The arrow at the head of the phone bar, which steps back through the history the router keeps. */
function PhoneBackButton() {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/chrome");
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="outline"
      className={TOUCH_TARGET}
      aria-label={t("phone.back")}
      onClick={() => router.history.back()}
    >
      <ArrowLeftIcon className="size-5" aria-hidden />
    </Button>
  );
}

/** Props for {@link ConsolePhoneShell}. */
export interface ConsolePhoneShellProps {
  /** What the bar at the top says this screen is — the page header's own title. */
  readonly title: ReactNode;
  /**
   * The product's mark and name, drawn at the head of the bar on every screen.
   *
   * <p>The product supplies it: a phone shows one screen at a time and no menu column, so without
   * it nothing on the screen says which console this is. The page title keeps the rest of the row
   * and is cut with an ellipsis rather than pushing the mark off.
   */
  readonly brand?: ReactNode;
  /** Where pressing the brand leads and what that link is called for a screen reader; absent, the brand does nothing. */
  readonly home?: { readonly href: string; readonly label: string };
  /** Whether there is somewhere to go back to. */
  readonly back?: boolean;
  /**
   * Controls at the end of the bar, drawn on every screen: the console's search, which a phone has
   * no top bar for. Each is a touch target of its own.
   */
  readonly actions?: ReactNode;
  /** The entries along the bottom. */
  readonly tabs: readonly ConsolePhoneTab[];
  /** Which of them this screen belongs to. */
  readonly activeTab: string;
  /** The screen. */
  readonly children: ReactNode;
}

/**
 * The console on a phone — one screen at a time, the areas along the bottom.
 *
 * <p><b>The same console, not a different product.</b> What the phone drops is the chrome that
 * only a wide window can carry: the area row, the menu column beside it, and the strip along the
 * bottom that says what keeps running. What it keeps is every screen, reached one at a time
 * through the four entries the console's own areas come down to.
 *
 * <p><b>Everything a thumb touches is at least 44px.</b> Left at the desktop's sizes the row
 * actions come out under 30px, which is a control a mouse hits and a hand misses — and a screen
 * that reads as working until somebody actually uses it is the worst kind of wrong.
 */
export function ConsolePhoneShell({
  title,
  brand,
  home,
  back = false,
  actions,
  tabs,
  activeTab,
  children,
}: ConsolePhoneShellProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/chrome");

  return (
    // Exactly the viewport tall, with the screen taking what the two bars leave. `dvh` rather
    // than `vh` because a phone browser's own bars come and go, and a shell measured against the
    // taller of the two puts its bottom row under them — which `ConsoleWindow` says once for
    // every shell rather than once per shell.
    <ConsoleWindow>
      <ConsolePhoneBar title={title} brand={brand} home={home} back={back} actions={actions} />

      {/* The screen, with its own footer inside it — a committing action belongs at the near end
          of the reach rather than in the bar at the top, and which action that is only the screen
          knows. */}
      {/* raw layout: a box that takes what the two bars leave and scrolls its own overflow, which
          is not a way of laying children out */}
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>

      <nav
        className="flex shrink-0"
        aria-label={t("phone.areas")}
        {...slotAttributes(phoneTabbarStyle, {})}
      >
        {tabs.map((tab) => (
          <PhoneTab key={tab.key} tab={tab} active={tab.key === activeTab} />
        ))}
      </nav>
    </ConsoleWindow>
  );
}

/** One entry, as a link where it has somewhere to go and as an inactive control where it has not. */
function PhoneTab({ tab, active }: { readonly tab: ConsolePhoneTab; readonly active: boolean }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/chrome");
  const body = (
    <>
      <span className="relative">
        <Icon name={tab.icon} className="size-5" aria-hidden />
        {tab.badge !== undefined && tab.badge > 0 && (
          <span
            className="absolute -right-2 -top-1 min-w-4"
            {...slotAttributes(phoneTabBadgeStyle, {})}
          >
            {tab.badge}
          </span>
        )}
      </span>
      <span {...slotAttributes(phoneTabLabelStyle, {})}>{tab.label}</span>
    </>
  );
  const shape = cn("flex flex-1 flex-col items-center justify-center", TOUCH_TARGET);

  if (tab.onPress) {
    return (
      <button
        type="button"
        onClick={tab.onPress}
        aria-haspopup="dialog"
        aria-expanded={active}
        className={shape}
        {...slotAttributes(phoneTabStyle, { active, unbuilt: false })}
      >
        {body}
      </button>
    );
  }

  if (!tab.to && tab.href) {
    return (
      <a
        href={tab.href}
        aria-current={active ? "page" : undefined}
        className={shape}
        {...slotAttributes(phoneTabStyle, { active, unbuilt: false })}
      >
        {body}
      </a>
    );
  }

  if (!tab.to) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {/* A button rather than a span, so the reason reaches a reader who is not using a
              pointer: a tooltip on something unfocusable is invisible to the keyboard and to a
              screen reader alike. */}
          <button
            type="button"
            disabled
            className={shape}
            {...slotAttributes(phoneTabStyle, { active, unbuilt: true })}
          >
            {body}
          </button>
        </TooltipTrigger>
        <TooltipContent>{t("phone.unbuilt")}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      to={tab.to}
      className={shape}
      aria-current={active ? "page" : undefined}
      {...slotAttributes(phoneTabStyle, { active })}
    >
      {body}
    </Link>
  );
}

/**
 * The column one phone screen fills, between the shell's two bars.
 *
 * <p>Here rather than written into each screen: what a screen wants is 「take the room the chrome
 * leaves」, and a screen writing that as a class answers to the stylesheet rather than to the
 * design system — and the next phone screen writes it again, slightly differently.
 */
export function PhoneScreenColumn({ children }: { readonly children: ReactNode }) {
  return (
    <Flex direction="column" gap="none" className="h-full min-h-0">
      {children}
    </Flex>
  );
}

/**
 * The scrolling middle of a phone screen — what is left once the screen's own strips are drawn.
 */
export function PhoneScrollArea({ children }: { readonly children: ReactNode }) {
  // raw layout: a box that takes what is left and scrolls its own overflow, which is not a way of
  // laying children out
  return <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>;
}

/**
 * A strip that scrolls sideways inside its own box — a chip row wider than a phone.
 *
 * <p>Sideways rather than wrapped: a second row of chips pushes the list down by that much on the
 * screen with the least room, and the reader loses the first row of what they came for.
 */
export function PhoneStripScroller({ children }: { readonly children: ReactNode }) {
  // raw layout: the one region allowed to scroll sideways, which no primitive expresses
  return (
    <div className="overflow-x-auto" {...slotAttributes(phoneStripStyle, {})}>
      {children}
    </div>
  );
}

/**
 * The screen's own action, at the near end of the reach.
 *
 * <p>Under the list rather than in the bar at the top: the top of a phone is the far end of the
 * reach, and this is the last thing a reader does on the screen.
 */
export function PhoneActionBar({ children }: { readonly children: ReactNode }) {
  return (
    <Flex justify="end" shrink={false} {...partAttributes(phoneActionBarStyle, {})}>
      {children}
    </Flex>
  );
}

/**
 * A phone screen's own padded body — the gutter between the chrome and the content.
 *
 * <p>One step, written once. Each screen choosing its own leaves the chrome's edge a different
 * distance from the first character on every screen, and a reader moving between them reads that
 * as the screens being differently built.
 */
export function PhoneScreenBody({ children }: { readonly children: ReactNode }) {
  return (
    <Stack gap="sm" {...partAttributes(phoneScreenBodyStyle, {})}>
      {children}
    </Stack>
  );
}

/** What a phone screen says when it has nothing to list. */
export function PhoneEmptyState({
  title,
  body,
}: {
  readonly title: ReactNode;
  readonly body?: ReactNode;
}) {
  return (
    <Stack gap="xs" {...partAttributes(phoneEmptyStyle, {})}>
      <Text weight="medium">{title}</Text>
      {body && (
        <Text size="caption" tone="muted">
          {body}
        </Text>
      )}
    </Stack>
  );
}

/**
 * A control a thumb has to hit, at the size a thumb needs.
 *
 * <p>The framework's sizes are a pointer's. A phone screen reaching for a class to grow one leaves
 * the next phone screen to reach for it again, and the two stop agreeing the day one of them is
 * touched.
 */
export function PhoneButton(props: ButtonProps) {
  return <Button {...props} className={cn(TOUCH_TARGET, props.className)} />;
}

/**
 * The console's search on a phone: a glyph at the end of the bar that opens the command palette,
 * as the top bar's search field does on a wide window.
 */
export function ConsolePhoneSearchButton({ onOpen }: { readonly onOpen: () => void }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/chrome");
  return (
    <PhoneButton type="button" variant="ghost" aria-label={t("palette.search")} aria-haspopup="dialog" onClick={onOpen}>
      <SearchIcon className="size-5" aria-hidden />
    </PhoneButton>
  );
}

/**
 * A whole card that is one control — how a list row is pressed on a phone.
 *
 * <p><b>The row is the target, not an action inside it.</b> A desktop row's action buttons come
 * out under 30px, which a mouse hits and a hand misses, and a phone has no room to grow them.
 *
 * <p>`accent` marks the row the reader has not dealt with: the page's own accent down its edge and
 * a card ground behind it. Left to a badge alone, a screen of rows with one ground and one weight
 * reads as a block with a word on some of them.
 */
export function PhoneRowButton({
  accent = false,
  onPress,
  children,
}: {
  readonly accent?: boolean;
  readonly onPress: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn("w-full", TOUCH_TARGET)}
      {...slotAttributes(phoneRowButtonStyle, { accent })}
    >
      {children}
    </button>
  );
}

/** Props for {@link ConsolePhoneMenuSheet}. */
export interface ConsolePhoneMenuSheetProps {
  /** Whether the sheet is showing. */
  readonly open: boolean;
  /** Opens and closes it; it closes itself when a destination in it is pressed. */
  readonly onOpenChange: (open: boolean) => void;
  /** What the sheet is the menu of - the console's own name. */
  readonly title: ReactNode;
  /** A line under the title, such as who is signed in. */
  readonly description?: ReactNode;
  /** The destinations, as {@link ConsolePhoneMenuSection}s. */
  readonly children: ReactNode;
  /**
   * The window-level controls a phone's bar has no room for: language, colour scheme, the
   * account and signing out. Drawn under the destinations, at the near end of the reach.
   */
  readonly footer?: ReactNode;
}

/**
 * Every destination of the console on a phone, over the screen, with the window-level controls
 * under them.
 *
 * <p><b>The bottom bar holds the few destinations used most and one entry that opens this.</b> A
 * console with seven clusters does not fit five tabs, and a bar that drops the rest teaches the
 * reader that the phone cannot reach them. Here every cluster is drawn open, one heading each,
 * because a fold is one more press on the width where presses cost the most.
 *
 * <p><b>It closes itself on a destination.</b> A link inside a modal changes the route under it
 * and leaves the sheet standing over the screen the reader asked for.
 *
 * <p><b>Every row is a thumb's height.</b> The menu rows are a pointer's size in the column, and
 * the same rows are reused here rather than drawn again.
 */
export function ConsolePhoneMenuSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: ConsolePhoneMenuSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[85dvh] flex-col [&_[data-slot=sheet-close]]:min-h-11 [&_[data-slot=sheet-close]]:min-w-11"
        {...partAttributes(phoneMenuSheetStyle, {})}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <Stack
          gap="md"
          flex
          minSize
          overflow="auto"
          onClickCapture={(event) => {
            const target = event.target;
            if (target instanceof Element && target.closest("a[href]")) onOpenChange(false);
          }}
        >
          {children}
          {footer && <Stack gap="xs">{footer}</Stack>}
        </Stack>
      </SheetContent>
    </Sheet>
  );
}

/** One cluster of {@link ConsolePhoneMenuSheet}: its name over its destinations. */
export function ConsolePhoneMenuSection({
  title,
  onActivate,
  children,
}: {
  readonly title?: ReactNode;
  /**
   * Called when a button or link inside the section is pressed, for a section whose rows act on
   * the screen behind the sheet and so have to close it. The sheet already closes itself on a link.
   */
  readonly onActivate?: () => void;
  readonly children: ReactNode;
}) {
  return (
    <Stack
      gap="none"
      className="[&_a]:min-h-11 [&_button]:min-h-11 [&_button]:min-w-11 [&_[aria-disabled]]:min-h-11"
      onClickCapture={
        onActivate
          ? (event) => {
              const target = event.target;
              if (target instanceof Element && target.closest("button, a[href]")) onActivate();
            }
          : undefined
      }
    >
      {title && (
        <Text size="caption" tone="muted" weight="medium">
          {title}
        </Text>
      )}
      {children}
    </Stack>
  );
}
