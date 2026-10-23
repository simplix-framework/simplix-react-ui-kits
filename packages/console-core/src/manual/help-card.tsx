import { type ReactNode, useCallback, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Flex,
  Stack,
} from "@simplix-react/ui";

import { BoundedDialogContent } from "../layout/bounded-dialog-content";
import { NoticeCard, NoticeDeclaration } from "../notice";
import type { DismissibleNoticeKind } from "../notice";
import { PushEnd } from "../layout/push-edge";

interface HelpCardProps {
  /**
   * The constant this card is known by, so putting it away is remembered for this operator.
   *
   * <p>Written here rather than derived from the title: a title is a translated string that
   * changes with the catalogue, and a key that moves with it forgets every dismissal.
   */
  readonly noticeKey: string;
  /** What the explanation is called, on the card and again as the dialog's title. */
  readonly title: string;
  /** The one line under it saying what the explanation settles. */
  readonly hint: string;
  /** The explanation itself — a table, a list of rules, a legal note. */
  readonly children: ReactNode;
  /** Widened for a table with more than three columns. */
  readonly wide?: boolean;
  /** An action beside 「닫기」, for an explanation that leads somewhere. */
  readonly action?: ReactNode;
  /**
   * Whether the explanation is open, when the address decides it rather than the press.
   *
   * <p>An explanation the board gave its own frame has its own address, so it has to be reachable
   * by typing that address — a capture route navigates straight to it and never presses anything.
   * Left out, the card keeps the open state itself and works the same by press.
   */
  readonly open?: boolean;
  /** Told that the reader opened or closed it, when the address is what holds the state. */
  readonly onOpenChange?: (open: boolean) => void;
  /**
   * The notice cards this explanation holds inside it, declared here as well as rendered there.
   *
   * <p><b>A notice inside the dialog is not mounted while the dialog is closed</b>, so it puts
   * nothing on the header's list — and a reader who dismissed it then has no way back to it, which
   * is the one thing this board's `dismissibleNotices` says it owes. Declared here the entry stands
   * whether the dialog is open or not, and its way back is this explanation: the header restores
   * the card and 「설명 보기」 shows it.
   *
   * <p>Each entry repeats what the nested {@link NoticeCard} declares — the same key, kind, title
   * and hint. Registration is by key, so the two agree by being the same entry rather than by being
   * merged.
   */
  readonly notices?: readonly NestedNotice[];
}

/** One notice card an explanation holds, as the header reads it while the dialog is closed. */
export interface NestedNotice {
  /** The constant the nested card declares. */
  readonly noticeKey: string;
  /** Which of the three it is. */
  readonly kind: DismissibleNoticeKind;
  /** What it is called. */
  readonly title: string;
  /** The line under it. */
  readonly hint?: string;
}

/**
 * An explanation that reads the same tomorrow, kept one press away from the screen it belongs to.
 *
 * <p><b>Why it is not on the page.</b> What four scope axes narrow, or how a rank differs from a
 * role, is true of every row and every day — printed above the list it pushes the rows the reader
 * came for below the fold, and after the second visit nobody reads it again. The card says what the
 * explanation settles so the reader can decide whether they need it; today's figures stay in the
 * tiles and the messages, where they change.
 *
 * <p><b>The dialog is mounted whether or not the card is on screen.</b> An operator who put the
 * card away reaches the same explanation from the header's 도움말 control, and that control presses
 * this component's own button — so the dialog cannot live inside the part that the dismissal takes
 * away. It is mounted from the app root by the framework as well, so it survives the list beneath
 * it re-rendering: a dialog kept inside the subtree that opened it closes itself the moment that
 * subtree refreshes.
 */
export function HelpCard({
  noticeKey,
  title,
  hint,
  children,
  notices,
  wide,
  action,
  open: controlledOpen,
  onOpenChange,
}: HelpCardProps) {
  const { t } = useTranslation("common");
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  // Stable, because the header compares it on every render to decide whether its list changed.
  const openHelp = useCallback(() => setOpen(true), [setOpen]);

  return (
    <>
      {/* The nested cards' entries, standing whether or not the dialog is mounted. Rendered as
          components rather than registered in a loop, because the registration is a hook and the
          list's length is the call site's rather than this render's. */}
      {notices?.map((notice) => (
        <NoticeDeclaration
          key={notice.noticeKey}
          notice={notice}
          actionLabel={t("help.open")}
          onAction={openHelp}
        />
      ))}

      <NoticeCard
        noticeKey={noticeKey}
        kind="help"
        title={title}
        hint={hint}
        actionLabel={t("help.open")}
        onAction={openHelp}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        {/* The named width rather than a utility class, because the panel's own `sm:max-w-lg`
            beats a bare `max-w-4xl` at every width above 640px — a `wide` explanation written
            that way caps its table at 512px and wraps a three-column table one syllable to a
            line. `wide` is the widest step because that is what a table of more than three
            columns needs. */}
        {/* A column rather than the panel's own grid. A grid row sized `auto` resolves against
            its content and then overflows, so the explanation below cannot be given the leftover
            space — it has to name a height, and the only height available to name is a fraction of
            the window. In a column it takes what the header and the footer leave, which is what it
            wanted to say all along. */}
        <BoundedDialogContent width={wide ? "xl" : "lg"} className="flex flex-col">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{hint}</DialogDescription>
          </DialogHeader>
          {/* The explanation scrolls inside the dialog rather than growing it past the viewport,
              which is what keeps 닫기 pinned where the reader left it: a table of a dozen rows
              would otherwise carry the footer down with it. The framework's own column primitive
              owns the scroll, as the peek dialog's body does — a bare div here would be the one
              hand-rolled box in a package that has none.

              **The leftover rather than a fraction of the window.** Written `max-h-[60dvh]` this
              was a second ceiling on the same axis as the panel's own `calc(100dvh-2rem)`, and the
              tighter one is the inner element — so a 802px explanation in a 1200px window drew a
              966px dialog as an 884px one, scrolled 82px of it away, and left 284px of window
              empty above and below. What went below the fold was the bottom of a chart: its axis
              labels and the line under it, which read as a chart that ends there rather than one
              the reader has to scroll for. `flex-1` takes what the header and the footer leave,
              which shows the whole explanation where there is room and scrolls where there is not
              — 620px of window still pins the footer and gives this 424px. */}
          <Stack gap="md" className="min-h-0 flex-1 overflow-y-auto">
            {children}
          </Stack>
          {/* 닫기는 왼쪽 · 나머지는 오른쪽. The footer's own alignment puts everything on the
              right, so the action carries `ml-auto` and the two ends stay apart — and a dialog
              with nothing but 「닫기」 is left exactly where it was. */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("help.close")}
            </Button>
            {action ? (
              <PushEnd>
                <Flex gap="sm" align="center">
                  {action}
                </Flex>
              </PushEnd>
            ) : null}
          </DialogFooter>
        </BoundedDialogContent>
      </Dialog>
    </>
  );
}

