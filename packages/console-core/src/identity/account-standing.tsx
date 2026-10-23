import { useTranslation } from "@simplix-react/i18n/react";
import { StatusBadge, type StatusTone } from "@simplix-react/ui";
import { resolveBootEnum } from "@simplix-react-ext/simplix-boot-utils";

import { PACKAGE_NAMESPACE } from "./locales";

/**
 * How each account standing reads as a badge — only what an administrator has to act on is tinted.
 *
 * <p>Keyed by the server's own enum values, because more than one screen draws this badge: the
 * account roster (N-02) and the roster inside an organization's panel (N-91). A tone decided twice
 * is a tone that drifts, and two screens showing the same account in different colours is read as
 * two different accounts.
 */
export const ACCOUNT_STANDING_TONES: Readonly<Record<string, StatusTone>> = {
  ACTIVE: "success",
  INVITE_PENDING: "info",
  DORMANT: "warning",
  SUSPENDED: "danger",
};

/**
 * What each account standing is called, for a caller that needs the word without the badge.
 *
 * <p><b>A filter over standing has to say the same words the column does.</b> The badge resolves
 * its own label, so a facet that typed its options out would be a second copy — and the moment one
 * of the four is reworded the popover and the rows disagree while every screen still renders. Two
 * screens narrow this register (N-06's 잠긴 계정 and N-03's 부여된 계정), which is exactly the shape
 * that drifts.
 *
 * @returns a function from the server's enum constant to the word an operator reads
 */
export function useAccountStandingLabel(): (standing: string) => string {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  return (standing: string) => t(`accountStanding.${standing}`);
}

/** Props for {@link AccountStandingBadge}. */
export interface AccountStandingBadgeProps {
  /**
   * The row's standing as the server sent it — a boot enum object, not a string.
   *
   * <p>Taken raw and resolved here rather than by every caller: the object is truthy, so a caller
   * that forgets renders a badge whose tone lookup missed and whose label is `[object Object]`.
   */
  readonly standing: unknown;
}

/**
 * Where one account stands, drawn the same wherever it appears.
 *
 * <p>Renders nothing when the projection carries no standing — an absent value is a column the
 * endpoint did not send, and inventing 「활성」 for it would tell an administrator an account works
 * when nobody checked.
 */
export function AccountStandingBadge({ standing }: AccountStandingBadgeProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const value = resolveBootEnum(standing) ?? "";
  if (!value) return null;
  return (
    <StatusBadge
      tone={ACCOUNT_STANDING_TONES[value] ?? "neutral"}
      label={t(`accountStanding.${value}`)}
    />
  );
}
