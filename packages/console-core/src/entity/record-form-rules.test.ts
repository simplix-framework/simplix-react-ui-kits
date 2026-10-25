import { describe, expect, it } from "vitest";
import type { EntitySearch } from "@simplix-react/ui";

import { emptyRow, fieldShown, formFieldErrors, initialFieldValue, isRangeOutOfOrder, requiredProgress, validateField } from "./record-form-rules";
import type { RecordFormField } from "./record-form-types";

const base = { key: "k", label: "L", required: true } as const;
const search: EntitySearch = { options: [], loading: false, hasMore: false, onSearch: () => {} };

describe("validateField per kind", () => {
  const cases: readonly [RecordFormField, unknown, unknown][] = [
    [{ ...base, kind: "text" }, "  ", "a"],
    [{ ...base, kind: "number" }, null, 0],
    [{ ...base, kind: "multi", options: [] }, [], ["a"]],
    [{ ...base, kind: "datetime", zone: "Asia/Seoul" }, "", "2026-01-01T00:00:00+09:00"],
    [{ ...base, kind: "time" }, null, "09:30"],
    [{ ...base, kind: "month" }, "", "2026-03"],
    [{ ...base, kind: "range", granularity: "date" }, { from: "2026-01-01" }, { from: "2026-01-01", to: "2026-01-02" }],
    [{ ...base, kind: "check" }, null, false],
    [{ ...base, kind: "reference", search }, "", "id-1"],
    [{ ...base, kind: "referenceMulti", search }, [], ["id-1"]],
    [{ ...base, kind: "signature", role: "R" }, null, { name: "n", at: "2026-01-01T00:00:00Z" }],
    [{ ...base, kind: "checkPair", editable: "verified", sideLabels: ["a", "b"] }, { performed: true, verified: null }, { performed: null, verified: false }],
    [{ ...base, kind: "verdict", labels: ["g", "b", "n"] }, { value: null }, { value: "GOOD" }],
    [{ ...base, kind: "choiceWithDetail", options: [], otherValue: "OTHER" }, { choice: null }, { choice: "A" }],
    [{ ...base, kind: "repeat", columns: [], initialRows: 0 }, [], [{}]],
  ];
  for (const [field, empty, filled] of cases) {
    it(`${field.kind}: empty is refused, filled passes`, () => {
      expect(validateField(field, empty)).not.toBeNull();
      expect(validateField(field, filled)).toBeNull();
      expect(validateField({ ...field, required: false } as RecordFormField, empty)).toBeNull();
    });
  }

  it("switch is never missing", () => {
    expect(validateField({ ...base, kind: "switch" }, false)).toBeNull();
  });

  it("range out of order is refused even when optional", () => {
    const field: RecordFormField = { ...base, required: false, kind: "range", granularity: "datetime" };
    expect(validateField(field, { from: "2026-01-02T00:00:00Z", to: "2026-01-01T00:00:00Z" })).toBe("rangeOrder");
    expect(validateField(field, { from: "2026-01-01T00:00:00Z", to: "2026-01-01T00:00:00Z" })).toBe("rangeOrder");
    expect(isRangeOutOfOrder({ from: "2026-01-01" })).toBe(false);
  });

  it("verdict not applicable needs a reason", () => {
    const field: RecordFormField = { ...base, required: false, kind: "verdict", labels: ["g", "b", "n"] };
    expect(validateField(field, { value: "NOT_APPLICABLE", note: " " })).toBe("noteRequired");
    expect(validateField(field, { value: "NOT_APPLICABLE", note: "closed" })).toBeNull();
  });

  it("the other choice needs a detail", () => {
    const field: RecordFormField = { ...base, required: false, kind: "choiceWithDetail", options: [], otherValue: "OTHER" };
    expect(validateField(field, { choice: "OTHER" })).toBe("detailRequired");
    expect(validateField(field, { choice: "OTHER", detail: "x" })).toBeNull();
  });

  it("checkPair with no editable side is never missing", () => {
    expect(validateField({ ...base, kind: "checkPair", editable: "none", sideLabels: ["a", "b"] }, { performed: null, verified: null })).toBeNull();
  });

  it("attachment needs every requested evidence kind held", () => {
    const field: RecordFormField = { ...base, kind: "attachment", evidenceKinds: ["photo", "plan"] };
    const photo = { id: "1", kind: "photo", label: "p", provenance: "", evidenceKind: "photo" } as const;
    expect(validateField(field, [photo])).toBe("evidenceMissing");
    expect(validateField(field, [photo, { ...photo, id: "2", evidenceKind: "plan", state: "failed" }])).toBe("evidenceMissing");
    expect(validateField(field, [photo, { ...photo, id: "2", evidenceKind: "plan" }])).toBeNull();
    expect(validateField({ ...field, evidenceKinds: [] }, [])).toBe("required");
  });

  it("repeat refuses a row with an empty required sub-field", () => {
    const field: RecordFormField = { ...base, required: false, kind: "repeat", initialRows: 2, columns: [{ key: "a", label: "A", kind: "text", required: true }] };
    expect(validateField(field, [{ a: "x" }, { a: "" }])).toBe("rowIncomplete");
    expect(validateField(field, [{ a: "x" }])).toBeNull();
  });
});

describe("initial values", () => {
  it("repeat starts with initialRows empty rows", () => {
    const columns: RecordFormField[] = [{ key: "a", label: "A", kind: "check" }];
    expect(initialFieldValue({ ...base, kind: "repeat", columns, initialRows: 2 })).toEqual([{ a: null }, { a: null }]);
    expect(emptyRow(columns)).toEqual({ a: null });
  });

  it("formFieldErrors keys refused fields in drawing order", () => {
    const sections = [{ key: "s", fields: [{ ...base, key: "b", kind: "text" } as RecordFormField, { ...base, key: "a", kind: "check" } as RecordFormField] }];
    expect(Object.keys(formFieldErrors(sections, { b: "", a: null }))).toEqual(["b", "a"]);
  });
});

describe("fieldShown", () => {
  const reason = { key: "reason", label: "적용 제외 사유", kind: "text" as const, required: true, shownWhen: { field: "decision", is: ["허가 제외"] } };
  const sections = [{ key: "s", title: "", fields: [{ key: "decision", label: "판정", kind: "text" as const, required: true }, reason] }];
  it("asks for a field only while the field it names holds one of its values", () => {
    expect(fieldShown(reason, { decision: "허가 필요" })).toBe(false);
    expect(fieldShown(reason, { decision: "허가 제외" })).toBe(true);
    expect(formFieldErrors(sections, { decision: "허가 필요" })).toEqual({});
    expect(Object.keys(formFieldErrors(sections, { decision: "허가 제외" }))).toEqual(["reason"]);
    expect(requiredProgress(sections, { decision: "허가 필요" })).toEqual({ total: 1, filled: 1 });
  });
});
