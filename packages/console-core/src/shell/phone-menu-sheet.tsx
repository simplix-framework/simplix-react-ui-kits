import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, Text, Stack } from "@simplix-react/ui";
import { partAttributes } from "@simplix-react/ui/design";

import { phoneScreenBodyStyle, phoneMenuSheetStyle } from "./phone-shell.style";

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
          {...partAttributes(phoneScreenBodyStyle, {})}
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
