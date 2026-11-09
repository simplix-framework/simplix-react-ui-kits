import { describe, expect, it } from "vitest";

import { ClientRefusal, isClientRefusal, refusalOf } from "./record-form";

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

  it("says the server refused what the server answered", () => {
    expect(refusalOf(validation, ["roleCode"]).source).toBe("server");
    expect(refusalOf(new Error("The operation could not be completed"), ["roleCode"]).source).toBe("server");
  });

  it("says the page's own check refused what it raised before any request", () => {
    const refusal = refusalOf(new ClientRefusal([{ field: "roleCode", message: "Required" }]), ["roleCode"]);
    expect(refusal.source).toBe("client");
    expect(refusal.fields).toEqual({ roleCode: "Required" });
  });

  it("reads the marker and not the class, so a second copy of the package is read the same", () => {
    expect(isClientRefusal(Object.assign(new Error("x"), { clientCheck: true, errors: [] }))).toBe(true);
    expect(isClientRefusal(new Error("x"))).toBe(false);
    expect(isClientRefusal(undefined)).toBe(false);
  });
});
