import { useTranslation } from "@simplix-react/i18n/react";
import { Badge, Card, Flex, Grid, Heading, Stack, Text } from "@simplix-react/ui";

import { calendarDayLabel, zoneCalendarDate, zoneLabel } from "../datetime";

/** What one screen's dates are read against. */
export interface TimeBasis {
  /** The workplace's own zone — never the browser's. */
  readonly zone: string | undefined;
  /** The shift the business day is counted from, when one is set. */
  readonly shiftName: string | undefined;
  /** Its clock, as `08:00` and `17:00`. */
  readonly shiftStart: string | undefined;
  readonly shiftEnd: string | undefined;
  /** Which end of a shift that crosses midnight a record belongs to. */
  readonly businessDayBasis: string | undefined;
}

/**
 * The `yyyy-MM-dd (요일)` of now, read in a zone rather than in the browser's.
 *
 * @param zone the workplace's zone, or undefined before one is chosen
 * @param locale what to name the weekday in
 * @returns the day and its weekday, or undefined when no zone is known
 */
export function zoneToday(zone: string | undefined, locale: string): string | undefined {
  if (!zone) return undefined;
  return calendarDayLabel(zoneCalendarDate(zone), locale, "iso");
}

interface TimeBasisStripProps {
  readonly basis: TimeBasis;
}

/**
 * 시간 기준 표시 (P-19) — what 「오늘」 means on the screen this sits on.
 *
 * <p><b>「오늘」 is a fact about the workplace, not about the reader's clock.</b> A deadline read in
 * the browser's zone is a day out at an overseas workplace, and a deadline a day out is a deadline
 * missed — so the zone and the business day are named on screen rather than assumed.
 *
 * <p><b>A shift that crosses midnight belongs to one day.</b> Work that starts at 22:00 and ends at
 * 06:00 split across two dates matches neither the handover nor the permit's validity, so the strip
 * says which end it is counted from.
 *
 * <p><b>Switching workplace changes the basis, and the change is visible.</b> The same list reading
 * a different date at another workplace is correct rather than broken, and the reader has to be
 * able to see why.
 *
 * <p><b>The statutory clock is the exception.</b> A deadline counted in minutes runs on absolute
 * time, so it is named apart from the two chips above it rather than folded in with them.
 */
export function TimeBasisStrip({ basis }: TimeBasisStripProps) {
  const { t, locale } = useTranslation("common");
  const today = zoneToday(basis.zone, locale);

  return (
    <Flex gap="sm" align="center" wrap>
      {today && <Badge variant="outline">{t("timeBasis.today", { day: today })}</Badge>}
      {basis.zone && <Badge variant="outline">{zoneLabel(basis.zone, new Date())}</Badge>}
      {basis.shiftName && (
        <Badge variant="outline">
          {basis.shiftStart && basis.shiftEnd
            ? t("timeBasis.shiftClock", {
                shift: basis.shiftName,
                start: basis.shiftStart,
                end: basis.shiftEnd,
              })
            : basis.shiftName}
        </Badge>
      )}
      {basis.businessDayBasis && (
        <Badge variant="outline">{t("timeBasis.basis", { basis: basis.businessDayBasis })}</Badge>
      )}
    </Flex>
  );
}

/**
 * The three things that decide a date on this screen, spelled out (P-19).
 *
 * <p>Drawn where the basis is being set rather than merely used, so the person changing it can see
 * everything the change reaches.
 */
export function TimeBasisCards({ basis }: TimeBasisStripProps) {
  const { t } = useTranslation("common");

  return (
    <Grid columns={3} gap="md">
      <Card padding="sm">
        <Stack gap="xs">
          <Heading level={6}>{t("timeBasis.zoneTitle")}</Heading>
          <Text size="caption" tone="muted">
            {t("timeBasis.zoneBody")}
          </Text>
          <Flex>
            <Badge variant="outline">
              {basis.zone ? zoneLabel(basis.zone, new Date()) : t("timeBasis.zoneUnset")}
            </Badge>
          </Flex>
        </Stack>
      </Card>
      <Card padding="sm">
        <Stack gap="xs">
          <Heading level={6}>{t("timeBasis.businessDayTitle")}</Heading>
          <Text size="caption" tone="muted">
            {t("timeBasis.businessDayBody")}
          </Text>
          <Flex>
            <Badge variant="outline">
              {basis.shiftName && basis.shiftStart && basis.shiftEnd
                ? t("timeBasis.shiftClock", {
                    shift: basis.shiftName,
                    start: basis.shiftStart,
                    end: basis.shiftEnd,
                  })
                : t("timeBasis.businessDayUnset")}
            </Badge>
          </Flex>
        </Stack>
      </Card>
      <Card padding="sm">
        <Stack gap="xs">
          <Heading level={6}>{t("timeBasis.legalClockTitle")}</Heading>
          <Text size="caption" tone="muted">
            {t("timeBasis.legalClockBody")}
          </Text>
          <Flex>
            <Badge variant="outline">{t("timeBasis.legalClockValue")}</Badge>
          </Flex>
        </Stack>
      </Card>
    </Grid>
  );
}
