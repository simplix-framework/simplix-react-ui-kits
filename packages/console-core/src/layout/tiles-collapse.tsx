import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Where the operator's choice about the figure row lives.
 *
 * <p>Its own namespace, deliberately outside the auth store's prefix. Signing out clears that
 * prefix by sweeping every key under it, so a preference parked beside the tokens is erased by the
 * one act it has to outlive — the row would come back open after every sign-in and nothing
 * anywhere would say why (frontend invariant #59).
 *
 * <p><b>The app's own name is what keeps three apps apart.</b> A shared key would have the worker
 * app and the admin console agreeing about something they were never asked to agree about, which
 * is what a single hardcoded key did to the navigation column before it was given one of these.
 */
const keyFor = (namespace: string) => `${namespace}.prefs:tiles-collapsed`;

/** Whether the figure row is folded away, and how to change that. */
export interface TilesCollapse {
  /** Whether the row is currently a single strip under the header's rule. */
  readonly collapsed: boolean;
  /** Folds an open row away and opens a folded one. */
  readonly toggle: () => void;
}

const MISSING_PROVIDER =
  "No TilesCollapseProvider is mounted. The choice outlives the visit and is written under " +
  "the app's own preference namespace, so the provider goes at the app root: ConsoleProviders " +
  "mounts it from the `namespace` it is given.";

/**
 * What the row reads where no provider is mounted.
 *
 * <p>Open, which is the side that shows the figures; the toggle throws, because a control that
 * silently does nothing reads as a broken button rather than as a missing provider.
 */
const NO_PROVIDER: TilesCollapse = {
  collapsed: false,
  toggle: () => {
    throw new Error(MISSING_PROVIDER);
  },
};

const PageTilesCollapseContext = createContext<TilesCollapse>(NO_PROVIDER);

/** Reads the stored choice. Absent, the row opens — the figures are what the screen was drawn with. */
function readStoredCollapsed(namespace: string): boolean {
  try {
    return localStorage.getItem(keyFor(namespace)) === "1";
  } catch {
    /* storage unavailable — the row opens, which is the side that shows the figures */
    return false;
  }
}

/** Records the choice, so the next screen and the next visit both open the way this one ended. */
function storeCollapsed(namespace: string, collapsed: boolean): void {
  try {
    if (collapsed) {
      localStorage.setItem(keyFor(namespace), "1");
    } else {
      localStorage.removeItem(keyFor(namespace));
    }
  } catch {
    /* storage unavailable — the choice lasts this window, which beats refusing it */
  }
}

/**
 * Supplies the one choice every screen's figure row reads.
 *
 * <p><b>One choice for the whole console, not one per screen.</b> Somebody who folds the figures
 * away is saying how they want to work, not what they think of this screen's four numbers — so
 * every route they open afterwards opens folded, and the row they unfold on one screen is unfolded
 * on the next.
 *
 * <p><b>Other tabs follow.</b> The `storage` event fires in every other tab of this origin, so a
 * console open twice does not end up disagreeing with itself about a preference the operator set
 * once.
 *
 * @param props the app's own name, and whatever it mounts inside
 * @returns the provider
 */
export function TilesCollapseProvider({
  namespace,
  children,
}: {
  /** The app's own name, which is what keeps its preference apart from its siblings'. */
  readonly namespace: string;
  readonly children: ReactNode;
}) {
  // Read synchronously on first render rather than in an effect: an effect would paint the row
  // open and then snap it shut on every load.
  const [collapsed, setCollapsed] = useState(() => readStoredCollapsed(namespace));

  useEffect(() => {
    const follow = (event: StorageEvent) => {
      if (event.key === keyFor(namespace)) setCollapsed(event.newValue === "1");
    };
    window.addEventListener("storage", follow);
    return () => window.removeEventListener("storage", follow);
  }, [namespace]);

  const value = useMemo<TilesCollapse>(
    () => ({
      collapsed,
      toggle: () =>
        setCollapsed((wasCollapsed) => {
          const next = !wasCollapsed;
          storeCollapsed(namespace, next);
          return next;
        }),
    }),
    [collapsed, namespace],
  );

  return (
    <PageTilesCollapseContext.Provider value={value}>{children}</PageTilesCollapseContext.Provider>
  );
}

/**
 * @returns whether the figure row is folded away, and the control that changes it
 */
export function useTilesCollapse(): TilesCollapse {
  const value = useContext(PageTilesCollapseContext);
  // Bound here rather than in the provider so a consumer can pass it straight to onClick without
  // the identity changing on every render of whatever holds it.
  const toggle = useCallback(() => value.toggle(), [value]);
  return useMemo(() => ({ collapsed: value.collapsed, toggle }), [value.collapsed, toggle]);
}
