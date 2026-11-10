import { createContext, useContext } from "react";
import type { ReactNode } from "react";

/** Render props the host hands the dialog it mounts. */
export interface PeekRenderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * An open request, in one of two shapes.
 *
 * <p><b>`render`</b> — the opener draws the dialog itself. Right where the detail component is
 * already reachable: a field in `modules/org` opening another organization imports that dialog
 * directly, and nothing is gained by routing it through a name.
 *
 * <p><b>`kind` and `target`</b> — the opener names the record and the host finds the dialog. For
 * crossing a module boundary, where the detail lives somewhere the opener cannot import. See
 * `registerPeek`.
 */
export type PeekEntry =
  | {
      /**
       * Renders the peek dialog. The host owns the open state and mounts the result
       * at the app root, so the dialog never lives inside the row that opened it.
       */
      render: (props: PeekRenderProps) => ReactNode;
      kind?: never;
      target?: never;
    }
  | {
      render?: never;
      /** The entity's name, as `registerPeek` filed it. */
      kind: string;
      /** Which record, and its name where the opener already had one to show. */
      target: { readonly id: string; readonly name?: string };
    };

/** Controller returned by {@link usePeekHost}. */
export interface PeekHostController {
  /**
   * Mount a peek dialog at the app root, above whatever peek is already open.
   *
   * <p>A reference inside a peek is a reference like any other, so peeks stack: pressing
   * 「보기」 on a child organization from inside its parent's peek opens the child over the
   * parent, and closing it comes back to the parent rather than to the screen underneath.
   */
  open: (entry: PeekEntry) => void;
  /** Close the topmost peek, revealing the one it was opened from. */
  close: () => void;
  /** Close every open peek at once. */
  closeAll: () => void;
  /** How many peeks are stacked; 0 when none is open. */
  depth: number;
}

const MISSING_HOST =
  "No PeekHost is mounted. Wrap the app root in <PeekHost> from the console kit's /peek entry " +
  "so peek dialogs mount outside the rows that open them.";

/**
 * Default controller for trees with no host: rendering a peek label stays safe,
 * and the misconfiguration surfaces on the click that needs the host.
 */
const NO_HOST: PeekHostController = {
  open: () => {
    throw new Error(MISSING_HOST);
  },
  close: () => {},
  closeAll: () => {},
  depth: 0,
};

export const PeekHostContext = createContext<PeekHostController>(NO_HOST);

/**
 * Access to the app-root peek host. Peek labels dispatch through it instead of
 * mounting a dialog themselves: a dialog kept inside a list cell or a mapped row
 * is unmounted whenever that subtree re-renders, closing itself moments after it
 * opens.
 */
export function usePeekHost(): PeekHostController {
  return useContext(PeekHostContext);
}
