import type { ReactNode } from "react";

import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Stack,
} from "@simplix-react/ui";
import { ExternalLinkIcon } from "lucide-react";
import { BoundedDialogContent } from "./bounded-dialog-content";
import { peekTriggerStyle } from "./detail-peek-dialog.style";
import { partAttributes } from "@simplix-react/ui/design";

/**
 * The two shapes a peek trigger takes, and the one question that decides which.
 *
 * <p><b>Does anything precede the trigger on its line?</b> That is the whole test. A word on a
 * trigger that follows a value competes with that value for the width and pushes it into an
 * ellipsis; a trigger standing on its own has nothing to crowd, and without a word it is a bare
 * glyph a reader cannot tell apart before hovering.
 *
 * - `"icon"` (default) — the icon alone, with the label as tooltip and accessible name. Detail
 *   fields, list columns, detail-list rows, section headers: anywhere the control sits at the end
 *   of a value or repeats down a page.
 * - `"inline"` — a bordered button carrying the label and the icon. Inside a card, and in a
 *   panel's upper footer tier, where the trigger begins its own line and the tier widens it to a
 *   share of the footer.
 *
 * <p>The default is the common case, so a trigger written without thinking about its place is
 * right rather than loud.
 */
export type PeekAppearance = "inline" | "icon";

/** Props for {@link PeekTriggerButton}. */
export interface PeekTriggerButtonProps {
  /**
   * Unified trigger label (localized by the caller, e.g. "보기") — the button's text in the
   * `"inline"` shape, and its tooltip and accessible name in the icon shape.
   */
  label: string;
  /**
   * What this trigger opens, as it reads to a person — the record's name, or the name of the
   * explanation. Prefixed to the accessible name, so a screen reader hears 「남부현장 보기」
   * rather than the fourth 「보기」 in a row; the tooltip stays the bare label, because sighted
   * readers have the name they are standing next to.
   *
   * <p>Omit it only where the trigger is genuinely the page's single one.
   */
  target?: string;
  onClick: () => void;
  /**
   * Which of the two shapes to draw. Defaults to `"icon"`; pass `"inline"` inside a card.
   *
   * <p>Read {@link PeekAppearance} before choosing: the place decides, not the author.
   */
  appearance?: PeekAppearance;
}

/*
 * **The trigger never pulls toward the value in front of it, and the distance is the row's gap.**
 *
 * There used to be a `tight` prop that applied `-ml-1.5` — six pixels — meaning 「an icon beside a
 * value is half of 「이름 + 보기」 and hugs it」. The intent was right and the mechanism could not
 * work: the distance was then the caller's gap minus six, settled between two files that never
 * see each other, so it came out different at every site and negative wherever the row was drawn
 * `gap="none"` — which is how the button's border came to sit on the last glyph of the name it
 * was pointing at. Nothing ever passed `tight`; it fired on every icon trigger and there was no
 * way to turn it off.
 *
 * A distance one file owns is one that is right everywhere. The trigger takes the room the row
 * gives it and takes none back.
 */

/**
 * The one trigger every cross-detail reference opens a {@link DetailPeekDialog} with, in the two
 * shapes {@link PeekAppearance} describes.
 *
 * <p>The default shape is sized to sit inline with body text and list rows: a small icon in an
 * `icon-xs` hit area, pulled toward the preceding value to compensate the container gap, with the
 * label carried as tooltip and accessible name. The `"inline"` shape is a small outline button
 * carrying the same icon and the label as text.
 */
export function PeekTriggerButton({
  label,
  target,
  onClick,
  appearance = "icon",
}: PeekTriggerButtonProps) {
  // The trigger often sits inside a clickable row — opening the peek must not
  // also fire the row's own click action.
  const handleClick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onClick();
  };

  const accessibleName = target ? `${target} ${label}` : label;

  if (appearance === "inline") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0"
        aria-label={target ? accessibleName : undefined}
        onClick={handleClick}
      >
        <ExternalLinkIcon className="size-4" />
        {label}
      </Button>
    );
  }

  // **The one borderless control in this console, and the shape is why.** Everywhere else a
  // labelled button carries a border, because without one it reads as text rather than as
  // something to press. This is the opposite case: it has no label, it stands at the end of a
  // value, and a bordered box crowding the last glyph of a name reads as a second thing on the
  // row rather than as part of 「이름 + 보기」. The mark alone is the affordance, and the value
  // beside it is what says what it opens. `appearance="inline"` — a labelled trigger standing in
  // a card or a footer — keeps the border, because there it IS a control of its own.
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="shrink-0"
      {...partAttributes(peekTriggerStyle, {})}
      title={label}
      aria-label={accessibleName}
      onClick={handleClick}
    >
      <ExternalLinkIcon />
    </Button>
  );
}

/** Props for {@link DetailPeekDialog}. */
export interface DetailPeekDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog title — the value that identifies the peeked record to a human. */
  title: ReactNode;
  /** Destination page of the go-to action (deep link, e.g. `/route?id=<id>`). */
  goToHref: string;
  /**
   * Takes the reader to that destination in place of the address assignment below.
   *
   * <p>Pass it when the destination is the screen already underneath the dialog — selecting a
   * row in the panel behind it is one render, while re-entering the same address is a full
   * reload that throws away the list, the filters and the scroll position the reader arrived
   * with. Without it the go-to action assigns {@link goToHref}, which is right for a
   * destination on another screen.
   */
  onGoTo?: () => void;
  /** Label of the go-to action (localized by the caller). */
  goToLabel: string;
  /** Label of the close action (localized by the caller). */
  closeLabel: string;
  /**
   * One line telling a screen reader what the dialog holds. Omit it when the title and the
   * embedded detail already say it — the dialog then opts out of the description explicitly
   * rather than leaving the assistive-technology hook dangling.
   */
  description?: ReactNode;
  /** The embedded detail surface (a read-only detail widget). */
  children: ReactNode;
}

/**
 * Cross-detail reference viewer: instead of navigating away, a detail screen
 * opens the referenced record's detail inside this dialog, and the user only
 * leaves the current screen through the explicit go-to action.
 */
export function DetailPeekDialog({
  open,
  onOpenChange,
  title,
  goToHref,
  onGoTo,
  goToLabel,
  closeLabel,
  description,
  children,
}: DetailPeekDialogProps) {
  // The dialog primitive points its accessible description at an element it expects a
  // Description to render. With no description that element never exists, so the reference
  // is opted out of by name — the key has to be absent when a description IS given, or the
  // opt-out would suppress the association it is there to make.
  const describedBy = description ? {} : { "aria-describedby": undefined };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BoundedDialogContent className="flex flex-col sm:max-w-3xl" {...describedBy}>
        <DialogHeader>
          {/* Some records are named by a hash or a fingerprint — wider than the dialog on
              a narrow viewport — so the title breaks rather than running under the close
              control. */}
          <DialogTitle className="min-w-0 break-all">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {/* The dialog body scrolls between the fixed header and footer and marks its edges. */}
        <Stack>{children}</Stack>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {closeLabel}
          </Button>
          <Button
            onClick={() => {
              if (onGoTo) {
                onGoTo();
                return;
              }
              window.location.href = goToHref;
            }}
          >
            <ExternalLinkIcon className="size-4" />
            {goToLabel}
          </Button>
        </DialogFooter>
      </BoundedDialogContent>
    </Dialog>
  );
}
