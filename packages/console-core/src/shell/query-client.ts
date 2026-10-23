import { classifyError } from "@simplix-react/api";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { dispatchError } from "../error";

/**
 * Whether a failure is the session ending rather than a request going wrong.
 *
 * <p>The auth stack raises this when a token can no longer be refreshed, and it raises it as its
 * own error rather than as an HTTP status — so the 401 guards below never see it, it classifies as
 * 「unknown」, and the dialog shows the stack's internal English sentence under a title saying
 * nobody knows what happened. Somebody does: the session expired, `onRefreshFailure` already acted
 * on it, and the sign-in page already says so in the reader's own language.
 *
 * @param error whatever the query or mutation rejected with
 * @returns true when this is an expired session and not a failed request
 */
export function isSessionExpiry(error: unknown): boolean {
  return (
    typeof error === "object"
    && error !== null
    && (error as { code?: unknown }).code === "REFRESH_FAILED"
  );
}

/**
 * The console's query client, with the two caches that decide which failures reach a dialog.
 *
 * <p><b>One implementation for every app in the installation.</b> Which failures are answered by
 * the screen and which by the modal is a product decision, and three copies of it drift the first
 * time one app learns about a new status — which is how the same refusal comes to raise a dialog
 * in one app and be swallowed in another.
 *
 * @returns the client the app hands to `QueryClientProvider`
 */
export function createConsoleQueryClient(): QueryClient {
  const mutationCache = new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) => {
      // Form hooks handle their own errors (validation → field errors, others → submitError).
      if (mutation.meta?.handledByForm) return;

      // A screen that renders the refusal itself does not also get the dialog. Told twice, the
      // reader dismisses the modal to reach the sentence underneath it and the second telling has
      // cost them a click to say what the first already said. Same flag the query cache reads, so
      // one name covers both halves of a screen that owns its own failures.
      if (mutation.meta?.suppressErrorDialog) return;

      // The session ending is not this mutation's failure to report.
      if (isSessionExpiry(error)) return;

      const event = classifyError(error);

      // 401: boot auth already handles the redirect via `onRefreshFailure`.
      if (event.status === 401) return;

      // Validation errors are handled by `useCrudFormSubmit` → field errors per field.
      if (event.category === "validation") return;

      // A save refused because somebody else got there first is answered by the editor's own
      // conflict dialog, which shows the two versions side by side. The generic dialog would land
      // on top of it saying less, and the operator would dismiss both.
      if (event.status === 409 && mutation.meta?.handlesConflict) return;

      dispatchError(event);
    },
  });

  const queryCache = new QueryCache({
    onError: (error, query) => {
      if (query.meta?.suppressErrorDialog) return;

      // A read that lands as the session expires is the expiry, not a broken screen. Left to the
      // generic path it raises a modal over the sign-in page — which traps the accessibility tree
      // around the very form that would fix it, so the sign-in becomes unreachable to a screen
      // reader, and comes back the moment it is dismissed because the retry fails the same way.
      if (isSessionExpiry(error)) return;

      const event = classifyError(error);

      if (event.status === 401) return;

      // Pure transport failures carry no server message — the list and detail inline error states
      // cover them; the dialog's value is the server's own message.
      if (event.category === "network") return;

      // Gateway and unavailable responses (a dev proxy's 502 while the server restarts, a load
      // balancer's 503 or 504) are transport failures with an HTTP shell, so they stay inline too.
      if (event.status === 502 || event.status === 503 || event.status === 504) return;

      dispatchError(event);
    },
  });

  return new QueryClient({
    queryCache,
    mutationCache,
    // **이 콘솔은 읽는 값을 캐시하지 않는다.** Every read goes to the server and what is drawn is
    // what the server just said.
    //
    // <p><b>A kept snapshot is drawn before the refetch answers, and that is what a reader sees as
    // stale.</b> With `staleTime: 0` alone the cache still holds the last response, so a screen
    // returned to paints the old record first and corrects itself a moment later — which reads as
    // an edit that did not take, or as a list that needs opening twice. `gcTime: 0` leaves nothing
    // to paint, so the only thing that can be drawn is the answer to a request made now.
    //
    // <p><b>`refetchOnMount: "always"` covers the case staleness cannot.</b> A query is refetched
    // on mount whether or not anything marked it stale, so a screen never depends on some earlier
    // mutation having invalidated the right key — and a key that is matched by string, as this
    // console's invalidation is, cannot go quiet by matching nothing.
    //
    // <p><b>This is the whole policy and it is set here.</b> A screen does not decide it: a page
    // that sets its own cache is a page that behaves differently from every other for a reason
    // nobody can see from the outside, and the four screens that most needed to be right are the
    // ones nobody thought to set it on. Where a read genuinely must be held — a value that cannot
    // change within a session — that exception is declared here with its reason, not in the screen.
    defaultOptions: {
      queries: {
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnReconnect: "always",
        refetchOnWindowFocus: "always",
        retry: 1,
      },
    },
  });
}
