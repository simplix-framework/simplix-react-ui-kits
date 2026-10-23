import { useCallback, useEffect, useState } from "react";

import { useMediaQuery } from "@simplix-react/ui";

/**
 * Where the operator's collapse choice lives.
 *
 * <p>Its own namespace, deliberately outside the auth store's prefix. Signing out clears that
 * prefix by sweeping every key under it, so a preference parked beside the tokens is erased by the
 * one act it has to outlive — the column would come back expanded after every sign-in, and nothing
 * anywhere would say why (frontend invariant #59). The stay-signed-in preference sits outside for
 * the same reason.
 *
 * <p><b>The app's own name is what keeps three apps apart.</b> Written per app it was written three
 * times and all three carried the namespace of the console this one was replicated from — so
 * collapsing the column in the worker app collapsed it in the admin console, and nothing errors
 * when two apps agree about something they were never asked to agree about.
 */
const keyFor = (namespace: string) => `${namespace}.prefs:sidebar-collapsed`;

/**
 * The width below which the window collapses the column on its own.
 *
 * <p>A viewport question rather than a container one: what is decided is how much of the window
 * the navigation may take, and below this the content column loses more than the labels are
 * worth.
 */
const NARROW_WINDOW = "(max-width: 1024px)";

/** Reads the stored choice. Absent, the column starts expanded — labels beat icons. */
function readStoredCollapsed(namespace: string): boolean {
  try {
    return localStorage.getItem(keyFor(namespace)) === "1";
  } catch {
    /* storage unavailable — the column opens expanded, which is the readable side */
    return false;
  }
}

/** Records the choice, so the next visit from this machine opens the way this one ended. */
function storeCollapsed(namespace: string, collapsed: boolean): void {
  try {
    if (collapsed) {
      localStorage.setItem(keyFor(namespace), "1");
    } else {
      localStorage.removeItem(keyFor(namespace));
    }
  } catch {
    /* storage unavailable — the choice lasts this window, which is better than refusing it */
  }
}

/** Whether the column is collapsed, and how to change that. */
export interface SidebarCollapse {
  /** Whether the column is currently a rail. */
  collapsed: boolean;
  /**
   * Whether the window collapsed it or the operator did. Only the operator's choice is stored,
   * and the two are told apart so a narrow window never rewrites what a wide one was set to.
   */
  collapsedBy: "viewport" | "operator" | null;
  /** Collapses an expanded column and expands a collapsed one. */
  toggle: () => void;
}

/**
 * The navigation column's collapse state — the operator's standing choice, and the window's.
 *
 * <p>Two different things collapse the column and only one of them is remembered. A window too
 * narrow to hold the column collapses it for as long as it stays narrow; the operator pressing
 * the toggle on a wide window is a decision about how they want to work, and that is what
 * outlives the visit.
 *
 * <p>Inside a narrow window the operator can still expand it, and it stays expanded for that
 * window without being stored: a choice made because the window was small must not become the
 * default the next wide window opens with. Widening the window returns to the stored choice,
 * and narrowing it again starts collapsed — the window's decision is the window's, every time.
 *
 * @param namespace the app's own name, which keeps its preference apart from its siblings'
 */
export function useSidebarCollapse(namespace: string): SidebarCollapse {
  const narrow = useMediaQuery(NARROW_WINDOW);
  // Read synchronously on first render rather than in an effect: an effect would paint the
  // column expanded and then snap it shut on every load.
  const [chosen, setChosen] = useState(() => readStoredCollapsed(namespace));
  // What was decided inside the current narrow window, which lives exactly as long as it does.
  const [thisWindow, setThisWindow] = useState<boolean | null>(null);

  // Crossing the breakpoint in either direction drops that decision: going wide hands the
  // column back to the stored choice, and coming back narrow starts collapsed again.
  useEffect(() => {
    setThisWindow(null);
  }, [narrow]);

  const collapsed = narrow ? thisWindow ?? true : chosen;

  const toggle = useCallback(() => {
    if (narrow) {
      setThisWindow((current) => !(current ?? true));
      return;
    }
    setChosen((wasCollapsed) => {
      const next = !wasCollapsed;
      storeCollapsed(namespace, next);
      return next;
    });
  }, [narrow, namespace]);

  return {
    collapsed,
    collapsedBy: collapsed ? (narrow ? "viewport" : "operator") : null,
    toggle,
  };
}
