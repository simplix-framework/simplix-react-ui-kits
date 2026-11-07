import { ScreenErrorPage, ServerErrorPage, WindowScreen } from "../error";

/**
 * Which failure page a thrown error is told by: a server failure (an error carrying a 5xx status,
 * as a route loader's read throws it) is the server's, and everything else, a screen that threw
 * while it was being drawn included, is the screen's own.
 *
 * @param error whatever the route threw
 * @returns the page's kind and, for a server failure, the status the page names
 */
export function routeFailureOf(error: unknown): { readonly kind: "server"; readonly code: string } | { readonly kind: "screen" } {
  const status = typeof error === "object" && error !== null ? (error as { status?: unknown }).status : undefined;
  return typeof status === "number" && status >= 500 && status <= 599 ? { kind: "server", code: String(status) } : { kind: "screen" };
}

/**
 * A root route's error boundary, which replaces the whole layout rather than filling it.
 *
 * <p><b>The screen height is supplied here.</b> A failure page centres inside the height it is
 * given, and a root route is the one mount that gives it none: there is no console around it to
 * fill.
 *
 * <p><b>The page says whose failure it was.</b> A render crash is the screen's, and a page that
 * blames the server with a 500 under it sends the reader to a system that answered nothing wrong.
 */
export function RouteErrorFallback({ error, reset }: { error: Error; reset?: () => void }) {
  console.error(error);
  const failure = routeFailureOf(error);
  return (
    <WindowScreen>{failure.kind === "server" ? <ServerErrorPage reset={reset} code={failure.code} /> : <ScreenErrorPage reset={reset} />}</WindowScreen>
  );
}
