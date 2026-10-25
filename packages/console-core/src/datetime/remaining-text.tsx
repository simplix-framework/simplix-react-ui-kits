import { formatRelativeTime, parseRfc3339, Text } from "@simplix-react/ui";
import { useLocale } from "@simplix-react/i18n/react";
import type { ReactNode } from "react";

/** Props for {@link RemainingText}. */
export interface RemainingTextProps {
  /** The instant being counted down to (an RFC 3339 `Instant`). */
  value: string | null | undefined;
  /** Rendered when the value is absent or unparseable. Defaults to nothing. */
  fallback?: ReactNode;
  /** Rendered once the deadline is behind us, instead of an elapsed count. */
  passedLabel?: ReactNode;
  /** The instant counted from (the site's clock, an RFC 3339 string or a Date). Defaults to the wall clock. */
  now?: string | Date;
}

/**
 * How long is left until a deadline, in words.
 *
 * @remarks
 * A deadline is two facts, and a screen that carries only one of them cannot be acted on: the
 * instant tells an operator what to quote to a buyer, and the distance to it tells them whether
 * this is today's problem. Reading "2026-08-02 23:59" and working out that it is two days away is
 * arithmetic the screen should have done.
 *
 * @remarks
 * Deliberately coarse — the framework's relative formatter rounds to a single unit, which is the
 * granularity a decision is actually made at. A ticking clock would make a detail panel a live
 * surface for a value nobody watches to the minute.
 *
 * @example
 * ```tsx
 * <RemainingText value={order.dueAt} passedLabel={t("order.deadlinePassed")} />
 * ```
 */
export function RemainingText({ value, fallback = null, passedLabel, now }: RemainingTextProps) {
  const locale = useLocale();
  const at = value ? parseRfc3339(value) : null;
  if (!at || Number.isNaN(at.getTime())) return <>{fallback}</>;
  const from = now === undefined ? Date.now() : (typeof now === "string" ? parseRfc3339(now) : now)?.getTime() ?? Number.NaN;
  if (Number.isNaN(from)) throw new Error(`RemainingText: unparseable now ${String(now)}`);
  if (passedLabel != null && at.getTime() <= from) return <>{passedLabel}</>;
  // The formatter counts from the wall clock, so the deadline moves by the gap between the two clocks.
  return <Text as="span" size="sm">{formatRelativeTime(new Date(at.getTime() + Date.now() - from), locale)}</Text>;
}
