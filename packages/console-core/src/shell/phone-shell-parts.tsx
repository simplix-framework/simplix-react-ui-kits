import type { ReactNode } from "react";
import { SearchIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Button, Flex, Text, cn, type ButtonProps, Stack } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { PACKAGE_NAMESPACE } from "./locales";
import { phoneActionBarStyle, phoneEmptyStyle, phoneRowButtonStyle, phoneScreenBodyStyle, phoneStripStyle } from "./phone-shell.style";
import { TOUCH_TARGET } from "./phone-window";

/**
 * The column one phone screen fills, between the shell's two bars.
 *
 * <p>Here rather than written into each screen: what a screen wants is 「take the room the chrome
 * leaves」, and a screen writing that as a class answers to the stylesheet rather than to the
 * design system - and the next phone screen writes it again, slightly differently.
 */
export function PhoneScreenColumn({ children }: { readonly children: ReactNode }) {
  return (
    <Flex direction="column" gap="none" className="h-full min-h-0">
      {children}
    </Flex>
  );
}

/**
 * The scrolling middle of a phone screen - what is left once the screen's own strips are drawn.
 */
export function PhoneScrollArea({ children }: { readonly children: ReactNode }) {
  // raw layout: a box that takes what is left and scrolls its own overflow, which is not a way of
  // laying children out
  return <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>;
}

/**
 * A strip that scrolls sideways inside its own box - a chip row wider than a phone.
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
 * A phone screen's own padded body - the gutter between the chrome and the content.
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
 * A whole card that is one control - how a list row is pressed on a phone.
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
