import { describe, expect, it } from "vitest";

import { pickFields, pickFilters } from "./contract-pick";
import type { ContractField, ContractFilter } from "./record-contract";

const fields: ContractField[] = [
  { name: "id", kind: "text" },
  { name: "status", kind: "text" },
  { name: "createdAt", kind: "instant" },
  { name: "note", kind: "text" },
];

describe("pickFields", () => {
  it("returns the named fields in the order named, leaving out the ones not named", () => {
    expect(pickFields(fields, ["createdAt", "id"]).map((field) => field.name)).toEqual(["createdAt", "id"]);
  });

  it("skips a name the contract does not carry", () => {
    expect(pickFields(fields, ["status", "gone", "note"]).map((field) => field.name)).toEqual(["status", "note"]);
  });

  it("lets the first entry of a name win, so a screen's own description of a field leads the generated one", () => {
    const own: ContractField = { name: "status", kind: "enum", enumName: "Status" };
    expect(pickFields([own, ...fields], ["status"])).toEqual([own]);
  });

  it("returns nothing for no names and for no fields", () => {
    expect(pickFields(fields, [])).toEqual([]);
    expect(pickFields([], ["id"])).toEqual([]);
  });

  it("keeps the type of the entries it was given", () => {
    const withExtra = [{ name: "id", kind: "text" as const, extra: 1 }];
    expect(pickFields(withExtra, ["id"])[0]?.extra).toBe(1);
  });
});

describe("pickFilters", () => {
  const filters: ContractFilter[] = [
    { kind: "toggle", field: "enabled" },
    { kind: "dateRange", field: "createdAt" },
    { kind: "choice", field: "status", options: ["A", "B"] },
  ];

  it("returns the filters on the named fields in the order named, skipping a field without one", () => {
    expect(pickFilters(filters, ["status", "missing", "enabled"]).map((filter) => filter.field)).toEqual(["status", "enabled"]);
  });
});
