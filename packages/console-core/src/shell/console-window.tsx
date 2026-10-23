import type { ReactNode } from "react";
import { Flex } from "@simplix-react/ui";

/** Props for {@link ConsoleWindow}. */
export interface ConsoleWindowProps {
  /** The bands of chrome and the screen between them, stacked from the top of the window down. */
  readonly children: ReactNode;
}

/**
 * The outermost box of a console — exactly the viewport tall, painting the app's own ground.
 *
 * <p><b>Both are measurements rather than a look.</b> A shell that sizes to its content scrolls the
 * whole console, so the bands of chrome leave the edges they are pinned to and the strip at the
 * foot goes wherever the longest screen puts it; and the ground has to be painted here because
 * every band above and below the content is drawn against it.
 *
 * <p><b>It takes no props beyond what it holds</b>, which is the reason it is one component rather
 * than three. Nothing about the window differs between a console with a menu column, one without,
 * and one on a phone — written out per shell it was the same two classes three times, and the
 * next shell would have written them a fourth.
 */
export function ConsoleWindow({ children }: ConsoleWindowProps) {
  return (
    <Flex direction="column" gap="none" className="h-dvh bg-background">
      {children}
    </Flex>
  );
}
