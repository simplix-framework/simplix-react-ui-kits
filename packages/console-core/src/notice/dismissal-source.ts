import { createContext, useContext } from "react";

/** Which notice cards this operator has put away, and how to change that. */
export interface NoticeDismissals {
  /** Whether the set is known — before it is, no card knows whether it belongs on screen. */
  readonly ready: boolean;
  /** Whether this card is one the operator put away. */
  readonly isHidden: (noticeKey: string) => boolean;
  /** Every key put away, so the header can list them without asking each card. */
  readonly hiddenKeys: readonly string[];
  /** Puts a card away, for this operator, until they bring it back. */
  readonly hide: (noticeKey: string) => void;
  /** Brings a card back onto every screen it belongs to. */
  readonly show: (noticeKey: string) => void;
}

const MISSING_SOURCE =
  "No NoticeDismissalsProvider is mounted. A dismissal outlives the session, so the set comes " +
  "from a server this package must not know about: mount the provider your installation's " +
  "settings module supplies, at the app root and above every screen that draws a notice card.";

/**
 * What the cards read where no provider is mounted.
 *
 * <p>Every card stands, which is the safe direction: showing a card somebody put away costs them
 * the space back, hiding one they never put away costs them the warning. The two writes throw,
 * because a 닫기 that silently does nothing reads as a broken button rather than as a missing
 * provider — the same reason the peek host throws on `open` rather than opening nothing.
 */
const NO_SOURCE: NoticeDismissals = {
  ready: true,
  isHidden: () => false,
  hiddenKeys: [],
  hide: () => {
    throw new Error(MISSING_SOURCE);
  },
  show: () => {
    throw new Error(MISSING_SOURCE);
  },
};

const NoticeDismissalsContext = createContext<NoticeDismissals>(NO_SOURCE);

/**
 * Supplies the dismissal set the cards read.
 *
 * <p><b>Why this is a port and not a hook that reads the server.</b> A dismissal is a row this
 * operator owns on the installation's own settings API, and `@simplix-react-ui-kits/console-classic` is the layer
 * 1 `ui` pack — its dependency column in `docs/tracking/PRODUCT-LAYERING.md` §2 is a dash. The
 * cards are the pattern (P-23 · P-45) and stay here; the read is the capability and lives in the
 * module that owns that API.
 */
export const NoticeDismissalsProvider = NoticeDismissalsContext.Provider;

/**
 * @returns which cards this operator has put away, and the two controls that change it
 */
export function useNoticeDismissals(): NoticeDismissals {
  return useContext(NoticeDismissalsContext);
}
