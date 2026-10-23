import type { AccessAdapter, AccessPolicy, DefaultActions } from "@simplix-react/access";
import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";

/** What `GET /user/me/permissions` answers, inside the product's response envelope. */
interface SelfPermissions {
  readonly userId: string;
  readonly username: string;
  readonly displayName?: string;
  readonly isSuperAdmin?: boolean;
  readonly roles?: ReadonlyArray<{ readonly roleCode: string }>;
  readonly permissions?: Record<string, string[]>;
}

/** What one app needs to read its own operator's grants. */
export interface SelfAccessConfig {
  /** The self endpoint — who is signed in and what they are granted, in one read. */
  readonly endpoint: string;
  /**
   * The auth stack's own fetch, which carries the bearer token and refreshes it once on a 401.
   *
   * <p>A bare `fetch` here reads as unauthenticated and answers with an empty grant map, which a
   * screen cannot tell apart from an account that genuinely has nothing.
   *
   * <p>Typed as the adapter's own parameter rather than as `typeof fetch`: the auth stack's fetch
   * takes a path, and the wider built-in signature would refuse it at every call site.
   */
  readonly fetchFn: NonNullable<NonNullable<Parameters<typeof createApiAdapter>[0]>["fetchFn"]>;
}

/**
 * What a screen may show, read from the server rather than decided in the browser.
 *
 * <p>One read for identity and grants together. Two reads would let a screen render against an
 * identity whose grants had not arrived, which is the state where an affordance flashes into view
 * and then disappears — and the reader has already pressed it.
 *
 * <p><b>The response is transformed here rather than left to the default extraction, and that half
 * is why this is shared.</b> The default reads the permission map out of a nested `body` and stops
 * there: it carries no user across, and a policy whose snapshot has no user is a policy every
 * route guard waits on for ever — the screen renders the shell, the guard returns nothing, and
 * nothing errors. The roles arrive as objects where the policy wants their codes, which is the
 * second half of the same mismatch. Written per app, this fix reached one app of three and the
 * other two hung on every guarded route with no message anywhere.
 *
 * <p>The boundary itself is on the server (design 5.4 · 15.1). This decides what is DRAWN; what is
 * allowed is decided again on every request, and a screen that only hid a button has enforced
 * nothing.
 *
 * @param config the self endpoint and the fetch that carries the token
 * @returns the policy the app reads before it draws anything an operator may not have
 */
export function createSelfAccessPolicy(config: SelfAccessConfig): AccessPolicy<DefaultActions> {
  const selfAdapter = createApiAdapter({
    endpoint: config.endpoint,
    fetchFn: config.fetchFn,
    transformResponse: (response: unknown) => {
      const body = ((response as { body?: SelfPermissions })?.body ?? response) as SelfPermissions;
      const roles = (body.roles ?? []).map((role) => role.roleCode);
      return {
        permissions: body.permissions ?? {},
        roles,
        isSuperAdmin: body.isSuperAdmin ?? false,
        user: {
          userId: body.userId,
          username: body.username,
          displayName: body.displayName,
          isSuperAdmin: body.isSuperAdmin ?? false,
          roles,
        },
      };
    },
  });

  // Cast to the default action set because `createApiAdapter` is not generic: it answers with the
  // widened `AccessAdapter<string>`, and the policy this product uses is the nine-action default
  // the permission evaluator on the server also uses.
  return createAccessPolicy<DefaultActions>({
    adapter: selfAdapter as AccessAdapter<DefaultActions>,
  });
}
