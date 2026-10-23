import { type ReactNode, useRef } from "react";
import { Stack } from "@simplix-react/ui";

import { useScrollEndRoom } from "../layout";
import { ConsolePageHeader } from "./page-header";

/** Props for {@link ConsoleContentColumn}. */
export interface ConsoleContentColumnProps {
  /** The routed screen, drawn under the header this column already carries. */
  readonly children: ReactNode;
}

/**
 * The part of the window a screen is drawn in — the region that scrolls, and the measure it
 * scrolls inside.
 *
 * <p><b>Three shapes that have to agree, so they are said once.</b> The scroll belongs here rather
 * than to the screen, because the chrome around it is pinned to the window and only this region
 * may move; the column is capped and centred, so a screen on a wide monitor is read across a
 * measure rather than across a metre; and the foot of the region carries the room the last card
 * needs.
 *
 * <p><b>The room is a spacer and not padding.</b> Neither a scroll container's own bottom padding
 * nor an overflowing flex item's is counted in what there is to scroll, so a long page ends flush
 * against the window and reads as cut off. An element is counted — and it takes no press, because
 * standing over the last row of a screen whose content reaches the fold it swallowed the 쪽 크기
 * control on the role list: the element is there, reads correctly and cannot be clicked, which is
 * the one kind of defect a screenshot cannot show.
 *
 * <p>How tall that spacer is answers to whether the region is scrolling ({@link useScrollEndRoom}),
 * because the shell is the height of the window: a fixed 40px comes out of whatever shares that
 * height, and on a screen with a detail open — where nothing scrolls — that is the panel being made
 * shorter to leave a band of nothing over the status strip.
 *
 * <p><b>What wraps it is the caller's</b>: a console puts the notice registry around it, an app
 * with no menu column puts the page-header store there. Both are context and draw no box, so
 * neither belongs inside this one.
 */
export function ConsoleContentColumn({ children }: ConsoleContentColumnProps) {
  // The region measures itself, so neither shell holds a ref to hand it — and neither has to
  // remember to call the hook above whatever early return its own layout needs.
  const content = useRef<HTMLElement>(null);
  const room = useScrollEndRoom(content);

  return (
    // The scroll owner is a `<main>` rather than a `div`, and `Stack` renders a `div` and takes no
    // element override; the column's measure has no prop on `Stack`; and the spacer is a bare box
    // whose height is a computed class. All three are this component's own vocabulary, which is
    // what it exists to hold.
    <main
      ref={content}
      className="flex flex-col flex-1 min-h-0 overflow-auto px-6 pt-4 [scrollbar-gutter:stable]"
    >
      <Stack flex className="max-w-screen-2xl mx-auto w-full">
        <ConsolePageHeader />
        {children}
        <div aria-hidden className={`${room} shrink-0 pointer-events-none`} />
      </Stack>
    </main>
  );
}
