import { useMemo, useState } from "react";
import { useAppTimeZone, zoneCalendarDate, zoneDayRange, zoneLastDaysRange, zoneMonthRange, zoneWeekRange } from "@simplix-react/headless";

/** How long one step of {@link usePageOpenedAt}'s clock is: a minute, so two reads in one minute share a key. */
const OPENED_AT_STEP_MS = 60_000;

/**
 * The moment the page opened, to the minute, held for as long as the page stays open.
 *
 * <p>A figure counted over "the last seven days" and the filter its press writes must name one
 * window while the reader works; a window recomputed on every render moves under them, and its
 * reads never share a cache key.
 *
 * @returns the minute the page opened
 */
export function usePageOpenedAt(): Date {
  const [opened] = useState(() => new Date(Math.floor(Date.now() / OPENED_AT_STEP_MS) * OPENED_AT_STEP_MS));
  return opened;
}

/** The windows {@link useZoneRange} computes in the installation's zone. */
export type ZoneRangeKind = "day" | "week" | "month" | "lastDays";

/**
 * Today, this week, this month or the last `n` days in the installation's zone, as the instants
 * that bound it. The range is computed again when the zone changes or the zone's day turns over, and
 * held otherwise, so a read keyed by it keeps its key for the day.
 *
 * @param kind which window
 * @param n how many days `lastDays` reaches back, today included; ignored by the other kinds
 * @returns the window's first instant and the instant after its end
 */
export function useZoneRange(kind: ZoneRangeKind, n = 1): { readonly from: string; readonly to: string } {
  const zone = useAppTimeZone();
  const day = zoneCalendarDate(zone);
  return useMemo(() => {
    switch (kind) {
      case "week":
        return zoneWeekRange(zone);
      case "month":
        return zoneMonthRange(zone);
      case "lastDays":
        return zoneLastDaysRange(zone, n);
      default:
        return zoneDayRange(zone);
    }
    // The day is a dependency on purpose: the window moves when the zone's day turns over.
  }, [kind, n, zone, day]);
}
