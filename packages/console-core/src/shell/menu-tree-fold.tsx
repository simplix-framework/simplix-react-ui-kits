import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { menuInkStyle, menuSlotStyle } from "./menu-tree.style";

/**
 * Holds the navigation column or its rail and animates the width between them.
 *
 * <p>The two are different elements, so neither can transition into the other. After every render
 * the box measures what it holds; when that differs from the last measure, it pins its own width to
 * the old figure and releases it to the new one on the next style pass, which the slot's width
 * transition carries. Whatever caused the change (the collapse button, a shortcut, the window
 * crossing the narrow breakpoint) animates the same way. With motion reduced the transition is
 * zero-length and the width lands at once.
 *
 * @param props the column or the rail
 * @returns the box
 */
export function ConsoleMenuSlot({ children }: { readonly children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const last = useRef<number | null>(null);

  useLayoutEffect(() => {
    const element = box.current;
    if (!element) return;
    // Released before measuring, so a change that lands mid-animation measures the content rather
    // than the pinned width.
    element.style.width = "";
    const held = element.firstElementChild;
    const next = held instanceof HTMLElement ? held.getBoundingClientRect().width : 0;
    const from = last.current;
    last.current = next;
    if (from === null || Math.abs(from - next) < 1) return;

    element.style.width = `${from}px`;
    // Reading layout here commits the start width before the end width is set.
    void element.offsetWidth;
    element.style.width = `${next}px`;
    const release = () => {
      element.style.width = "";
    };
    element.addEventListener("transitionend", release, { once: true });
    // A zero-length transition fires no end event.
    const fallback = window.setTimeout(release, 1000);
    return () => {
      window.clearTimeout(fallback);
      element.removeEventListener("transitionend", release);
    };
  });

  return (
    <div ref={box} {...slotAttributes(menuSlotStyle, {})}>
      {children}
    </div>
  );
}

/**
 * The rows under a branch, growing out of the row above as it opens and folding back as it closes.
 *
 * <p>Closed and at rest, nothing is mounted, exactly as a conditional render leaves it, so a closed
 * branch costs neither layout nor the column's gap. While it moves it is mounted as a fold whose
 * single grid row runs between 0fr and 1fr, and it takes back the gap its parent puts above it
 * with a negative margin on the same curve, so the rows below glide rather than jump by a gap at
 * either end. With motion reduced it mounts and unmounts at once.
 *
 * @param props whether the branch is open, and its rows
 * @returns the fold, or nothing
 */
export function ConsoleMenuFold({ open, children }: { readonly open: boolean; readonly children: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);
  const [gap, setGap] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMounted(open);
      setShown(open);
      return;
    }
    if (open) setMounted(true);
    else setShown(false);
  }, [open]);

  // Mounted closed first, measured, then opened on the next frame so the rows have a start to grow
  // from.
  useLayoutEffect(() => {
    const parent = box.current?.parentElement;
    if (parent) setGap(Number.parseFloat(getComputedStyle(parent).rowGap) || 0);
  }, [mounted]);
  useEffect(() => {
    if (!open || !mounted || shown) return;
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, [open, mounted, shown]);

  useEffect(() => {
    if (open || !mounted || shown) return;
    const element = box.current;
    const done = () => setMounted(false);
    const onEnd = (event: TransitionEvent) => {
      if (event.target === element && event.propertyName === "grid-template-rows") done();
    };
    element?.addEventListener("transitionend", onEnd);
    // A design with no fold duration fires no end event.
    const fallback = window.setTimeout(done, 800);
    return () => {
      window.clearTimeout(fallback);
      element?.removeEventListener("transitionend", onEnd);
    };
  }, [open, mounted, shown]);

  if (!mounted) return null;
  return (
    <div
      ref={box}
      className="tiles-fold"
      data-open={shown ? "true" : "false"}
      inert={!open}
      style={{
        marginTop: shown ? 0 : -gap,
        transition:
          "grid-template-rows var(--fold-dur, 240ms) var(--fold-ease, ease), margin-top var(--fold-dur, 240ms) var(--fold-ease, ease)",
      }}
    >
      <div>{children}</div>
    </div>
  );
}

interface InkBox {
  readonly top: number;
  readonly height: number;
}

/**
 * The current row's mark, measured against the column body it scrolls with.
 *
 * <p>Remeasured whenever anything in the body changes size (a branch folding above the row moves
 * it) or the current row changes, so the mark slides on the selected-indicator curve rather than
 * jumping. Nothing is drawn while the current row is folded away.
 */
export function MenuInk() {
  const self = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<InkBox | null>(null);

  useEffect(() => {
    const body = self.current?.parentElement;
    if (!body) return;
    const measure = () => {
      const row = body.querySelector<HTMLElement>('[data-slot="console-menu-row"][data-current="true"]');
      if (!row || row.closest('[data-open="false"]')) return setBox(null);
      const rowBox = row.getBoundingClientRect();
      const origin = body.getBoundingClientRect();
      setBox({ top: rowBox.top - origin.top + body.scrollTop, height: rowBox.height });
    };
    measure();
    const sizes = new ResizeObserver(measure);
    const watch = () => {
      sizes.disconnect();
      sizes.observe(body);
      for (const child of Array.from(body.querySelectorAll("*"))) {
        if (child instanceof HTMLElement && child.dataset.slot !== "console-menu-ink") sizes.observe(child);
      }
    };
    watch();
    const changes = new MutationObserver(() => {
      watch();
      measure();
    });
    changes.observe(body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-current", "data-open"] });
    return () => {
      sizes.disconnect();
      changes.disconnect();
    };
  }, []);

  return (
    <span
      ref={self}
      aria-hidden
      className="pointer-events-none absolute"
      style={box ? { top: box.top, height: box.height } : { opacity: 0 }}
      {...slotAttributes(menuInkStyle, {})}
    />
  );
}
