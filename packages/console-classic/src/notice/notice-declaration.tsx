import { useRegisterNotice } from "./notice-registry";
import type { DismissibleNoticeKind } from "./notice-kind";

/** One notice card that exists somewhere the header cannot see it while it is not mounted. */
export interface DeclaredNotice {
  /** The constant the card itself declares. The two are one entry because they share this. */
  readonly noticeKey: string;
  /** Which of the three it is. Decides which header control lists it. */
  readonly kind: DismissibleNoticeKind;
  /** What it is called, on the card and again in the dropdown. */
  readonly title: string;
  /** The line under it. */
  readonly hint?: string;
}

/** Props for {@link NoticeDeclaration}. */
export interface NoticeDeclarationProps {
  /** The card being declared on behalf of. */
  readonly notice: DeclaredNotice;
  /** What the way back to it is called — 「설명 보기」 and the like. */
  readonly actionLabel?: string;
  /** What pressing that does. Give it a stable identity; it is compared on every render. */
  readonly onAction?: () => void;
}

/**
 * Puts a notice card on the header's list from somewhere the card itself cannot.
 *
 * <p><b>A card inside a dialog is not mounted while the dialog is closed</b>, so it registers
 * nothing, and the header's control for its kind has nothing to list. Dismissed, it never mounts
 * again on any visit — the control disappears from the page rather than offering the way back, and
 * there is no route to that card at all. That is the one thing a board switching dismissible
 * notices on owes: a card that closes with no way back has been deleted rather than dismissed.
 *
 * <p>Rendered outside whatever holds the card — beside the dialog rather than inside it — this
 * stands whether the dialog is open or not. It draws nothing itself.
 *
 * <p>Both write the same `noticeKey` on purpose, and the registry keeps an entry while any holder
 * is left, so the card's own unmount does not take this one off with it.
 *
 * @param props the notice, and what its way back is
 * @returns nothing
 */
export function NoticeDeclaration({ notice, actionLabel, onAction }: NoticeDeclarationProps) {
  useRegisterNotice({
    noticeKey: notice.noticeKey,
    kind: notice.kind,
    title: notice.title,
    hint: notice.hint,
    actionLabel,
    onAction,
  });
  return null;
}
