import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { XIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import { AlertBanner, Button, Flex, Stack, Text } from "@simplix-react/ui";

import { DISMISSIBLE_NOTICE_KIND_STYLE, type DismissibleNoticeKind } from "./notice-kind";
import { useRegisterNotice } from "./notice-registry";
import { useNoticeDismissals } from "./dismissal-source";
import { explanationCardStyle, noticeCardStyle } from "./notice-card.style";
import { slotAttributes } from "@simplix-react/ui/design";

/** Props for {@link NoticeCard}. */
export interface NoticeCardProps {
  /**
   * The constant this card is known by, for as long as the card exists.
   *
   * <p>Written here at the definition site and never worked out from where the card sits: a key
   * built from a route or a position moves the moment a screen is rearranged, and every operator
   * who put the card away meets it again with no idea why.
   *
   * <p>Namespaced by the screen that owns it — `site.list.licenceCap`. Starts with a letter or a
   * digit, then letters, digits, dots, hyphens and underscores.
   */
  readonly noticeKey: string;
  /** Which of the three this is. Decides the icon, the tint, and which header control lists it. */
  readonly kind: DismissibleNoticeKind;
  /** What the card is called, on the card and again in the dropdown. */
  readonly title: string;
  /** The line under the title saying what the card settles. */
  readonly hint?: string;
  /** More than the one line, when the card genuinely holds more. */
  readonly children?: ReactNode;
  /**
   * Whatever else sits at the right of the card — a legal-source badge, a destination a later
   * chapter builds.
   *
   * <p>For anything that is not a plain button. A pressable action goes through
   * {@link NoticeCardProps.actionLabel} instead, so the header can draw it too.
   */
  readonly trailing?: ReactNode;
  /** What the card's own button says. Drawn on the card and again in the dropdown. */
  readonly actionLabel?: string;
  /**
   * What that button does — opening the card's explanation, usually.
   *
   * <p>Give it a stable identity ({@link useCallback}), because the header compares it on every
   * render to decide whether its list changed.
   */
  readonly onAction?: () => void;
}

/**
 * A standing explanation or warning on a list or a detail screen, which the reader can put away.
 *
 * <p><b>Why it can be put away at all.</b> The card is true of every row and every day, so it goes
 * on taking the same space after the reader has learned it — and what it pushes below the fold is
 * the rows they came for. Putting it away is remembered for that operator, on the server: a
 * dismissal that died with the page would bring the card back on the next navigation, which is the
 * complaint this exists to answer. The header keeps a control per kind that lists this screen's
 * cards and brings any of them back.
 *
 * <p><b>Every standing message is a card, whatever its kind and whatever its words.</b> 알림 ·
 * 경고 · 도움말 · 위험 alike, and a live count in the title changes nothing: a card saying
 * 「정책이 없는 안전구역이 1개 있습니다」 closes like every other one. Two things make that
 * safe. The dismissal is remembered per operator on the server, so it is this reader's and nobody
 * else's; and the header control for that kind is tinted and pulses while a card of its kind is
 * hidden, so putting one away MOVES it rather than losing it — the reader can see from any route
 * that something of that kind is standing, and bring it back in one press. That is the argument
 * `notice-kind.ts` already makes for `danger`, and it is true of all four kinds.
 *
 * <p><b>What is not a card is a transient failure</b> — the answer to something the reader just
 * did, gone on the next attempt. 「코드가 틀렸습니다」 on a sign-in panel,
 * 「연결하지 못했습니다」 after pressing a test button, a field that refuses the value being
 * typed. Those stay `AlertBanner`, and they still pass `icon` — a message that reaches only the
 * reader who can separate the two tints has reached half of them. The test is whether the message
 * survives the reader doing nothing: if it is still there a minute later, it stands, and it closes.
 */
export function NoticeCard({
  noticeKey,
  kind,
  title,
  hint,
  children,
  trailing,
  actionLabel,
  onAction,
}: NoticeCardProps) {
  const { t } = useTranslation("common");
  const dismissals = useNoticeDismissals();
  const style = DISMISSIBLE_NOTICE_KIND_STYLE[kind];

  useRegisterNotice({ noticeKey, kind, title, hint, actionLabel, onAction });

  const hide = useCallback(() => dismissals.hide(noticeKey), [dismissals, noticeKey]);

  // **A card brought back has to be brought back where the reader is looking.** The control that
  // restores it is in the page header, and the card itself may sit anywhere below — a thousand
  // pixels down inside a tab body, on the screen this was reported from. Pressing 「다시 보이기」
  // then changes nothing the reader can see, and the honest reading of that is that the button is
  // broken. Scrolled to, the press has an answer.
  //
  // Only on the transition from hidden to shown: a card that was on the screen all along is
  // already where the reader put it, and dragging the page to it on every render would fight them.
  const box = useRef<HTMLDivElement>(null);
  const wasHidden = useRef(false);
  const hiddenNow = dismissals.ready && dismissals.isHidden(noticeKey);
  useEffect(() => {
    if (wasHidden.current && !hiddenNow) {
      box.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    wasHidden.current = hiddenNow;
  }, [hiddenNow]);

  // Nothing is drawn until the operator's own set has answered. Drawing first and taking it away
  // a moment later moves every row on the screen down and then back up, and it shows them a card
  // they have already put away — the one outcome this whole mechanism exists to prevent.
  if (!dismissals.ready || dismissals.isHidden(noticeKey)) return null;

  return (
    <div
      ref={box}
      {...(kind === "help"
        ? slotAttributes(explanationCardStyle, { kind })
        : slotAttributes(noticeCardStyle, { kind }))}
    >
    <AlertBanner
      tone={style.tone}
      icon={style.icon}
      density="sm"
      // `AlertBanner` announces itself as an alert, which is right for a refusal that just
      // arrived and wrong for an explanation that has been on the screen since it loaded — a
      // reader on a screen reader would meet every help card as an interruption. Only the
      // warning kind keeps it.
      role={kind === "warning" ? "alert" : "note"}
      trailing={
        <Flex align="center" gap="xs">
          {trailing}
          {actionLabel && onAction && (
            <Button type="button" variant="outline" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={t("notice.hide", { title })}
            title={t("notice.hideShort")}
            onClick={hide}
          >
            <XIcon aria-hidden />
          </Button>
        </Flex>
      }
    >
      <Stack gap="none">
        <Text weight="medium">{title}</Text>
        {hint && (
          <Text size="caption" tone="muted">
            {hint}
          </Text>
        )}
        {children}
      </Stack>
    </AlertBanner>
    </div>
  );
}
