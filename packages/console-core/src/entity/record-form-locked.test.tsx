import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { RecordFieldView } from "./record-form-fields";
import { fieldDescription, requiredProgress } from "./record-form-rules";
import type { RecordFormField } from "./record-form-types";

/** A budget form whose month is fixed once the period exists, and whose limit is open. */
const month = { key: "period", label: "Month", kind: "month", required: true, disabled: "The month is fixed once the period exists." } as RecordFormField;
const limit = { key: "limitMicros", label: "Limit", kind: "text", required: true } as RecordFormField;
const sections = [{ key: "s", fields: [month, limit] }];

describe("a required field disabled with a reason", () => {
  it("draws its reason under itself, where a reader sees it without a pointer", () => {
    const out = renderToStaticMarkup(createElement(UIProvider, { children: createElement(RecordFieldView, { field: month, value: "2026-11", onChange: () => undefined }) }));
    expect(out).toContain("The month is fixed once the period exists.");
  });

  it("is counted with the required fields its mark puts it among, filled while it holds its value", () => {
    expect(requiredProgress(sections, { period: "2026-11", limitMicros: "" })).toEqual({ total: 2, filled: 1 });
    expect(requiredProgress(sections, { period: "2026-11", limitMicros: "5" })).toEqual({ total: 2, filled: 2 });
  });
});

describe("a row field disabled with a reason", () => {
  const row = {
    key: "reading",
    label: "Reading",
    kind: "row",
    columns: [{ key: "value", label: "Value" }],
    hint: "One value per line.",
    disabled: "The reading is closed once the round is signed.",
  } as RecordFormField;
  const draw = (field: RecordFormField) => renderToStaticMarkup(createElement(UIProvider, { children: createElement(RecordFieldView, { field, value: {}, onChange: () => undefined }) }));

  it("draws its reason, then its hint, under the cells like every other kind", () => {
    const out = draw(row);
    expect(out).toContain("The reading is closed once the round is signed. One value per line.");
    expect(out.indexOf("<input")).toBeLessThan(out.indexOf("The reading is closed"));
    expect(out).toContain("disabled");
  });

  it("draws no reason for a row that is only disabled, and none for an open one", () => {
    expect(draw({ ...row, disabled: true })).not.toContain("is closed once");
    expect(draw({ ...row, disabled: undefined })).not.toContain("is closed once");
  });
});

describe("fieldDescription", () => {
  it("leads with the reason a field is locked and keeps what it says otherwise", () => {
    expect(fieldDescription("Fixed.", "Pick the month.")).toBe("Fixed. Pick the month.");
    expect(fieldDescription(true, "Pick the month.")).toBe("Pick the month.");
    expect(fieldDescription(false, undefined)).toBeUndefined();
    expect(fieldDescription("", "")).toBeUndefined();
  });
});
