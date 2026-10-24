import { useTranslation } from "@simplix-react/i18n/react";
import { useLocale } from "@simplix-react/i18n/react";
import { AlertBanner, Badge, Flex, Input, Stack, Text } from "@simplix-react/ui";
import { useAppTimeZone, zoneDateTimeText } from "@simplix-react/headless";
import { partAttributes } from "@simplix-react/ui/design";

import { RemainingText } from "../datetime/remaining-text";
import { SourceBadge, type SourceBadgeProps } from "../screen/source-badge";
import { gridEmptyMarkStyle, gridReadingInputStyle, gridReadingStyle } from "./grids.style";
import {
  measurementCellState,
  measurementSummary,
  nextDueState,
  parseReading,
  sampleKey,
  type MeasurementVerdict,
} from "./grid-cells";
import { PACKAGE_NAMESPACE } from "./locales";
import { Matrix, type MatrixCell, type MatrixRow } from "./matrix";
import { LabelledValue } from "./labelled-value";

/** One substance row, in the order the form lists it. */
export interface MeasurementAnalyte {
  /** A stable key the samples and verdicts are stored under. */
  readonly key: string;
  /** What the row is called. */
  readonly label: string;
  /** The unit a reading is given in. */
  readonly unit: string;
  /** The rule keys the verdicts for this row came from, shown under the label. */
  readonly ruleKeys: readonly string[];
}

/** One position column, in the order the form fixes. */
export interface MeasurementPosition {
  /** A stable key the samples and verdicts are stored under. */
  readonly key: string;
  /** What the column is called. */
  readonly label: string;
}

/** One measurement event. */
export interface MeasurementEvent {
  /** Why the measurement was taken, as the caller words it. */
  readonly trigger: string;
  /** When it was taken (an RFC 3339 instant). */
  readonly measuredAt?: string;
  /** Who took it. */
  readonly measurer?: string;
  /** Who signed it, as the caller words it. */
  readonly signature?: string;
  /** Readings by `analyte:position`; `null` is a cell nobody filled. */
  readonly samples: Readonly<Record<string, number | null>>;
}

/** Props for {@link MeasurementGrid}. */
export interface MeasurementGridProps {
  readonly analytes: readonly MeasurementAnalyte[];
  readonly positions: readonly MeasurementPosition[];
  readonly measurement: MeasurementEvent;
  /** Verdicts by `analyte:position`, computed by the caller from its rules. */
  readonly verdicts: Readonly<Record<string, MeasurementVerdict>>;
  /** When the next measurement is due (an RFC 3339 instant). */
  readonly nextDueAt?: string;
  /** Whether the measurement interval is held for interpretation; shows the hold instead of a time. */
  readonly intervalHeld?: boolean;
  /** Which layer set the rules behind the verdicts, drawn beside the next-due line. */
  readonly ruleSource?: SourceBadgeProps;
  /** Whether the cells take input. The caller decides (for example: the supervisor, before measuring). */
  readonly editable: boolean;
  /** Called with a cell's key and its new reading (`null` when cleared) while editable. */
  readonly onSampleChange?: (key: string, value: number | null) => void;
}

/**
 * One measurement event as a substance by position grid, with a verdict in every measured cell.
 *
 * <p><b>Held is never drawn as safe.</b> A reading the rule could not settle, or one no verdict has
 * reached, is tinted as a warning and labelled as held; only a settled safe verdict is drawn plain.
 *
 * <p><b>A blank cell is not zero.</b> It is drawn as not measured, and it counts toward no verdict.
 *
 * <p><b>An unsafe cell stops the work.</b> Any unsafe verdict puts a danger banner above the grid
 * saying work cannot continue or resume.
 */
export function MeasurementGrid({
  analytes,
  positions,
  measurement,
  verdicts,
  nextDueAt,
  intervalHeld = false,
  ruleSource,
  editable,
  onSampleChange,
}: MeasurementGridProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/grids`);
  const locale = useLocale();
  const zone = useAppTimeZone();

  const summary = measurementSummary(
    analytes.map((a) => a.key),
    positions.map((p) => p.key),
    measurement.samples,
    verdicts,
  );
  const due = nextDueState(nextDueAt, intervalHeld);

  const rows: MatrixRow[] = analytes.map((analyte) => ({
    key: analyte.key,
    label: (
      <Stack gap="none">
        <Text as="span" size="sm">
          {analyte.label} ({analyte.unit})
        </Text>
        {analyte.ruleKeys.length > 0 ? (
          <Text as="span" size="caption" tone="muted">
            {analyte.ruleKeys.join(" · ")}
          </Text>
        ) : null}
      </Stack>
    ),
    cells: positions.map((position): MatrixCell => {
      const key = sampleKey(analyte.key, position.key);
      const raw = measurement.samples[key];
      const state = measurementCellState(raw, verdicts[key]);
      const input = editable ? (
        <Input
          type="text"
          inputMode="decimal"
          aria-label={`${analyte.label} ${position.label}`}
          defaultValue={raw === null || raw === undefined ? "" : String(raw)}
          onBlur={(event) => {
            const next = parseReading(event.currentTarget.value);
            if (next !== undefined && next !== (raw ?? null)) onSampleChange?.(key, next);
          }}
          {...partAttributes(gridReadingInputStyle, {})}
        />
      ) : null;

      if (state.kind === "empty") {
        return {
          value: input ?? (
            <Badge variant="outline" {...partAttributes(gridEmptyMarkStyle, {})}>
              {t("measurement.empty")}
            </Badge>
          ),
          tone: "muted",
        };
      }
      const reading = input ?? (
        <Text as="span" size="sm" {...partAttributes(gridReadingStyle, {})}>
          {state.value}
        </Text>
      );
      if (state.kind === "held") {
        return { value: reading, note: t("measurement.held"), tone: "warning" };
      }
      return state.verdict === "UNSAFE"
        ? { value: reading, note: t("measurement.unsafe"), tone: "danger" }
        : { value: reading, note: t("measurement.safe") };
    }),
  }));

  const measuredAt = zoneDateTimeText(zone, measurement.measuredAt, locale);

  return (
    <Stack gap="sm">
      {summary.unsafe > 0 ? (
        <AlertBanner
          tone="danger"
          title={t("measurement.unsafeTitle", { count: summary.unsafe })}
          subtitle={t("measurement.unsafeBody")}
        />
      ) : null}

      <Flex gap="md" wrap align="start">
        <LabelledValue label={t("measurement.trigger")}>{measurement.trigger}</LabelledValue>
        {measuredAt ? <LabelledValue label={t("measurement.measuredAt")}>{measuredAt}</LabelledValue> : null}
        {measurement.measurer ? (
          <LabelledValue label={t("measurement.measurer")}>{measurement.measurer}</LabelledValue>
        ) : null}
        {measurement.signature ? (
          <LabelledValue label={t("measurement.signature")}>{measurement.signature}</LabelledValue>
        ) : null}
        <LabelledValue label={t("measurement.nextDue")}>
          {due.kind === "held" ? (
            <Badge variant="outline">{t("measurement.nextDueHeld")}</Badge>
          ) : due.kind === "none" ? (
            t("measurement.nextDueNone")
          ) : (
            <RemainingText value={due.at} passedLabel={t("measurement.duePassed")} />
          )}
        </LabelledValue>
        {ruleSource ? <SourceBadge {...ruleSource} /> : null}
      </Flex>

      {summary.held > 0 ? (
        <Text size="caption" tone="muted">
          {t("measurement.heldCount", { count: summary.held })}
        </Text>
      ) : null}

      <Matrix corner={t("measurement.corner")} columns={positions.map((p) => p.label)} rows={rows} align="center" />
    </Stack>
  );
}
