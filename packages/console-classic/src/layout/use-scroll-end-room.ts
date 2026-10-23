import { type RefObject, useEffect, useState } from "react";

/** Room under the last card while the region scrolls. */
const ROOM = "h-10";

/** What is left when it does not, so the content does not sit on the status strip. */
const RESTING = "h-2";

/**
 * How much room to leave under a scrolling region's last card.
 *
 * <p><b>The room is only room while something scrolls.</b> A console shell is the height of the
 * window, so a fixed spacer at the foot of the scrolling region is taken out of whatever shares
 * that height — and where the page is not scrolling, that is a detail panel made 40px shorter to
 * leave a band of nothing above the status strip. Measured on a detail screen at 1440×1200 the
 * band came to 63px, of which the spacer was 40 and the scroll it exists to finish did not exist:
 * `scrollHeight` and `clientHeight` were both 1087.
 *
 * <p><b>Why an element rather than padding.</b> Neither a scroll container's own bottom padding
 * nor an overflowing flex item's is counted in what there is to scroll, so a long page ends flush
 * against the window and reads as cut off. An element is counted, which is why the room is a
 * spacer at all and why this returns a height for one rather than a padding value.
 *
 * <p><b>It cannot oscillate, and that is not obvious.</b> A spacer whose presence decides whether
 * the region overflows would switch itself off and back on forever. This one does not, because
 * each height is only ever compared against an overflow that already includes it: at `ROOM` the
 * region either overflows — and taking 32px away cannot end an overflow the spacer did not
 * cause — or it does not, and shrinking cannot start one. Every step lands where it decides the
 * same way again.
 *
 * @param ref the scrolling region — the shell's `main`
 * @returns the height class for the spacer at the foot of that region
 */
export function useScrollEndRoom(ref: RefObject<HTMLElement | null>): string {
  const [room, setRoom] = useState<string>(ROOM);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      setRoom(el.scrollHeight - el.clientHeight > 0 ? ROOM : RESTING);
    };
    measure();

    // The region's own box and what it holds: a list that grows by a page, a detail that opens
    // beside it, a banner that appears. Observing the region alone reports none of those, because
    // the region's own height never changes — the shell fixed it.
    const boxes = new ResizeObserver(measure);
    boxes.observe(el);
    for (const child of Array.from(el.children)) boxes.observe(child);

    // A route change replaces what is inside without resizing anything the observer above holds,
    // so the room would stay at whatever the previous screen needed.
    const tree = new MutationObserver(measure);
    tree.observe(el, { childList: true, subtree: true });

    return () => {
      boxes.disconnect();
      tree.disconnect();
    };
  }, [ref]);

  return room;
}
