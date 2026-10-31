import { describe, expect, it } from "vitest";

import { fieldEnumsOf } from "../entity/record-contract";
import { changeValueLabel, type ChangeValueReaders } from "./change-history";

const labels: Record<string, string> = {
  "BackgroundJobStatus.FAILED": "Failed",
  "BackgroundJobStatus.QUEUED": "Queued",
  "AuditAction.UPDATE": "Updated",
};

const readers: ChangeValueReaders = {
  enumLabel: (enumName, value) => labels[`${enumName}.${value}`] ?? `${enumName}.${value}`,
  nothing: "none",
  switched: (on) => (on ? "On" : "Off"),
  fieldEnums: fieldEnumsOf([
    { name: "status", kind: "enum", enumName: "BackgroundJobStatus" },
    { name: "lastError", kind: "text" },
  ]),
};

describe("a changed value's label", () => {
  it("resolves an enum the recorder names no catalogue for through the entity's field enums", () => {
    expect(changeValueLabel({ field: "status", value: "FAILED" }, readers)).toBe("Failed");
    expect(changeValueLabel({ field: "status", value: "QUEUED" }, readers)).toBe("Queued");
  });

  it("prefers the enum the recorder names over the field's", () => {
    expect(changeValueLabel({ field: "status", value: "UPDATE", valueEnum: "AuditAction" }, readers)).toBe("Updated");
  });

  it("leaves a field that is not an enum as its stored text", () => {
    expect(changeValueLabel({ field: "lastError", value: "FAILED" }, readers)).toBe("FAILED");
  });

  it("reads a switch and an empty side as words", () => {
    expect(changeValueLabel({ field: "enabled", value: "false" }, readers)).toBe("Off");
    expect(changeValueLabel({ field: "status" }, readers)).toBe("none");
  });

  it("prints the raw constant without the entity's field enums, which is the defect it closes", () => {
    expect(changeValueLabel({ field: "status", value: "FAILED" }, { ...readers, fieldEnums: undefined })).toBe("FAILED");
  });
});

describe("fieldEnumsOf", () => {
  it("keeps the fields that declare an enum, by name", () => {
    expect(fieldEnumsOf([{ name: "status", kind: "enum", enumName: "S" }, { name: "n", kind: "text" }])).toEqual({ status: "S" });
  });
});
