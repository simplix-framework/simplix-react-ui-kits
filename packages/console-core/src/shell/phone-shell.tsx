import { ArrowLeftIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Button,
  Flex,
  Icon,
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
import {
  phoneActionBarStyle,
  phoneBarStyle,
  phoneEmptyStyle,
  phoneRowButtonStyle,
  phoneScreenBodyStyle,
  phoneStripStyle,
  phoneTabBadgeStyle,
  phoneTabLabelStyle,
  phoneTabStyle,
  phoneTabbarStyle,
} from "./phone-shell.style";
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
  /** How many are waiting behind it, drawn as a count on the glyph. */
  readonly badge?: number;
}

interface ConsolePhoneShellProps {
  /** What the bar at the top says this screen is — the page header's own title. */
  readonly title: ReactNode;
  /** Whether there is somewhere to go back to. */
  readonly back?: boolean;
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
  back = false,
  tabs,
  activeTab,
  children,
}: ConsolePhoneShellProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/chrome");
  const router = useRouter();

  return (
    // Exactly the viewport tall, with the screen taking what the two bars leave. `dvh` rather
    // than `vh` because a phone browser's own bars come and go, and a shell measured against the
    // taller of the two puts its bottom row under them — which `ConsoleWindow` says once for
    // every shell rather than once per shell.
    <ConsoleWindow>
      <Flex
        align="center"
        gap="xs"
        shrink={false}
        role="banner"
        {...partAttributes(phoneBarStyle, {})}
      >
        {back && (
          <Button
            type="button"
            variant="outline"
            className={TOUCH_TARGET}
            aria-label={t("phone.back")}
            onClick={() => router.history.back()}
          >
            <ArrowLeftIcon className="size-5" aria-hidden />
          </Button>
        )}
        {/* One line, cut with an ellipsis rather than wrapped: a title that wraps at a phone's
            width pushes the screen down by as many lines as it takes, and 「알림 센터」 came out
            four lines tall at one character each. */}
        <Text size="lg" weight="semibold" className="min-w-0 flex-1 truncate">
          {title}
        </Text>
      </Flex>

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
