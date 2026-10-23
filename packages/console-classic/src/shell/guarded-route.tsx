import { useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { useAccess, useCan } from "@simplix-react/access/react";

import { AccessDeniedPage } from "../error";

/**
 * Wraps a screen in the permission it requires.
 *
 * <p>Hiding an affordance keeps an operator from walking into a screen they may not read, but it
 * does nothing about a typed address or a bookmark kept from a wider grant. The server refuses the
 * requests either way, so what is left is a page of chrome around empty panels and a denial that
 * only arrives once something is clicked — this answers with the denial up front instead.
 *
 * <p>The permission is passed in rather than looked up in a navigation catalogue: a screen
 * registers the same permission its endpoint requires, and the two are read against each other
 * where that catalogue lives.
 *
 * @param permission the action and subject the screen's own endpoint requires
 * @param Screen the screen to render once the operator is admitted
 * @returns the component the route mounts
 */
export function guarded(
  permission: { action: string; subject: string } | undefined,
  Screen: ComponentType,
): () => ReactNode {
  return function GuardedRoute() {
    const policy = useAccess();
    // Subscribed, not read off the policy object: `useAccess` hands back the same policy every
    // render and never re-renders on its own, so a guard that only read `policy.user` would keep
    // the value it saw before the grants arrived. `useCan` below re-renders only when its own
    // answer flips, which for anyone short of a super administrator it never does — the screen
    // then waits for a load that already finished, for ever.
    const { user } = useSyncExternalStore(policy.subscribe, policy.getSnapshot, policy.getSnapshot);
    const allowed = useCan(permission?.action ?? "list", permission?.subject ?? "all");

    // Grants arrive after the first render, and an operator who has them would otherwise see the
    // denial flash before the answer is known. Until the policy names a user there is nothing to
    // decide with, so the screen waits rather than guesses.
    if (!user) return null;
    // The guard is the only place that knows WHICH permission was refused, so it hands it on — a
    // denial that cannot name the missing grant leaves the operator nothing to request.
    if (permission && !allowed) return <AccessDeniedPage permission={permission} />;

    return <Screen />;
  };
}
