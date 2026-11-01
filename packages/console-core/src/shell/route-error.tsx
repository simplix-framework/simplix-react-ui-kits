import { ServerErrorPage, WindowScreen } from "../error";

/**
 * A root route's error boundary, which replaces the whole layout rather than filling it.
 *
 * <p><b>The screen height is supplied here.</b> A failure page centres inside the height it is
 * given, and a root route is the one mount that gives it none: there is no console around it to
 * fill.
 */
export function RouteErrorFallback({ error, reset }: { error: Error; reset?: () => void }) {
  console.error(error);
  return (
    <WindowScreen>
      <ServerErrorPage reset={reset} />
    </WindowScreen>
  );
}
