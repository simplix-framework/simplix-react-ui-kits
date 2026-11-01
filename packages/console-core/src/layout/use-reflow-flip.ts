import { type RefObject, useLayoutEffect, useRef } from "react";

/** What one item's box was on the last pass. */
interface Box {
  readonly left: number;
  readonly top: number;
  readonly bottom: number;
}

/** Reads a duration token such as `--dur-slow` as milliseconds; reduced motion sets it to 0. */
function durationOf(el: Element, token: string): number {
  const raw = getComputedStyle(el).getPropertyValue(token).trim();
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return 0;
  return raw.endsWith("ms") ? value : value * 1000;
}

/**
 * How many rows the items stand in. Items of different heights in one row have different tops, so
 * an item starts a new row only when it sits wholly below the row before it.
 */
function rowsOf(boxes: ReadonlyMap<string, Box>): number {
  const sorted = [...boxes.values()].sort((a, b) => a.top - b.top);
  let rows = 0;
  let rowBottom = Number.NEGATIVE_INFINITY;
  for (const box of sorted) {
    if (box.top >= rowBottom - 1) {
      rows += 1;
      rowBottom = box.bottom;
    } else {
      rowBottom = Math.max(rowBottom, box.bottom);
    }
  }
  return rows;
}

/**
 * Moves the items of a grid from where they stood to where they stand, whenever they jump.
 *
 * <p>Two things make items jump: the order changing (a tile dragged, or moved with Alt and an
 * arrow), and the window crossing a breakpoint so the grid reflows into more or fewer rows. Each
 * item is drawn at its new place, offset back to its old one and released, so it glides there with
 * `--dur-slow` and `--ease-spring`. A window being resized without a reflow moves the items a little
 * every frame and is left alone, since that motion already follows the pointer.
 *
 * @param ref the element the items are under
 * @param selector picks the items under {@link ref}; each is keyed by `data-flip-key`, or by its
 *   position when it has none
 * @param deps values whose change may reorder the items
 * @param enabled false while the layout is still being settled (a column count not yet measured):
 *   nothing is recorded or moved, so the first layout that follows is taken as where the items
 *   started rather than as a jump from the guess before it
 */
export function useReflowFlip(ref: RefObject<HTMLElement | null>, selector: string, deps: readonly unknown[], enabled = true): void {
  const boxes = useRef<Map<string, Box>>(new Map());
  const width = useRef<number | null>(null);
  const running = useRef<Map<HTMLElement, Animation>>(new Map());
  // Read through a ref: the resize observer below is made once and would keep the first render's value.
  const on = useRef(enabled);
  on.current = enabled;

  const pass = (moved: "order" | "resize") => {
    const host = ref.current;
    if (!host || !on.current) return;
    const items = Array.from(host.querySelectorAll<HTMLElement>(selector));
    const next = new Map<string, Box>();
    // Where each item is drawn now (a glide still running included), then where layout puts it:
    // a glide is stopped before measuring, so its offset is never mistaken for a move, and the next
    // glide starts from the drawn place instead of snapping back to the old one.
    const drawn = new Map<string, Box>();
    items.forEach((el, i) => {
      const key = el.dataset.flipKey ?? String(i);
      const glide = running.current.get(el);
      if (glide) {
        const r = el.getBoundingClientRect();
        drawn.set(key, { left: r.left, top: r.top, bottom: r.bottom });
        glide.cancel();
        running.current.delete(el);
      }
      const r = el.getBoundingClientRect();
      next.set(key, { left: r.left, top: r.top, bottom: r.bottom });
    });
    const was = boxes.current;
    const hostWidth = host.getBoundingClientRect().width;
    const widthChanged = width.current !== null && Math.abs(hostWidth - width.current) > 0.5;
    // While the window is resized, only a change in the number of rows is a jump worth easing.
    const jumped = moved === "order" ? !widthChanged : rowsOf(was) !== rowsOf(next);
    const duration = durationOf(host, "--dur-slow");
    // A glide cut short above finishes from where it was drawn even when nothing new jumped.
    if (was.size > 0 && (jumped || drawn.size > 0) && duration > 0) {
      const easing = getComputedStyle(host).getPropertyValue("--ease-spring").trim() || "ease-out";
      items.forEach((el, i) => {
        const key = el.dataset.flipKey ?? String(i);
        const from = drawn.get(key) ?? (jumped ? was.get(key) : undefined);
        const to = next.get(key);
        if (!from || !to) return;
        const dx = from.left - to.left;
        const dy = from.top - to.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        const glide = el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], { duration, easing });
        running.current.set(el, glide);
        glide.onfinish = () => running.current.delete(el);
      });
    }
    boxes.current = next;
    width.current = hostWidth;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => pass("order"), deps);

  useLayoutEffect(() => {
    const host = ref.current;
    if (!host || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => pass("resize"));
    observer.observe(host);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
