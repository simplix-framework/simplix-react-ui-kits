import { useState, type ComponentProps } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { AlertBanner, Flex, Heading, Stack, StatusBadge, Text } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { EvidenceGrid } from "../attachment/evidence-grid";
import type { RecordSection } from "../entity/record-detail";
import { RecordFormSections, useRecordFormValues } from "../entity/record-form";
import type { RecordFormSection } from "../entity/record-form-types";
import type { RecordVerb } from "../entity/record-blocks";
import { RecordValueView } from "../entity/record-value";
import { LabelledValue } from "../layout/labelled-value";
import { MeasurementGrid, type MeasurementGridProps } from "../layout/measurement-grid";
import {
  ConsolePhoneShell,
  PhoneActionBar,
  PhoneButton,
  PhoneEmptyState,
  PhoneScreenBody,
  PhoneScreenColumn,
  PhoneScrollArea,
  type ConsolePhoneShellProps,
} from "../shell/phone-shell";
import { PACKAGE_NAMESPACE } from "./locales";
import { stepErrors, submitOutcome, type PhoneStepPhase, type StepSamples } from "./phone-step-model";
import {
  phoneStepDangerStyle,
  phoneStepHeaderStyle,
  phoneStepLinkStyle,
  phoneStepLinkSubStyle,
  phoneStepSegmentStyle,
  phoneStepTitleStyle,
} from "./phone-step.style";

/** A measurement a step takes, drawn as the existing grid with its cells editable. */
export interface PhoneStepMeasurement extends Omit<MeasurementGridProps, "editable" | "onSampleChange"> {
  /** Whether every cell has to hold a reading before the step is complete. */
  readonly required?: boolean;
}

/** One step of a {@link PhoneStep}. */
export interface PhoneStepDefinition {
  readonly key: string;
  /** What the step is called, such as 「서명」 or 「측정」. */
  readonly title: string;
  /** What the step shows and does not edit: a form excerpt, the record being signed. */
  readonly content?: readonly RecordSection[];
  /** Evidence already attached, shown read-only above the fields. */
  readonly evidence?: Omit<ComponentProps<typeof EvidenceGrid>, "onRetry">;
  /** The step's fields, drawn with the kit's field kinds; keys are unique across every step. */
  readonly sections?: readonly RecordFormSection[];
  /** The step's measurement, when the step is one. */
  readonly measurement?: PhoneStepMeasurement;
  /** A grave request the step offers apart from its fields, drawn as a large red button. */
  readonly danger?: PhoneStepDanger;
  /**
   * Where the worker can go from the step instead of finishing it (「작업중지 요청」 from an unsafe
   * reading, 「출조 기록」 for those inside), drawn under the step's content.
   */
  readonly links?: readonly PhoneStepNext[];
}

/**
 * A grave request inside a step (「작업중지 요청」), drawn as its own red button at least 48px tall
 * rather than as one check among the fields, so it is found at a glance and pressed with a gloved
 * hand. Pressing it sets the boolean value `field` in the submission; pressing again clears it.
 */
export interface PhoneStepDanger {
  /** The submission value the button sets; not also listed among the step's fields. */
  readonly field: string;
  /** What the button says before it is pressed, such as 「작업중지 요청」. */
  readonly label: string;
  /** What it says once pressed, such as 「작업중지 요청함 · 취소하려면 다시 누르세요」. */
  readonly pressedLabel: string;
}

/** What a submitted stepped input hands back. */
export interface PhoneStepSubmission {
  /** Field values across every step, by field key. */
  readonly values: Readonly<Record<string, unknown>>;
  /** Readings of every measurement step, by step key and then by `analyte:position`. */
  readonly samples: StepSamples;
  /** Whether it was submitted offline and is waiting to sync. */
  readonly offline: boolean;
}

/** Props for {@link PhoneStep}. */
export interface PhoneStepProps {
  /** The phone shell the steps are drawn in: its title, tabs and active tab. */
  readonly shell: Omit<ConsolePhoneShellProps, "children">;
  /** The steps, in order. */
  readonly steps: readonly PhoneStepDefinition[];
  /** The final submit's label and, when it cannot be pressed, the reason. */
  readonly primary: Omit<RecordVerb, "onClick" | "kind">;
  /** Called once every step is complete. */
  readonly onSubmit: (submission: PhoneStepSubmission) => void;
  /** Whether the device is offline, as the caller knows it; an offline submit completes as waiting to sync. */
  readonly offline: boolean;
  /** Leaves the input from its first step; without it the first step has no back. */
  readonly back?: () => void;
  /** What the completed screen says, in place of the generic line. */
  readonly completedTitle?: string;
  /** What the worker does now, under the completed screen's title (「작업을 멈추고 현장 확인을 기다리세요」). */
  readonly completedBody?: string;
  /**
   * Where the worker goes from the completed screen: the next thing to do, and the way back to the
   * day's list. The first is drawn as the primary button. A plain address, for a host without a router.
   */
  readonly completedActions?: readonly PhoneStepNext[];
  /**
   * Where the input opens: a step's index (a story showing the signing step), or `done` for the
   * completed screen. The first step when absent.
   */
  readonly startAt?: number | "done";
}

/** A way on from the completed screen. */
export interface PhoneStepNext {
  readonly label: string;
  readonly href: string;
  /** A line under the label: what the next thing is (「15:00 밀폐공간 특별교육 서명」). */
  readonly sub?: string;
  /** A way on that stops or escapes work (「작업중지 요청」), drawn in the danger tone. */
  readonly tone?: "danger";
}

/** Ways on from a step or the completed screen, each a thumb-sized link; the first is primary when asked. */
function PhoneStepLinks({ links, primaryFirst }: { readonly links: readonly PhoneStepNext[]; readonly primaryFirst: boolean }) {
  return (
    <Stack gap="sm">
      {links.map((next, at) => (
        <PhoneButton
          key={next.href + next.label}
          asChild
          variant={next.tone === "danger" ? "destructive" : at === 0 && primaryFirst ? "primary" : "outline"}
          className="h-auto min-h-11 w-full flex-col"
          {...partAttributes(phoneStepLinkStyle, {})}
        >
          <a href={next.href}>
            <span>{next.label}</span>
            {next.sub ? <span {...slotAttributes(phoneStepLinkSubStyle, {})}>{next.sub}</span> : null}
          </a>
        </PhoneButton>
      ))}
    </Stack>
  );
}

function initialSamples(steps: readonly PhoneStepDefinition[]): StepSamples {
  return Object.fromEntries(steps.flatMap((step) => (step.measurement ? [[step.key, { ...step.measurement.measurement.samples }]] : [])));
}

/**
 * An input on a phone, one step at a time (sign, measure, report).
 *
 * <p>Each step shows its header with progress, what it shows read-only, its evidence, its fields
 * and its measurement. Next refuses a step whose required fields or cells are empty and marks
 * them; the final submit checks every step and returns to the first one that refuses.
 *
 * <p><b>Offline is not a failure.</b> A submit made offline completes on screen with a
 * 「동기화 대기」 badge, so the worker knows it is kept and not yet sent.
 */
export function PhoneStep({ shell, steps, primary, onSubmit, offline, back, completedTitle, completedBody, completedActions = [], startAt }: PhoneStepProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const allSections = steps.flatMap((step) => step.sections ?? []);
  const form = useRecordFormValues(allSections);
  const [samples, setSamples] = useState<StepSamples>(() => initialSamples(steps));
  const [phase, setPhase] = useState<PhoneStepPhase>(startAt === "done" ? { kind: "completed" } : { kind: "editing", index: startAt ?? 0 });
  const [shown, setShown] = useState<ReadonlySet<number>>(new Set());

  if (phase.kind !== "editing") {
    return (
      <ConsolePhoneShell {...shell}>
        <PhoneScreenColumn>
          <PhoneScreenBody>
            <PhoneEmptyState
              title={completedTitle ?? t("phoneStep.completed")}
              body={[completedBody, phase.kind === "pendingSync" ? t("phoneStep.pendingSyncBody") : undefined].filter(Boolean).join(" ") || undefined}
            />
            {phase.kind === "pendingSync" && (
              <Flex justify="center">
                <StatusBadge tone="warning" label={t("phoneStep.pendingSync")} />
              </Flex>
            )}
            {completedActions.length > 0 && <PhoneStepLinks links={completedActions} primaryFirst />}
          </PhoneScreenBody>
        </PhoneScreenColumn>
      </ConsolePhoneShell>
    );
  }

  const index = phase.index;
  const step = steps[index];
  if (!step) throw new Error(`PhoneStep has no step at index ${index}`);
  const last = index === steps.length - 1;
  const stepSamples = samples[step.key] ?? {};
  const errors = stepErrors(step, form.values, stepSamples);
  const errorsShown = shown.has(index);
  const fieldKeys = new Set((step.sections ?? []).flatMap((section) => section.fields.map((field) => field.key)));
  const fieldErrors = Object.fromEntries(Object.entries(form.errors).filter(([key]) => fieldKeys.has(key)));
  const stepForm = { ...form, errors: fieldErrors, missing: Object.keys(fieldErrors), errorsShown };
  const missingCells = Object.values(errors).filter((code) => code === "measurementMissing").length;

  const show = (target: number) => setShown((current) => new Set(current).add(target));
  const go = (target: number) => setPhase({ kind: "editing", index: target });

  const next = () => {
    if (Object.keys(errors).length > 0) {
      show(index);
      return;
    }
    go(index + 1);
  };

  const submit = () => {
    const outcome = submitOutcome(steps, form.values, samples, offline);
    if (outcome.kind === "invalid") {
      show(outcome.index);
      go(outcome.index);
      return;
    }
    onSubmit({ values: form.values, samples, offline });
    setPhase({ kind: outcome.kind });
  };

  const previous = index > 0 ? () => go(index - 1) : back;

  return (
    <ConsolePhoneShell {...shell}>
      <PhoneScreenColumn>
        <Stack gap="xs" {...partAttributes(phoneStepHeaderStyle, {})}>
          <Flex align="center" justify="between" gap="sm">
            {/* Smaller than a screen title: the step names a part of the task, not the screen. */}
            <Heading level={2} {...partAttributes(phoneStepTitleStyle, {})}>
              {step.title}
            </Heading>
            <Text as="span" size="caption" tone="muted">
              {t("phoneStep.progress", { index: index + 1, count: steps.length })}
            </Text>
          </Flex>
          <Flex gap="xs" aria-hidden>
            {steps.map((item, position) => (
              <span key={item.key} {...slotAttributes(phoneStepSegmentStyle, { state: position < index ? "done" : position === index ? "current" : "upcoming" })} />
            ))}
          </Flex>
        </Stack>
        <PhoneScrollArea>
          <PhoneScreenBody>
            {(step.content ?? []).map((section) => (
              <Stack key={section.key} gap="xs">
                {section.title && (
                  <Heading level={3}>
                    {section.title}
                  </Heading>
                )}
                {section.fields.map((field) => (
                  <LabelledValue key={field.label} label={field.label}>
                    <RecordValueView value={field.value} />
                  </LabelledValue>
                ))}
              </Stack>
            ))}
            {step.links && step.links.length > 0 && <PhoneStepLinks links={step.links} primaryFirst={false} />}
            {step.evidence && <EvidenceGrid {...step.evidence} />}
            {step.danger && <PhoneDangerButton danger={step.danger} pressed={form.values[step.danger.field] === true} onPress={form.set} />}
            {step.sections && step.sections.length > 0 && <RecordFormSections sections={step.sections} form={stepForm} flat />}
            {step.measurement && (
              <>
                {errorsShown && missingCells > 0 && <AlertBanner tone="danger" bordered title={t("phoneStep.measurementMissing", { count: missingCells })} />}
                <MeasurementGrid
                  key={step.key}
                  {...step.measurement}
                  measurement={{ ...step.measurement.measurement, samples: stepSamples }}
                  editable
                  onSampleChange={(key, value) => setSamples((current) => ({ ...current, [step.key]: { ...current[step.key], [key]: value } }))}
                />
              </>
            )}
          </PhoneScreenBody>
        </PhoneScrollArea>
        <PhoneActionBar>
          <Flex gap="sm" className="w-full">
            {previous && (
              <PhoneButton type="button" variant="outline" className="flex-1" onClick={previous}>
                {t("phoneStep.back")}
              </PhoneButton>
            )}
            {last ? (
              <PhoneButton type="button" variant="primary" className="flex-1" onClick={submit} disabled={Boolean(primary.disabled)} title={primary.disabled}>
                {primary.label}
              </PhoneButton>
            ) : (
              <PhoneButton type="button" variant="primary" className="flex-1" onClick={next}>
                {t("phoneStep.next")}
              </PhoneButton>
            )}
          </Flex>
        </PhoneActionBar>
      </PhoneScreenColumn>
    </ConsolePhoneShell>
  );
}

/** A step's grave request as a large red button; pressed, it fills red and says so. */
function PhoneDangerButton({ danger, pressed, onPress }: { readonly danger: PhoneStepDanger; readonly pressed: boolean; readonly onPress: (field: string, value: boolean) => void }) {
  return (
    <PhoneButton
      type="button"
      variant={pressed ? "destructive" : "outline"}
      aria-pressed={pressed}
      className="min-h-12 w-full"
      {...partAttributes(phoneStepDangerStyle, {})}
      onClick={() => onPress(danger.field, !pressed)}
    >
      {pressed ? danger.pressedLabel : danger.label}
    </PhoneButton>
  );
}
