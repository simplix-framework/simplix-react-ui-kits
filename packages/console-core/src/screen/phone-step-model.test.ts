import { describe, expect, it } from "vitest";

import type { RecordFormSection } from "../entity/record-form-types";
import { firstIncompleteStep, orderTasksByDue, stepErrors, submitOutcome, type ValidatableStep } from "./phone-step-model";

describe("orderTasksByDue", () => {
  it("puts the earliest due first and undated or unparseable tasks last, keeping ties in order", () => {
    const tasks = [
      { key: "none", due: undefined },
      { key: "late", due: "2026-10-24T15:00:00Z" },
      { key: "bad", due: "not a time" },
      { key: "early", due: "2026-10-24T09:00:00Z" },
      { key: "late2", due: "2026-10-24T15:00:00Z" },
    ];
    expect(orderTasksByDue(tasks).map((task) => task.key)).toEqual(["early", "late", "late2", "none", "bad"]);
  });

  it("does not reorder the input array", () => {
    const tasks = [{ due: "2026-10-24T15:00:00Z" }, { due: "2026-10-24T09:00:00Z" }];
    orderTasksByDue(tasks);
    expect(tasks[0]?.due).toBe("2026-10-24T15:00:00Z");
  });
});

const signSections: RecordFormSection[] = [
  { key: "s", fields: [{ kind: "signature", key: "sign", label: "Sign", role: "worker", required: true }] },
];
const reportSections: RecordFormSection[] = [{ key: "r", fields: [{ kind: "textarea", key: "note", label: "Note" }] }];
const measure: ValidatableStep = {
  key: "measure",
  measurement: { analytes: [{ key: "o2" }], positions: [{ key: "top" }, { key: "bottom" }], required: true },
};
const steps: ValidatableStep[] = [{ key: "sign", sections: signSections }, measure, { key: "report", sections: reportSections }];

describe("stepErrors", () => {
  it("refuses a required field left empty", () => {
    expect(stepErrors(steps[0]!, { sign: null }, {})).toEqual({ sign: "required" });
    expect(stepErrors(steps[0]!, { sign: { name: "A", at: "2026-10-24T09:00:00Z" } }, {})).toEqual({});
  });

  it("refuses a blank required reading but accepts a zero", () => {
    expect(stepErrors(measure, {}, { "o2:top": 0, "o2:bottom": null })).toEqual({ "o2:bottom": "measurementMissing" });
    expect(stepErrors(measure, {}, { "o2:top": 0, "o2:bottom": 20.9 })).toEqual({});
  });

  it("does not ask for readings of an optional measurement", () => {
    expect(stepErrors({ ...measure, measurement: { ...measure.measurement!, required: false } }, {}, {})).toEqual({});
  });
});

describe("firstIncompleteStep and submitOutcome", () => {
  const signed = { sign: { name: "A", at: "2026-10-24T09:00:00Z" } };
  const measured = { measure: { "o2:top": 20.9, "o2:bottom": 20.8 } };

  it("names the first step that refuses", () => {
    expect(firstIncompleteStep(steps, {}, measured)).toBe(0);
    expect(firstIncompleteStep(steps, signed, {})).toBe(1);
    expect(firstIncompleteStep(steps, signed, measured)).toBeNull();
  });

  it("refuses the submit at the first incomplete step, online or offline", () => {
    expect(submitOutcome(steps, signed, {}, true)).toEqual({ kind: "invalid", index: 1 });
  });

  it("completes online and completes as waiting to sync offline", () => {
    expect(submitOutcome(steps, signed, measured, false)).toEqual({ kind: "completed" });
    expect(submitOutcome(steps, signed, measured, true)).toEqual({ kind: "pendingSync" });
  });
});
