/**
 * Account lock state, resolved the way the server resolves it.
 *
 * @remarks
 * The account read never carries a top-level `locked` flag — the lock lives on the
 * account's security profile, together with the instant it lifts. A screen that reads
 * `account.locked` therefore always sees `undefined` and draws a locked operator as
 * active, which is the opposite of what the administrator needs to see.
 *
 * A timed lock (five failed sign-ins) lifts by itself at `lockedUntil`; the stored flag
 * stays `true` until that account signs in again, so the flag alone over-reports. A lock
 * with no `lockedUntil` is a manual one and lifts only when an administrator releases it.
 */

/** The security-profile shape this resolver reads. */
export interface AccountLockSource {
  locked?: boolean;
  lockedUntil?: string;
}

/** Whether the account is barred from signing in right now. */
export function isAccountLocked(profile: AccountLockSource | undefined | null): boolean {
  if (!profile?.locked) return false;
  if (!profile.lockedUntil) return true;
  return Date.now() < new Date(profile.lockedUntil).getTime();
}

/** The instant a timed lock lifts, or `null` when the lock needs an administrator. */
export function accountLockLiftsAt(profile: AccountLockSource | undefined | null): string | null {
  return isAccountLocked(profile) ? profile?.lockedUntil ?? null : null;
}
