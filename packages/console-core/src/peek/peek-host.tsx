import { Component, useMemo, useRef, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";

import { PeekHostContext, type PeekEntry, type PeekHostController } from "./peek-context";
import { peekRendererFor, registeredPeekKinds, unregisteredPeekRenderer } from "./peek-registry";

/** One entry on the stack, with the key that keeps React from reusing a sibling's state. */
interface StackedPeek {
  readonly key: number;
  readonly entry: PeekEntry;
  /** What held the focus when this peek opened: the reference pressed, which takes it back on close. */
  readonly returnTo: HTMLElement | null;
}

/**
 * Gives the focus back to what opened a peek once the peek is gone. The dialog is mounted by the
 * host, not by the reference that opened it, so the dialog's own focus return finds no trigger and
 * the focus falls to the page: a keyboard reader pressing Escape would start over from the top.
 */
function restoreFocus(target: HTMLElement | null): void {
  if (!target) return;
  // After the dialog's own unmount, which moves the focus last.
  requestAnimationFrame(() => {
    if (target.isConnected) target.focus();
  });
}

/** Props for {@link PeekHost}. */
export interface PeekHostProps {
  children: ReactNode;
}

/**
 * Owns every peek dialog for the app. Mount it once, wrapping the routed tree:
 * peek labels then dispatch their dialog here through `usePeekHost`, and it
 * renders outside the list cell, mapped row, or panel that opened it — the only
 * placement that survives the query refetches those surfaces run.
 *
 * <p><b>Peeks stack, and only the top one is mounted.</b> A reference inside a peek dialog is a
 * reference like any other, so pressing 「보기」 there opens the next record over the current one
 * and 「닫기」 comes back one step rather than all the way to the screen underneath. Mounting only
 * the top keeps the reads of the levels beneath from re-firing while they are not on screen; each
 * one is a render closure until it is needed again.
 */
export function PeekHost({ children }: PeekHostProps) {
  const [stack, setStack] = useState<readonly StackedPeek[]>([]);
  const nextKey = useRef(0);
  // The stack as last rendered, so closing reads the entry being closed without a stale closure.
  const stackRef = useRef(stack);
  stackRef.current = stack;
  const depth = stack.length;

  const controller = useMemo<PeekHostController>(
    () => ({
      open: (next) => {
        nextKey.current += 1;
        const key = nextKey.current;
        const returnTo = typeof document !== "undefined" && document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setStack((current) => [...current, { key, entry: next, returnTo }]);
      },
      close: () => {
        restoreFocus(stackRef.current[stackRef.current.length - 1]?.returnTo ?? null);
        setStack((current) => current.slice(0, -1));
      },
      closeAll: () => {
        restoreFocus(stackRef.current[0]?.returnTo ?? null);
        setStack([]);
      },
      depth,
    }),
    [depth],
  );

  const top = stack[stack.length - 1];

  return (
    <PeekHostContext.Provider value={controller}>
      {children}
      {top ? (
        <PeekBoundary key={top.key} onClose={() => controller.close()}>
          <TopPeek entry={top.entry} onClose={() => controller.close()} />
        </PeekBoundary>
      ) : null}
    </PeekHostContext.Provider>
  );
}

/**
 * Keeps a dialog that throws from taking the screen underneath with it.
 *
 * <p>A peek renders a detail component built for a page, and a detail reaches for whatever a page
 * has — a router, a page-header slot, a layout context. Where one of those is missing the render
 * throws, and a throw with nothing over it unmounts the entire React root: the operator presses
 * 「보기」 and the console goes white, with the record they were reading gone along with it.
 *
 * <p>Bounded, the dialog fails alone. What was on screen before the press is still on screen after
 * it, and the console prints where to look.
 */
class PeekBoundary extends Component<
  { readonly children: ReactNode; readonly onClose: () => void },
  { readonly failed: boolean }
> {
  constructor(props: { readonly children: ReactNode; readonly onClose: () => void }) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(
      "[peek] the dialog threw while rendering and was closed rather than taking the screen "
        + "under it. A detail drawn inside a peek gets the app's contexts and not a page's, so a "
        + "router link, a page-header slot or a layout value it expected may be absent here.",
      error,
      info.componentStack,
    );
    this.props.onClose();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The topmost peek, keyed so that opening a second one over the first mounts a fresh dialog
 * rather than handing the first one's state to the second.
 */
function TopPeek({ entry, onClose }: { entry: PeekEntry; onClose: () => void }) {
  const props = {
    open: true,
    onOpenChange: (open: boolean) => {
      if (!open) onClose();
    },
  };

  if (entry.render) return <>{entry.render(props)}</>;

  const render = peekRendererFor(entry.kind);
  if (!render) {
    // Saying so rather than opening an empty dialog. A kind that matches nothing is a typo or a
    // registration the app never made, and both look identical to a reader if the host stays
    // quiet: the control answers, a dialog appears, and it has no content. Naming what IS
    // registered turns that into something somebody can see, and the reader is told in the dialog
    // the entity module registers for it, so the press is never answered with nothing.
    // eslint-disable-next-line no-console
    console.error(
      `[peek] nothing is registered for kind "${entry.kind}". Registered: ` +
        `${registeredPeekKinds().join(", ") || "(none)"}. Register it where the app wires its ` +
        "modules together, since a module cannot import another module's detail component.",
    );
    const fallback = unregisteredPeekRenderer();
    return fallback ? <>{fallback(entry.kind, entry.target, props)}</> : null;
  }
  return <>{render(entry.target, props)}</>;
}
