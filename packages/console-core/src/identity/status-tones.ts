import type { StatusTone } from "@simplix-react/ui";

/**
 * Tone map for the `CardholderStatus` enum.
 *
 * String keys are the backend enum string values. Consumers resolve with a
 * fallback, e.g. `cardholderStatusToTone[value] ?? "neutral"`, then feed the
 * tone to `StatusBadge` / `StatusDot` (or `statusToneClass`) for dark-correct,
 * palette-literal coloring. No display text lives here — labels arrive from the
 * caller's i18n layer.
 *
 * Tones are chosen so the rendered hue matches the previous hand-written
 * coloring (see the cardholder list/detail widgets). The original widgets used
 * non-semantic shadcn `Badge` variants; each is mapped to the nearest semantic
 * tone of the same hue.
 */
export const cardholderStatusToTone: Record<string, StatusTone> = {
  // Original Badge variant "default" (primary/neutral fill) → active = success/emerald.
  ACTIVE: "success",
  // Original Badge variant "secondary" (muted gray) → neutral/slate.
  EXPIRED: "neutral",
  // Original Badge variant "destructive" (red) → danger/red.
  SUSPENDED: "danger",
  // Original Badge variant "outline" (no semantic color) → warning/amber.
  PENDING: "warning",
  // Original Badge variant "secondary" (muted gray) → info/blue for visual distinction from EXPIRED.
  ON_VACATION: "info",
};

/**
 * Tone map for the `CredentialStatus` enum.
 *
 * Same contract as {@link cardholderStatusToTone}: string enum-value keys,
 * `StatusTone` values, no text. Consumers resolve with a fallback, e.g.
 * `credentialStatusToTone[value] ?? "neutral"`.
 *
 * Tones preserve the previous credential-list coloring (active green, suspended
 * red, revoked gray).
 */
export const credentialStatusToTone: Record<string, StatusTone> = {
  // Original Badge variant "default" → active = success/emerald.
  ACTIVE: "success",
  // Original Badge variant "destructive" (red) → danger/red.
  SUSPENDED: "danger",
  // Original Badge variant "secondary" (muted gray) → neutral/slate.
  REVOKED: "neutral",
};

/**
 * Tone map for the `ScopeGrantStatus` enum.
 *
 * <p>Same contract as {@link cardholderStatusToTone}. Two screens draw this status — the grant's
 * own detail and the account's 역할·권한 범위 tab — and a tone decided twice is a tone that drifts,
 * so the map is here and the label stays with each caller's `enumLabel`.
 *
 * <p><b>Ran out and taken back are not the same colour.</b> An expiry is the arrangement working;
 * a revocation is somebody deciding, and the person reading the row is often checking exactly
 * which of the two happened.
 */
export const scopeGrantStatusToTone: Record<string, StatusTone> = {
  ACTIVE: "success",
  EXPIRED: "neutral",
  REVOKED: "danger",
};
