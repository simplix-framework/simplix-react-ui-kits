import { describe, expect, it } from "vitest";
import type { EntityFacet } from "@simplix-react/ui";

import { recordFilterOf, type ContractFilter } from "./record-contract";
import { filterDef } from "./record-list";

const facet: EntityFacet = {
  options: [{ label: "Minji · minji", value: "u-1" }],
  loading: false,
  selectedOptions: [{ label: "Joon · joon", value: "u-2" }],
  onSearch: () => undefined,
};
const enumLabel = (_enum: string, value: string) => value;
const reference: ContractFilter = { kind: "reference", field: "userId" };

describe("a filter over the key of another record", () => {
  it("offers the referenced records by name through the facet the screen supplies", () => {
    const filter = recordFilterOf(reference, "User", enumLabel, { userId: facet });
    expect(filter).toEqual({ kind: "entity", field: "userId", label: "User", facet });
  });

  it("is left out where the screen supplies no facet, instead of asking for a raw id", () => {
    expect(recordFilterOf(reference, "User", enumLabel, undefined)).toBeUndefined();
    expect(recordFilterOf(reference, "User", enumLabel, { teamId: facet })).toBeUndefined();
  });

  it("is a server-searched faceted filter, whose picked values keep their names", () => {
    const def = filterDef({ kind: "entity", field: "userId", label: "User", facet });
    expect(def).toMatchObject({
      type: "faceted",
      field: "userId",
      multiSelect: true,
      display: "dropdown",
      options: facet.options,
      selectedOptions: facet.selectedOptions,
      onSearch: facet.onSearch,
      loading: false,
    });
  });

  it("leaves the other kinds as they were", () => {
    expect(recordFilterOf({ kind: "toggle", field: "pinned" }, "Pinned", enumLabel)).toEqual({ kind: "toggle", field: "pinned", label: "Pinned" });
    expect(recordFilterOf({ kind: "choice", field: "type", options: ["HR"] }, "Type", enumLabel)).toEqual({
      kind: "choice",
      field: "type",
      label: "Type",
      options: [{ value: "HR", label: "HR" }],
    });
  });
});
