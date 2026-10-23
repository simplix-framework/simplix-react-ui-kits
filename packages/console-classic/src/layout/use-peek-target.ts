import { useState } from "react";

/** Controller returned by {@link usePeekTarget}. */
export interface PeekTargetController<T> {
  /** The open target, or `null` when closed. Drives which detail a multi-kind peek mounts. */
  target: T | null;
  /** `target !== null` — pass straight to `DetailPeekDialog` `open` and to the mount gate. */
  isOpen: boolean;
  /** Open the peek. Boolean-target callers invoke `open()` with no argument. */
  open: (target?: T) => void;
  /** Close the peek. */
  close: () => void;
  /** `onOpenChange` handler that closes on `false` — pass straight to `DetailPeekDialog`. */
  onOpenChange: (open: boolean) => void;
}

/**
 * The open/close state machine shared by every cross-detail peek trigger. Removes
 * the repeated `useState` + `onOpenChange` closure + `isOpen` derivation that each
 * {@link DetailPeekDialog} caller otherwise hand-rolls.
 *
 * Two shapes, one hook:
 * - a boolean single-target peek uses the default `T = true` (`open()` / `isOpen`);
 * - a nullable multi-kind peek passes a target object (`open({ kind, id, title })`).
 *
 * Pure state only — label lookup and `goToHref` assembly stay with the caller
 * (they are domain- and i18n-scoped).
 */
export function usePeekTarget<T = true>(): PeekTargetController<T> {
  const [target, setTarget] = useState<T | null>(null);
  return {
    target,
    isOpen: target !== null,
    open: (next = true as T) => setTarget(next),
    close: () => setTarget(null),
    onOpenChange: (open) => {
      if (!open) setTarget(null);
    },
  };
}
