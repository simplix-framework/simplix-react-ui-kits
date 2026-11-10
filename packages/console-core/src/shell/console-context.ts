import { createContext, useContext } from "react";

/** A workplace the operator may switch to. */
export interface ConsoleSite {
  readonly siteId: string;
  readonly siteName: string;
  /** Whether it has still to finish onboarding, which is what puts the readiness row first. */
  readonly setupMode: boolean;
}

/** What the shell knows about who is signed in and where they are working. */
export interface ConsoleContextValue {
  /** The dashboard role this account is drawn as, which decides the tabs and the menu. */
  readonly role: string;
  /** The account's name, for the corner. */
  readonly displayName: string;
  /** What the role is called on screen. */
  readonly roleName: string;
  /** Every workplace in range, in name order. */
  readonly sites: readonly ConsoleSite[];
  /** The workplace every date and figure on the page is read against. */
  readonly site: ConsoleSite | undefined;
  /** That workplace's IANA zone, which the status strip names. */
  readonly siteTimeZone: string | undefined;
  /** Switches workplace. The whole console is read against the new one. */
  readonly selectSite: (siteId: string) => void;
  /**
   * What the front door drew, shared so the shell and the dashboard make one read between them.
   *
   * <p>Opaque here: the shell reads nothing out of it — the two values it does use, the workplace
   * list and the zone, are lifted onto this interface above. The screen that draws the front door
   * knows the shape and casts it back.
   */
  readonly dashboard: unknown;
  /** Whether the dashboard read has answered yet. */
  readonly dashboardLoading: boolean;
  /** Whether the identity read has answered yet. */
  readonly loading: boolean;
}

const ConsoleContext = createContext<ConsoleContextValue | null>(null);

/**
 * Supplies what the shell knows about the operator and the workplace.
 *
 * <p><b>Why the provider that fills this lives elsewhere.</b> Both answers come from domain
 * endpoints (who is signed in, and what the front door drew), and a console kit depends on no
 * product API. The shape and the reader are the pattern and stay here; the two reads and the
 * role-to-layout catalogue are the capability and live in the module that owns the front door.
 */
export const ConsoleContextProvider = ConsoleContext.Provider;

/**
 * @returns what the shell knows about the operator and the workplace
 * @throws when called outside a mounted console provider
 */
export function useConsole(): ConsoleContextValue {
  const value = useContext(ConsoleContext);
  if (!value) {
    throw new Error(
      "useConsole must be called under a mounted ConsoleContextProvider. The provider that " +
        "fills it belongs to the module that owns the front door, and goes at the app root.",
    );
  }
  return value;
}
