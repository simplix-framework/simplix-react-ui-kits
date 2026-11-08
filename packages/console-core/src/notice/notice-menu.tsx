import { Fragment, useRef } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  AlertBanner,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Flex,
  Stack,
  STATUS_TONES,
  Text,
} from "@simplix-react/ui";

import { DISMISSIBLE_NOTICE_KINDS, DISMISSIBLE_NOTICE_KIND_STYLE, type DismissibleNoticeKind } from "./notice-kind";
import { useNoticeEntries, type NoticeEntry } from "./notice-registry";
import { useNoticeDismissals } from "./dismissal-source";
import {
  noticeMenuActionStyle,
  noticeMenuCardStyle,
  noticeMenuLabelStyle,
  noticeMenuRuleStyle,
  noticeMenuStyle,
  noticePingStyle,
} from "./notice-menu.style";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

/**
 * How wide the dropdown is drawn.
 *
 * <p>Wide enough that a card's title and the first line of its body stand on their own lines. At a
 * menu's width — the framework's `min-w-[8rem]` — a one-line notice becomes three, and a dropdown
 * harder to read than the card it holds makes not hiding the card the better choice, which would
 * leave this whole mechanism earning nothing. Capped against the viewport so a narrow window gets
 * a dropdown that fits rather than one that runs off the edge.
 */
const MENU_WIDTH = "w-[32rem] max-w-[calc(100vw-2rem)]";

/** Props for {@link NoticeMenu}. */
export interface NoticeMenuProps {
  /**
   * The keys of the cards this control answers for, when it is not the page header's.
   *
   * <p>A modal surface (a record's drawer) covers the page header and its control with an overlay,
   * so a card put away inside it needs the control inside the surface. That one lists only the
   * cards the surface can show, never the whole screen's. Left out, the control lists every card
   * of the screen, which is the page header's.
   */
  readonly only?: readonly string[];
}

/**
 * The header's controls for this screen's notice cards — one per kind with a card put away.
 *
 * <p><b>What makes putting a card away safe.</b> A card the reader hid is gone from the screen and
 * still on this list, so the way back is where it always is rather than somewhere they have to
 * remember.
 *
 * <p><b>A kind draws its control only while at least one of its cards is hidden.</b> The control
 * exists to say 「치워 둔 것이 있다」 and to lead back to it, so on a screen where nothing has been
 * put away it is an icon that opens a list of what the reader is already looking at. Drawn on that
 * rule the header carries no notice control on first arrival, gains one the moment a card is put
 * away, and loses it again when the card comes back — the presence of the control IS the claim
 * that something is behind it.
 *
 * <p><b>Narrowing it takes nothing away, because a visible card carries its own button.</b>
 * `NoticeCard` renders `actionLabel`/`onAction` on the card itself, so an explanation is one press
 * away from the card while the card is on the page and one press away from here once it is not.
 *
 * <p><b>The dropdown still lists every card of the kind, hidden or not.</b> Only the hidden ones
 * offer 「다시 보이기」; the others are there so the reader recognises the group they put a card
 * away from rather than meeting one card out of context.
 */
export function NoticeMenu({ only }: NoticeMenuProps = {}) {
  const all = useNoticeEntries();
  const dismissals = useNoticeDismissals();
  const entries = only ? all.filter((entry) => only.includes(entry.noticeKey)) : all;
  if (entries.length === 0) return null;
  return (
    // One cluster rather than four verbs; the slot says how tight.
    <Flex align="center" {...partAttributes(noticeMenuStyle, {})}>
      {DISMISSIBLE_NOTICE_KINDS.map((kind) => {
        // A lingering entry (its modal is closed) is listed only while it is put away: drawn nowhere
        // and not hidden, it is nothing for the reader to come back to.
        const ofKind = entries.filter(
          (entry) => entry.kind === kind && (!entry.lingering || dismissals.isHidden(entry.noticeKey)),
        );
        // `ready` as well as `isHidden`, for the same reason `NoticeCard` gates its own render on
        // it: until the operator's dismissals have arrived nothing is known to be hidden, and a
        // control that appeared and then vanished would be the header flinching on every load.
        const putAway =
          dismissals.ready && ofKind.some((entry) => dismissals.isHidden(entry.noticeKey));
        return putAway ? <NoticeKindMenu key={kind} kind={kind} entries={ofKind} /> : null;
      })}
    </Flex>
  );
}

/**
 * One kind's control and the cards under it.
 *
 * <p><b>Drawn as a card, not as a menu.</b> What this holds is the cards that were on the page, so
 * it takes the page's card surface — the ground, the border, the corner and the padding a `Card`
 * uses — and each entry is the same `AlertBanner` the card itself renders, at the same tone and
 * with the same icon. Drawn as a menu the same content reads as a different thing, and somebody who
 * came here looking for the card they hid does not recognise it.
 */
function NoticeKindMenu({ kind, entries }: { readonly kind: DismissibleNoticeKind; readonly entries: readonly NoticeEntry[] }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation("common");
  const dismissals = useNoticeDismissals();
  const style = DISMISSIBLE_NOTICE_KIND_STYLE[kind];
  const KindIcon = style.icon;
  const kindLabel = t(style.labelKey);
  // Whether any card of this kind is currently put away. `NoticeMenu` mounts this only for a kind
  // that has one, so in every rendered case it is true — computed here rather than assumed so the
  // component still reads correctly on its own terms, and so the accessible name stays honest if
  // it is ever mounted on another rule.
  //
  // **What the tint and the pulse separate is no longer 「치워 둔 것이 있는가」** — the control's
  // presence carries that now. They separate what is behind it: `danger` and `warning` pulse
  // because a hidden card of theirs names something still wrong and asks to be acted on, while
  // `help` and `info` sit still and coloured because a hidden explanation is not a claim on the
  // reader. So a pulsing control is the normal resting state of a screen with a dismissed error,
  // and it stops when the card comes back or the condition does.
  const hiding = entries.some((entry) => dismissals.isHidden(entry.noticeKey));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={trigger}
          type="button"
          variant="ghost"
          size="icon-sm"
          // Springs in as the card it now holds folds away, so the eye is led to where it went.
          className="relative animate-in fade-in-0 slide-in-from-bottom-1"
          aria-label={t(hiding ? "notice.openHidden" : "notice.open", { kind: kindLabel })}
        >
          {/* The ring is a sibling rather than a ring on the glyph: an animated `box-shadow` on an
              icon inside a button paints over the button's own focus ring, and a reader on the
              keyboard then cannot see where they are. */}
          {hiding && style.pulses && (
            <span
              className={cn("pointer-events-none absolute inline-flex size-3", STATUS_TONES[style.tone].ring)}
              aria-hidden
              {...slotAttributes(noticePingStyle, {})}
            />
          )}
          <KindIcon
            className={cn("relative size-4", hiding && STATUS_TONES[style.tone].icon)}
            aria-hidden
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={MENU_WIDTH}
        {...partAttributes(noticeMenuCardStyle, {})}
        // **Focus goes back to the icon without dragging the page to it.** Closing, the menu
        // restores focus to its trigger, and the browser scrolls a focused element into view — so
        // a card that has just brought itself onto the screen is scrolled off again before the
        // reader sees it, and 「다시 보이기」 reads as a button that does nothing. The keyboard
        // reader still lands back on the control they opened, which is what the restore is for.
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          trigger.current?.focus({ preventScroll: true });
        }}
      >
        <DropdownMenuLabel {...partAttributes(noticeMenuLabelStyle, {})}>{kindLabel}</DropdownMenuLabel>
        <Stack gap="sm">
          {entries.map((entry, at) => {
            const hidden = dismissals.isHidden(entry.noticeKey);
            return (
              <Fragment key={entry.noticeKey}>
                {at > 0 && <DropdownMenuSeparator {...partAttributes(noticeMenuRuleStyle, {})} />}
                {/* The same component the card on the page renders, so the tint, the icon and the
                    words are one thing drawn twice rather than two things kept in step by hand.
                    The controls go under the text instead of beside it: at a card's width the
                    trailing slot has room, at a dropdown's it would squeeze the sentence this
                    exists to let the reader recognise. */}
                <AlertBanner tone={style.tone} icon={style.icon} density="sm" role="note">
                  <Stack gap="xs">
                    <Stack gap="none">
                      <Text size="sm" weight="medium">
                        {entry.title}
                      </Text>
                      {entry.hint && (
                        <Text size="caption" tone="muted">
                          {entry.hint}
                        </Text>
                      )}
                    </Stack>
                    <Flex gap="xs" wrap>
                      {entry.actionLabel && entry.onAction && (
                        <DropdownMenuItem
                          className="w-auto"
                          {...partAttributes(noticeMenuActionStyle, {})}
                          onSelect={() => entry.onAction?.()}
                        >
                          {entry.actionLabel}
                        </DropdownMenuItem>
                      )}
                      {/* Menu items rather than buttons, so the arrow keys reach them: inside a
                          menu, Tab closes the dropdown, and a control only a mouse can press is
                          not a way back to anything. */}
                      {/* Only a way back, never a way to hide. The dropdown is where a dismissed
                          card is seen again, so hiding from inside it would take away the one
                          route back and leave nothing pointing at what was hidden — the card's
                          own close control is where hiding belongs. */}
                      {hidden && (
                        <DropdownMenuItem
                          className="w-auto"
                          {...partAttributes(noticeMenuActionStyle, {})}
                          onSelect={() => dismissals.show(entry.noticeKey)}
                        >
                          {t("notice.show")}
                        </DropdownMenuItem>
                      )}
                    </Flex>
                  </Stack>
                </AlertBanner>
              </Fragment>
            );
          })}
        </Stack>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
