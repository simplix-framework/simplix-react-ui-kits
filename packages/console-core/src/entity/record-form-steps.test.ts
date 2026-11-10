import { describe, expect, it } from "vitest";

import { reviewTextOf } from "./record-form-steps";
import type { RecordFormField } from "./record-form-types";

/** The words stand in as their keys, which is what a test of the mapping needs to read. */
const t = (key: string, values?: Record<string, string | number | boolean>) => (values ? `${key}:${JSON.stringify(values)}` : key);
const read = (field: RecordFormField, value: unknown, locale = "en") => reviewTextOf(field, value, { t }, locale);

const base = { key: "k", label: "K" };

describe("reviewTextOf", () => {
  it("names the option a select or a radio holds, and keeps an unknown value as it is", () => {
    const options = [{ value: "A", label: "Alpha" }, { value: "B", label: "Beta" }];
    expect(read({ ...base, kind: "select", options }, "B")).toBe("Beta");
    expect(read({ ...base, kind: "radio", options }, "A")).toBe("Alpha");
    expect(read({ ...base, kind: "select", options }, "Z")).toBe("Z");
  });

  it("names every option a multi-select holds, in the order picked", () => {
    const options = [{ value: "A", label: "Alpha" }, { value: "B", label: "Beta" }];
    expect(read({ ...base, kind: "multi", options }, ["B", "A"])).toBe("Beta, Alpha");
  });

  it("names a picked record through the options its search holds, and falls back to the value", () => {
    const search = { options: [{ value: "u1", label: "Ada" }], loading: false, hasMore: false, onSearch: () => undefined };
    expect(read({ ...base, kind: "reference", search }, "u1")).toBe("Ada");
    expect(read({ ...base, kind: "reference", search }, "u9")).toBe("u9");
    expect(read({ ...base, kind: "referenceMulti", search }, ["u1", "u9"])).toBe("Ada, u9");
  });

  it("says not set for an empty value and never for a switch that was left off", () => {
    expect(read({ ...base, kind: "text" }, "")).toBe("recordForm.notSet");
    expect(read({ ...base, kind: "text" }, "   ")).toBe("recordForm.notSet");
    expect(read({ ...base, kind: "multi", options: [] }, [])).toBe("recordForm.notSet");
    expect(read({ ...base, kind: "switch" }, false)).toBe("recordForm.no");
    expect(read({ ...base, kind: "switch" }, true)).toBe("recordForm.yes");
    expect(read({ ...base, kind: "check" }, null)).toBe("recordForm.notSet");
    expect(read({ ...base, kind: "check" }, false)).toBe("recordForm.no");
  });

  it("never shows a password and says that one was entered", () => {
    expect(read({ ...base, kind: "password" }, "s3cret")).toBe("recordForm.entered");
    expect(read({ ...base, kind: "password" }, "")).toBe("recordForm.notSet");
  });

  it("reads a per-language text in the reader's language, else in the first language that has one", () => {
    const field: RecordFormField = { ...base, kind: "i18nText" };
    expect(read(field, { en: "Hello", ko: "안녕" }, "ko")).toBe("안녕");
    expect(read(field, { en: "", ko: "안녕" }, "en")).toBe("안녕");
  });

  it("writes a number with its unit and a period with both ends", () => {
    expect(read({ ...base, kind: "number", unit: "days" }, 7)).toBe("7 days");
    expect(read({ ...base, kind: "range", granularity: "date" }, { from: "2026-01-01", to: "2026-02-01" })).toBe("2026-01-01 ~ 2026-02-01");
  });
});
