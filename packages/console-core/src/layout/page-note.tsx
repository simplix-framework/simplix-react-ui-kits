import type { ReactNode } from "react";
import { Flex, Text } from "@simplix-react/ui";

export interface PageNoteProps {
  /** The sentence itself — one line about what this screen does to records elsewhere. */
  readonly children: ReactNode;
  /**
   * The way onwards, at the end of the sentence.
   *
   * <p>A link where the screen it names is built, an `UnbuiltAction` where it is not. The choice
   * belongs to the caller because only the caller knows which of its destinations exist; what this
   * component owns is that the way onwards sits on the sentence's own line rather than under it.
   */
  readonly trailing?: ReactNode;
}

/**
 * One line under the page header saying what this screen changes somewhere else.
 *
 * <p><b>Not a notice and not a banner.</b> A notice explains the screen and can be put away; a
 * banner reports a state that changed. This says where the consequence of using this screen lands
 * — 「세션을 끊으면 그 작업의 점유가 해제됩니다」 — and it names the screen the reader would go to
 * next. It is the same on every day the screen is opened, and it is short enough that hiding it
 * behind a control would cost more presses than reading it costs room.
 *
 * <p><b>It stands above the tab strip, never between the strip and the rows.</b> The strip and the
 * rows are the two cuts of one set read in order, and anything between them reads as a third cut
 * (frontend invariant #63). Above the strip it is read once, as a fact about the page.
 *
 * <p>The board draws this on 78 frames as `pageNote`, a primitive of the `simplix-basic` pattern
 * rather than an invention of this board — so it is a component the console owes rather than a
 * frame that can be corrected away.
 */
export function PageNote({ children, trailing }: PageNoteProps) {
  return (
    <Flex align="center" gap="xs" wrap>
      <Text size="caption" tone="muted">
        {children}
      </Text>
      {trailing}
    </Flex>
  );
}
