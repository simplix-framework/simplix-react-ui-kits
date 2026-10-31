import { describe, expect, it } from "vitest";

import { refusalOf } from "./record-form";

const validation = {
  data: {
    errorCode: "VAL_VALIDATION_FAILED",
    message: "Validation failed",
    errorDetail: [{ field: "roleCode", message: "Must start with a letter", label: "Role Code" }],
  },
};

describe("refusalOf", () => {
  it("puts a field error on the field it names and leaves the banner without a sentence", () => {
    const refusal = refusalOf(validation, ["roleCode", "roleNameI18n"]);
    expect(refusal.fields).toEqual({ roleCode: "Must start with a letter" });
    expect(refusal.labels).toEqual({ roleCode: "Role Code" });
    expect(refusal.message).toBeUndefined();
  });

  it("matches a plain field to the localized field it belongs to", () => {
    const error = { data: { errorDetail: [{ field: "roleName", message: "Too long" }] } };
    expect(refusalOf(error, ["roleNameI18n"]).fields).toEqual({ roleNameI18n: "Too long" });
  });

  it("keeps the server's sentence when no drawn field is named", () => {
    const refusal = refusalOf(new Error("The operation could not be completed"), ["roleCode"]);
    expect(refusal.message).toBe("The operation could not be completed");
    expect(refusal.fields).toEqual({});
  });
});
