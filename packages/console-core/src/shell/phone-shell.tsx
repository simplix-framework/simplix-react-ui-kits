import type { ReactNode } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Button,
  Flex,
  Separator,
  Icon,
  MenuLink,
  Heading,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
  type IconName,
} from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { ConsoleWindow } from "./console-window";
import { PACKAGE_NAMESPACE } from "./locales";
import { previewBrandLinkStyle } from "./preview-chrome.style";
import { phoneBarStyle, phoneBarTitleStyle, phoneTabBadgeStyle, phoneTabLabelStyle, phoneTabStyle, phoneTabbarStyle } from "./phone-shell.style";
import { TOUCH_TARGET } from "./phone-window";

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
  /** What the bar at the top says this screen is - the page header's own title. */
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
 * The console on a phone - one screen at a time, the areas along the bottom.
 *
 * <p><b>The same console, not a different product.</b> What the phone drops is the chrome that
 * only a wide window can carry: the area row, the menu column beside it, and the strip along the
 * bottom that says what keeps running. What it keeps is every screen, reached one at a time
 * through the four entries the console's own areas come down to.
 *
 * <p><b>Everything a thumb touches is at least 44px.</b> Left at the desktop's sizes the row
 * actions come out under 30px, which is a control a mouse hits and a hand misses - and a screen
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
    // taller of the two puts its bottom row under them - which `ConsoleWindow` says once for
    // every shell rather than once per shell.
    <ConsoleWindow>
      <ConsolePhoneBar title={title} brand={brand} home={home} back={back} actions={actions} />

      {/* The screen, with its own footer inside it - a committing action belongs at the near end
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

export * from "./phone-window";
export * from "./phone-shell-parts";
export * from "./phone-menu-sheet";
