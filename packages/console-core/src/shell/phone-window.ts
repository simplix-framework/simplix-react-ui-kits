import { useMediaQuery } from "@simplix-react/ui";

import { PHONE_WINDOW } from "../layout/window-size";

/**
 * How tall and wide anything a thumb has to hit is drawn.
 *
 * <p>44px, which is what a finger covers. A control smaller than this is reachable with a mouse
 * and missed with a hand, and a screen built for a phone that keeps desktop hit areas reads as
 * working right up to the moment somebody uses it.
 */
export const TOUCH_TARGET = "min-h-11 min-w-11";

/** Whether the window this is rendering into belongs to a phone. */
export function useConsoleOnAPhone(): boolean {
  return useMediaQuery(PHONE_WINDOW);
}
