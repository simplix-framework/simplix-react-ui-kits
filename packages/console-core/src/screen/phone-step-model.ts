import { formFieldErrors, type FieldErrorCode } from "../entity/record-form-rules";
import type { RecordFormSection } from "../entity/record-form-types";
import { sampleKey } from "../layout/grid-cells";

/** One task as far as ordering needs it. */
export interface OrderableTask {
  /** When it is due (an RFC 3339 instant); absent or unparseable sorts after every dated task. */
  readonly due?: string;
}

/**
 * Today's tasks in the order a field worker takes them: the earliest due first.
 *
 * <p>A task with no due time, or one that does not parse, goes after every dated task, and tasks
 * with the same due time keep the order the caller gave them.
 *
 * @param tasks - The tasks, in the caller's order.
 * @returns A new array, ordered by due time.
 */
export function orderTasksByDue<T extends OrderableTask>(tasks: readonly T[]): T[] {
  const at = (task: T): number => {
    const time = task.due ? Date.parse(task.due) : Number.NaN;
    return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
  };
  return tasks
    .map((task, index) => ({ task, index, time: at(task) }))
    .sort((a, b) => (a.time === b.time ? a.index - b.index : a.time < b.time ? -1 : 1))
    .map((entry) => entry.task);
}

/** The cells a measurement step asks for. */
export interface StepMeasurementCells {
  readonly analytes: readonly { readonly key: string }[];
  readonly positions: readonly { readonly key: string }[];
  /** Whether every cell has to hold a reading before the step is complete. */
  readonly required?: boolean;
}

/** One step as far as validation needs it. */
export interface ValidatableStep {
  readonly key: string;
  readonly sections?: readonly RecordFormSection[];
  readonly measurement?: StepMeasurementCells;
}

/** Why a step refuses what it holds: a field's own error, or a measurement cell left blank. */
export type StepErrorCode = FieldErrorCode | "measurementMissing";

/**
 * Every refusal of one step, keyed by field key or by measurement cell key, in drawing order.
 *
 * <p>A blank reading is not zero: a required measurement cell holding `null` or nothing refuses
 * the step as `measurementMissing`.
 *
 * @param step - The step.
 * @param values - The field values, keyed by field key across every step.
 * @param samples - The readings, keyed by `analyte:position`.
 * @returns The refused fields and cells with their codes.
 */
export function stepErrors(
  step: ValidatableStep,
  values: Readonly<Record<string, unknown>>,
  samples: Readonly<Record<string, number | null>>,
): Readonly<Record<string, StepErrorCode>> {
  const errors: Record<string, StepErrorCode> = { ...formFieldErrors(step.sections ?? [], values) };
  const measurement = step.measurement;
  if (measurement?.required) {
    for (const analyte of measurement.analytes)
      for (const position of measurement.positions) {
        const key = sampleKey(analyte.key, position.key);
        const value = samples[key];
        if (value === null || value === undefined || Number.isNaN(value)) errors[key] = "measurementMissing";
      }
  }
  return errors;
}

/** Readings of every measurement step, keyed by step key and then by `analyte:position`. */
export type StepSamples = Readonly<Record<string, Readonly<Record<string, number | null>>>>;

/**
 * The first step that refuses what it holds, or null when every step is complete.
 *
 * @param steps - The steps, in order.
 * @param values - The field values across every step.
 * @param samples - The readings of every step, by step key.
 * @returns The index of the first incomplete step, or null.
 */
export function firstIncompleteStep(
  steps: readonly ValidatableStep[],
  values: Readonly<Record<string, unknown>>,
  samples: StepSamples,
): number | null {
  const index = steps.findIndex((step) => Object.keys(stepErrors(step, values, samples[step.key] ?? {})).length > 0);
  return index === -1 ? null : index;
}

/** Where a stepped input stands. */
export type PhoneStepPhase =
  /** Still being filled in. */
  | { readonly kind: "editing"; readonly index: number }
  /** Submitted and accepted. */
  | { readonly kind: "completed" }
  /** Submitted while offline: complete on screen, waiting to be sent. */
  | { readonly kind: "pendingSync" };

/** What pressing the final submit leads to. */
export type PhoneSubmitOutcome =
  /** A step refuses: go to it and show its errors. */
  | { readonly kind: "invalid"; readonly index: number }
  | { readonly kind: "completed" }
  | { readonly kind: "pendingSync" };

/**
 * What the final submit does: refuse at the first incomplete step, or complete, and while offline
 * complete as waiting to sync rather than fail.
 *
 * @param steps - The steps, in order.
 * @param values - The field values across every step.
 * @param samples - The readings of every step, by step key.
 * @param offline - Whether the device is offline, as the caller knows it.
 * @returns The outcome.
 */
export function submitOutcome(
  steps: readonly ValidatableStep[],
  values: Readonly<Record<string, unknown>>,
  samples: StepSamples,
  offline: boolean,
): PhoneSubmitOutcome {
  const index = firstIncompleteStep(steps, values, samples);
  if (index !== null) return { kind: "invalid", index };
  return offline ? { kind: "pendingSync" } : { kind: "completed" };
}
