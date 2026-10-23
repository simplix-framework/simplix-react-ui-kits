import { type ReactNode } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { Flex, PageHeaderProvider } from "@simplix-react/ui";

import { ManualPanel } from "../manual";
import { PeekHost } from "../peek";
import { AuthLayout } from "./auth-layout";
import { ConsoleWindow } from "./console-window";
import { ConsoleContentColumn } from "./content-column";

/** Props for {@link PlainConsoleShell}. */
export interface PlainConsoleShellProps {
  /** The route on screen, which the manual reads to open at the right page. */
  readonly route: string;
  /** The routed screen. */
  readonly children: ReactNode;
}

/**
 * The shell for an app with no navigation column — a worker app, a kiosk.
 *
 * <p>The header, the content and the manual beside it, and nothing else. An app whose screens are
 * reached from a device rather than from a menu has no tree to draw, and drawing an empty one
 * would take a column of every screen to say so.
 *
 * <p><b>The manual sits BESIDE the content rather than over it</b>: the reader opened it because
 * they are stuck on what is on the screen, and a dialog would make them close the answer to look
 * at the question.
 */
export function PlainConsoleShell({ route, children }: PlainConsoleShellProps) {
  return (
    <PeekHost>
      <ConsoleWindow>
        <Flex gap="none" className="flex-1 min-h-0 overflow-hidden">
          {/* The store sits outside the column rather than inside its `main`, which is where it
              used to be. It draws no box either way, and outside it wraps the header the column
              carries as well as the screen — the same placement the console's own root uses. */}
          <PageHeaderProvider>
            <ConsoleContentColumn>{children}</ConsoleContentColumn>
          </PageHeaderProvider>
          <ManualPanel route={route} />
        </Flex>
      </ConsoleWindow>
    </PeekHost>
  );
}

/**
 * The root layout of an app with no navigation column, given the routes that stand outside it.
 *
 * <p><b>Which routes those are is the whole of what differs between two such apps</b>, so it is
 * the argument and everything else is shared. Written per app, two apps' roots were the same
 * thirteen lines and the third's differed only in that it wraps a console shell — which is how a
 * fix to one of them stops at that one.
 *
 * @param authRoutes the paths reached before there is a session
 * @returns the component the app's root route mounts
 */
export function createPlainConsoleRoot(authRoutes: ReadonlySet<string>) {
  return function RootLayout() {
    // What the outlet is RENDERING, not where the router is heading. The location changes the
    // moment a navigation starts while the previous route stays on screen until the next one has
    // loaded, so reading it wrapped the console's shell around the sign-in form for as long as
    // signing in took.
    const pathname = useRouterState({
      select: (state) =>
        state.matches[state.matches.length - 1]?.pathname ?? state.location.pathname,
    });

    if (authRoutes.has(pathname)) return <AuthLayout />;

    return (
      <PlainConsoleShell route={pathname}>
        <Outlet />
      </PlainConsoleShell>
    );
  };
}
